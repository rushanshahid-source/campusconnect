import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { reviews } from "../db/schema";
import { eq, desc } from "drizzle-orm";

export const reviewsRouter = createRouter({
  forUser: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(reviews)
        .where(eq(reviews.revieweeId, input.userId))
        .orderBy(desc(reviews.createdAt));
    }),

  create: authedQuery
    .input(z.object({
      revieweeId: z.number(),
      dealId: z.number().optional(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      return db.insert(reviews).values({
        ...input,
        reviewerId: ctx.user.id,
      });
    }),

  stats: publicQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const userReviews = await db
        .select()
        .from(reviews)
        .where(eq(reviews.revieweeId, input.userId));

      if (userReviews.length === 0) {
        return { average: 0, count: 0, distribution: [0, 0, 0, 0, 0] };
      }

      const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
      const distribution = [0, 0, 0, 0, 0];
      for (const r of userReviews) {
        distribution[r.rating - 1]++;
      }

      return {
        average: avgRating.toFixed(1),
        count: userReviews.length,
        distribution,
      };
    }),
});

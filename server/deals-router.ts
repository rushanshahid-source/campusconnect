import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { deals } from "../db/schema";
import { eq, desc, or } from "drizzle-orm";

export const dealsRouter = createRouter({
  list: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(deals)
      .where(
        or(
          eq(deals.buyerId, ctx.user.id),
          eq(deals.sellerId, ctx.user.id)
        )
      )
      .orderBy(desc(deals.createdAt));
  }),

  create: authedQuery
    .input(z.object({
      sellerId: z.number(),
      itemId: z.number().optional(),
      projectId: z.number().optional(),
      amount: z.string(),
      meetupLocation: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      return db.insert(deals).values({
        ...input,
        buyerId: ctx.user.id,
        status: "in_escrow",
      });
    }),

  updateStatus: authedQuery
    .input(z.object({
      dealId: z.number(),
      status: z.enum(["pending", "in_escrow", "completed", "disputed", "cancelled"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(deals)
        .where(eq(deals.id, input.dealId))
        .limit(1);

      if (existing.length === 0) throw new Error("Deal not found");
      const deal = existing[0];

      // Only buyer or seller can update
      if (deal.buyerId !== ctx.user.id && deal.sellerId !== ctx.user.id) {
        throw new Error("Not authorized");
      }

      return db
        .update(deals)
        .set({ status: input.status })
        .where(eq(deals.id, input.dealId));
    }),
});

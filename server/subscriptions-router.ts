import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { subscriptions, subscriptionMembers } from "../db/schema";
import { eq, desc, and } from "drizzle-orm";

export const subscriptionsRouter = createRouter({
  list: publicQuery
    .input(z.object({
      university: z.string().optional(),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(subscriptions.isActive, true)];
      
      if (input?.university) {
        conditions.push(eq(subscriptions.university, input.university));
      }

      return db
        .select()
        .from(subscriptions)
        .where(and(...conditions))
        .orderBy(desc(subscriptions.createdAt))
        .limit(input?.limit ?? 20);
    }),

  mySubscriptions: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.ownerId, ctx.user.id))
      .orderBy(desc(subscriptions.createdAt));
  }),

  create: authedQuery
    .input(z.object({
      serviceName: z.string().min(1),
      plan: z.string().min(1),
      totalCost: z.string(),
      maxSlots: z.number().min(2).max(10),
      costPerSlot: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      return db.insert(subscriptions).values({
        ...input,
        ownerId: ctx.user.id,
        university: ctx.user.university,
        filledSlots: 1,
      });
    }),

  join: authedQuery
    .input(z.object({ subscriptionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      
      // Add member
      await db.insert(subscriptionMembers).values({
        subscriptionId: input.subscriptionId,
        userId: ctx.user.id,
      });

      // Update filled slots
      const sub = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.id, input.subscriptionId))
        .limit(1);

      if (sub.length > 0 && sub[0]) {
        await db
          .update(subscriptions)
          .set({ filledSlots: (sub[0].filledSlots || 0) + 1 })
          .where(eq(subscriptions.id, input.subscriptionId));
      }

      return { success: true };
    }),
});

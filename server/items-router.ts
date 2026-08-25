import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { items } from "../db/schema";
import { eq, desc, and, like, sql } from "drizzle-orm";

export const itemsRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
        type: z.enum(["rental", "sale"]).optional(),
        search: z.string().optional(),
        university: z.string().optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.category) {
        conditions.push(eq(items.category, input.category as any));
      }
      if (input?.type) {
        conditions.push(eq(items.type, input.type));
      }
      if (input?.search) {
        conditions.push(like(items.title, `%${input.search}%`));
      }
      if (input?.university) {
        conditions.push(eq(items.university, input.university));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const result = await db
        .select()
        .from(items)
        .where(where)
        .orderBy(desc(items.createdAt))
        .limit(input?.limit ?? 20)
        .offset(input?.offset ?? 0);

      return result;
    }),

  trending: publicQuery
    .input(z.object({ university: z.string().optional(), limit: z.number().default(6) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(items.isAvailable, true)];
      
      if (input?.university) {
        conditions.push(eq(items.university, input.university));
      }

      const result = await db
        .select()
        .from(items)
        .where(and(...conditions))
        .orderBy(desc(items.viewCount))
        .limit(input?.limit ?? 6);

      return result;
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(items)
        .where(eq(items.id, input.id))
        .limit(1);

      if (result.length === 0) return null;

      // Increment view count
      await db
        .update(items)
        .set({ viewCount: sql`${items.viewCount} + 1` })
        .where(eq(items.id, input.id));

      return result[0];
    }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        price: z.string(),
        priceType: z.enum(["per_day", "per_week", "per_month", "fixed"]),
        category: z.enum([
          "electronics", "books", "tools", "furniture",
          "sports", "fashion", "notes", "projects", "other"
        ]),
        type: z.enum(["rental", "sale"]),
        image: z.string().optional(),
        condition: z.enum(["new", "like_new", "good", "fair", "poor"]),
        securityDeposit: z.string().optional(),
        tags: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db.insert(items).values({
        ...input,
        ownerId: ctx.user.id,
        university: ctx.user.university,
        campus: ctx.user.campus,
      });
      return result;
    }),

  myItems: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db
      .select()
      .from(items)
      .where(eq(items.ownerId, ctx.user.id))
      .orderBy(desc(items.createdAt));
  }),
});

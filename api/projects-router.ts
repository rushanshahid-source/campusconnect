import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { projects } from "@db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

export const projectsRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        category: z.string().optional(),
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
        conditions.push(eq(projects.category, input.category as any));
      }
      if (input?.search) {
        conditions.push(sql`LOWER(${projects.title}) LIKE LOWER(${'%' + input.search + '%'})`);
      }
      if (input?.university) {
        conditions.push(eq(projects.university, input.university));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      return db
        .select()
        .from(projects)
        .where(where)
        .orderBy(desc(projects.createdAt))
        .limit(input?.limit ?? 20)
        .offset(input?.offset ?? 0);
    }),

  trending: publicQuery
    .input(z.object({ limit: z.number().default(5) }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(projects)
        .where(eq(projects.isSold, false))
        .orderBy(desc(projects.viewCount))
        .limit(input?.limit ?? 5);
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id))
        .limit(1);

      if (result.length === 0) return null;

      await db
        .update(projects)
        .set({ viewCount: sql`${projects.viewCount} + 1` })
        .where(eq(projects.id, input.id));

      return result[0];
    }),

  create: authedQuery
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        category: z.enum([
          "hardware", "software", "ai_ml", "web_dev",
          "mobile_app", "iot", "data_science", "other"
        ]),
        completion: z.number().min(0).max(100),
        price: z.string(),
        originalPrice: z.string().optional(),
        techStack: z.string().optional(),
        documentation: z.boolean().optional(),
        image: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      return db.insert(projects).values({
        ...input,
        sellerId: ctx.user.id,
        university: ctx.user.university,
      });
    }),

  stats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(projects);
    const sold = all.filter(p => p.isSold).length;
    const totalVolume = all.reduce((sum, p) => sum + Number(p.price), 0);
    return {
      totalProjects: all.length,
      soldProjects: sold,
      totalVolume: totalVolume.toFixed(2),
      averageDiscount: 65,
    };
  }),
});

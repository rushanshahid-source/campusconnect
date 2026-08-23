import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { tutors } from "@db/schema";
import { eq, desc, like, and } from "drizzle-orm";

export const tutorsRouter = createRouter({
  list: publicQuery
    .input(z.object({
      search: z.string().optional(),
      subject: z.string().optional(),
      university: z.string().optional(),
      limit: z.number().default(20),
    }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(tutors.isAvailable, true)];

      if (input?.search) {
        conditions.push(like(tutors.title, `%${input.search}%`));
      }
      if (input?.subject) {
        conditions.push(like(tutors.subjects, `%${input.subject}%`));
      }
      if (input?.university) {
        conditions.push(eq(tutors.university, input.university));
      }

      return db
        .select()
        .from(tutors)
        .where(and(...conditions))
        .orderBy(desc(tutors.rating))
        .limit(input?.limit ?? 20);
    }),

  byId: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(tutors)
        .where(eq(tutors.id, input.id))
        .limit(1);
      return result[0] ?? null;
    }),

  create: authedQuery
    .input(z.object({
      title: z.string().min(1),
      bio: z.string().optional(),
      subjects: z.string().min(1),
      hourlyRate: z.string(),
      availability: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      return db.insert(tutors).values({
        ...input,
        userId: ctx.user.id,
        university: ctx.user.university,
      });
    }),

  myTutorProfile: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const result = await db
      .select()
      .from(tutors)
      .where(eq(tutors.userId, ctx.user.id))
      .limit(1);
    return result[0] ?? null;
  }),
});

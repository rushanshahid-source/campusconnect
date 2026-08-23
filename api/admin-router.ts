import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { auditLogs, deals, items, messages, projects, reports, subscriptions, tutors, users } from "@db/schema";
import { adminQuery, createRouter, authedQuery, moderatorQuery } from "./middleware";
import { getDb } from "./queries/connection";

const role = z.enum(["user", "moderator", "admin"]);
const targetType = z.enum(["user", "item", "project", "subscription", "tutor", "message", "deal"]);

async function audit(actorId: number, action: string, target: string, targetId: number | undefined, details?: string) {
  await getDb().insert(auditLogs).values({ actorId, action, targetType: target, targetId, details });
}

export const adminRouter = createRouter({
  overview: moderatorQuery.query(async () => {
    const db = getDb();
    const [allUsers, allItems, allProjects, allMessages, allDeals, openReports] = await Promise.all([
      db.select().from(users), db.select().from(items), db.select().from(projects),
      db.select().from(messages), db.select().from(deals), db.select().from(reports).where(eq(reports.status, "open")),
    ]);
    return {
      users: allUsers.length,
      activeUsers: allUsers.filter((user) => user.status === "active").length,
      items: allItems.length,
      projects: allProjects.length,
      messages: allMessages.length,
      deals: allDeals.length,
      openReports: openReports.length,
    };
  }),

  users: adminQuery.query(async () => {
    return getDb().select({
      id: users.id, email: users.email, name: users.name, university: users.university,
      role: users.role, status: users.status, moderationNote: users.moderationNote,
      createdAt: users.createdAt, lastSignInAt: users.lastSignInAt,
    }).from(users).orderBy(desc(users.createdAt));
  }),

  setUserRole: adminQuery.input(z.object({ userId: z.number(), role })).mutation(async ({ ctx, input }) => {
    if (input.userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot change your own role." });
    const [updated] = await getDb().update(users).set({ role: input.role }).where(eq(users.id, input.userId)).returning({ id: users.id, role: users.role });
    if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
    await audit(ctx.user.id, "role.changed", "user", input.userId, input.role);
    return updated;
  }),

  setUserStatus: moderatorQuery.input(z.object({ userId: z.number(), status: z.enum(["active", "suspended"]), note: z.string().max(500).optional() })).mutation(async ({ ctx, input }) => {
    const target = await getDb().select({ role: users.role }).from(users).where(eq(users.id, input.userId)).limit(1);
    if (!target[0]) throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
    if (target[0].role === "admin" && ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Moderators cannot suspend administrators." });
    await getDb().update(users).set({ status: input.status, moderationNote: input.note }).where(eq(users.id, input.userId));
    await audit(ctx.user.id, `user.${input.status}`, "user", input.userId, input.note);
    return { success: true };
  }),

  deleteUser: adminQuery.input(z.object({ userId: z.number() })).mutation(async ({ ctx, input }) => {
    if (input.userId === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "You cannot delete your own account here." });
    const [deleted] = await getDb().delete(users).where(eq(users.id, input.userId)).returning({ id: users.id });
    if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
    await audit(ctx.user.id, "user.deleted", "user", input.userId);
    return { success: true };
  }),

  content: moderatorQuery.query(async () => {
    const db = getDb();
    const [itemRows, projectRows, subscriptionRows, tutorRows, dealRows, messageRows] = await Promise.all([
      db.select({ id: items.id, title: items.title, createdAt: items.createdAt }).from(items).orderBy(desc(items.createdAt)).limit(25),
      db.select({ id: projects.id, title: projects.title, createdAt: projects.createdAt }).from(projects).orderBy(desc(projects.createdAt)).limit(25),
      db.select({ id: subscriptions.id, title: subscriptions.serviceName, createdAt: subscriptions.createdAt }).from(subscriptions).orderBy(desc(subscriptions.createdAt)).limit(25),
      db.select({ id: tutors.id, title: tutors.title, createdAt: tutors.createdAt }).from(tutors).orderBy(desc(tutors.createdAt)).limit(25),
      db.select({ id: deals.id, title: deals.status, createdAt: deals.createdAt }).from(deals).orderBy(desc(deals.createdAt)).limit(25),
      db.select({ id: messages.id, title: messages.content, createdAt: messages.createdAt }).from(messages).orderBy(desc(messages.createdAt)).limit(25),
    ]);
    return [
      ...itemRows.map((row) => ({ ...row, type: "item" as const })),
      ...projectRows.map((row) => ({ ...row, type: "project" as const })),
      ...subscriptionRows.map((row) => ({ ...row, type: "subscription" as const })),
      ...tutorRows.map((row) => ({ ...row, type: "tutor" as const })),
      ...dealRows.map((row) => ({ ...row, type: "deal" as const })),
      ...messageRows.map((row) => ({ ...row, type: "message" as const })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 60);
  }),

  deleteContent: moderatorQuery.input(z.object({ type: targetType, id: z.number(), reason: z.string().max(300).optional() })).mutation(async ({ ctx, input }) => {
    if (input.type === "user") throw new TRPCError({ code: "FORBIDDEN", message: "Use user management to remove accounts." });
    const table = { item: items, project: projects, subscription: subscriptions, tutor: tutors, message: messages, deal: deals }[input.type];
    const [deleted] = await getDb().delete(table).where(eq(table.id, input.id)).returning({ id: table.id });
    if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Content not found." });
    await audit(ctx.user.id, "content.deleted", input.type, input.id, input.reason);
    return { success: true };
  }),

  updateUser: adminQuery.input(z.object({ userId: z.number(), name: z.string().min(1).max(80).optional(), university: z.string().max(120).optional(), campus: z.string().max(120).optional(), department: z.string().max(120).optional() })).mutation(async ({ ctx, input }) => {
    const { userId, ...changes } = input;
    const [updated] = await getDb().update(users).set(changes).where(eq(users.id, userId)).returning({ id: users.id });
    if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "User not found." });
    await audit(ctx.user.id, "user.updated", "user", userId);
    return updated;
  }),

  updateItem: adminQuery.input(z.object({
    id: z.number(), title: z.string().min(1).optional(), description: z.string().optional(), price: z.string().optional(),
    priceType: z.enum(["per_day", "per_week", "per_month", "fixed"]).optional(),
    category: z.enum(["electronics", "books", "tools", "furniture", "sports", "fashion", "notes", "projects", "other"]).optional(),
    type: z.enum(["rental", "sale"]).optional(), image: z.string().optional(),
    condition: z.enum(["new", "like_new", "good", "fair", "poor"]).optional(),
    securityDeposit: z.string().optional(), tags: z.string().optional(), isAvailable: z.boolean().optional(),
  })).mutation(async ({ ctx, input }) => {
    const { id, ...changes } = input;
    const [updated] = await getDb().update(items).set(changes).where(eq(items.id, id)).returning({ id: items.id });
    if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Item not found." });
    await audit(ctx.user.id, "content.updated", "item", id);
    return updated;
  }),

  updateProject: adminQuery.input(z.object({ id: z.number(), title: z.string().min(1).optional(), description: z.string().optional(), price: z.string().optional(), isSold: z.boolean().optional() })).mutation(async ({ ctx, input }) => {
    const { id, ...changes } = input;
    const [updated] = await getDb().update(projects).set(changes).where(eq(projects.id, id)).returning({ id: projects.id });
    if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found." });
    await audit(ctx.user.id, "content.updated", "project", id);
    return updated;
  }),

  updateSubscription: adminQuery.input(z.object({ id: z.number(), serviceName: z.string().min(1).optional(), plan: z.string().min(1).optional(), totalCost: z.string().optional(), isActive: z.boolean().optional() })).mutation(async ({ ctx, input }) => {
    const { id, ...changes } = input;
    const [updated] = await getDb().update(subscriptions).set(changes).where(eq(subscriptions.id, id)).returning({ id: subscriptions.id });
    if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found." });
    await audit(ctx.user.id, "content.updated", "subscription", id);
    return updated;
  }),

  updateTutor: adminQuery.input(z.object({ id: z.number(), title: z.string().min(1).optional(), bio: z.string().optional(), hourlyRate: z.string().optional(), isAvailable: z.boolean().optional() })).mutation(async ({ ctx, input }) => {
    const { id, ...changes } = input;
    const [updated] = await getDb().update(tutors).set(changes).where(eq(tutors.id, id)).returning({ id: tutors.id });
    if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Tutor profile not found." });
    await audit(ctx.user.id, "content.updated", "tutor", id);
    return updated;
  }),

  updateDeal: adminQuery.input(z.object({ id: z.number(), status: z.enum(["pending", "in_escrow", "completed", "disputed", "cancelled"]).optional(), notes: z.string().optional(), meetupLocation: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const { id, ...changes } = input;
    const [updated] = await getDb().update(deals).set(changes).where(eq(deals.id, id)).returning({ id: deals.id });
    if (!updated) throw new TRPCError({ code: "NOT_FOUND", message: "Deal not found." });
    await audit(ctx.user.id, "deal.updated", "deal", id);
    return updated;
  }),

  deleteMessage: adminQuery.input(z.object({ id: z.number(), reason: z.string().max(300).optional() })).mutation(async ({ ctx, input }) => {
    const [deleted] = await getDb().delete(messages).where(eq(messages.id, input.id)).returning({ id: messages.id });
    if (!deleted) throw new TRPCError({ code: "NOT_FOUND", message: "Message not found." });
    await audit(ctx.user.id, "message.deleted", "message", input.id, input.reason);
    return { success: true };
  }),

  report: authedQuery.input(z.object({ targetType, targetId: z.number(), reason: z.string().min(5).max(500) })).mutation(async ({ ctx, input }) => {
    return getDb().insert(reports).values({ reporterId: ctx.user.id, ...input }).returning({ id: reports.id });
  }),

  reports: moderatorQuery.query(async () => getDb().select().from(reports).orderBy(desc(reports.createdAt))),

  resolveReport: moderatorQuery.input(z.object({ reportId: z.number(), status: z.enum(["reviewing", "resolved", "dismissed"]), resolution: z.string().max(500).optional() })).mutation(async ({ ctx, input }) => {
    await getDb().update(reports).set({ status: input.status, resolution: input.resolution, reviewedBy: ctx.user.id }).where(eq(reports.id, input.reportId));
    await audit(ctx.user.id, `report.${input.status}`, "report", input.reportId, input.resolution);
    return { success: true };
  }),

  audit: moderatorQuery.query(async () => getDb().select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(100)),
});
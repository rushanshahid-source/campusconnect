import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { messages } from "@db/schema";
import { eq, desc, and, or } from "drizzle-orm";

export const messagesRouter = createRouter({
  conversations: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const allMessages = await db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, ctx.user.id),
          eq(messages.receiverId, ctx.user.id)
        )
      )
      .orderBy(desc(messages.createdAt));

    // Group by conversation partner
    const conversations = new Map();
    for (const msg of allMessages) {
      const partnerId = msg.senderId === ctx.user.id ? msg.receiverId : msg.senderId;
      if (!conversations.has(partnerId)) {
        conversations.set(partnerId, {
          partnerId,
          lastMessage: msg,
          unreadCount: msg.receiverId === ctx.user.id && !msg.isRead ? 1 : 0,
        });
      } else {
        const conv = conversations.get(partnerId);
        if (msg.receiverId === ctx.user.id && !msg.isRead) {
          conv.unreadCount++;
        }
      }
    }

    return Array.from(conversations.values());
  }),

  withUser: authedQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(messages)
        .where(
          or(
            and(
              eq(messages.senderId, ctx.user.id),
              eq(messages.receiverId, input.userId)
            ),
            and(
              eq(messages.senderId, input.userId),
              eq(messages.receiverId, ctx.user.id)
            )
          )
        )
        .orderBy(messages.createdAt);

      // Mark as read
      await db
        .update(messages)
        .set({ isRead: true })
        .where(
          and(
            eq(messages.senderId, input.userId),
            eq(messages.receiverId, ctx.user.id),
            eq(messages.isRead, false)
          )
        );

      return result;
    }),

  send: authedQuery
    .input(z.object({
      receiverId: z.number(),
      content: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      return db.insert(messages).values({
        senderId: ctx.user.id,
        receiverId: input.receiverId,
        content: input.content,
      });
    }),
});

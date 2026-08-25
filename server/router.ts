import { authRouter } from "./auth-router";
import { itemsRouter } from "./items-router";
import { projectsRouter } from "./projects-router";
import { subscriptionsRouter } from "./subscriptions-router";
import { tutorsRouter } from "./tutors-router";
import { messagesRouter } from "./messages-router";
import { dealsRouter } from "./deals-router";
import { reviewsRouter } from "./reviews-router";
import { adminRouter } from "./admin-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  items: itemsRouter,
  projects: projectsRouter,
  subscriptions: subscriptionsRouter,
  tutors: tutorsRouter,
  messages: messagesRouter,
  deals: dealsRouter,
  reviews: reviewsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;

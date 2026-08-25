import { authRouter } from "./auth-router.js";
import { itemsRouter } from "./items-router.js";
import { projectsRouter } from "./projects-router.js";
import { subscriptionsRouter } from "./subscriptions-router.js";
import { tutorsRouter } from "./tutors-router.js";
import { messagesRouter } from "./messages-router.js";
import { dealsRouter } from "./deals-router.js";
import { reviewsRouter } from "./reviews-router.js";
import { adminRouter } from "./admin-router.js";
import { createRouter, publicQuery } from "./middleware.js";

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

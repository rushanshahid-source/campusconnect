/**
 * The Hono application — pure, with no side effects.
 *
 * Importing this module must never start a listener or touch the filesystem, so
 * it can be used unchanged by:
 *   - `server/boot.ts`   — long-running Node server (`npm start`)
 *   - `api/index.ts`     — single Vercel serverless function
 *   - the Vite dev server (`@hono/vite-dev-server`)
 *
 * Previously the listener lived at the bottom of this file behind
 * `if (env.isProduction)`. On Vercel `NODE_ENV` *is* "production", so merely
 * importing the app tried to bind a port — which serverless has no concept of.
 */
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

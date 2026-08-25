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
import { missingEnv } from "./lib/env";

const app = new Hono<{ Bindings: HttpBindings }>();

/**
 * Anything that escapes a handler becomes JSON. Without this, an uncaught throw
 * lets the platform answer with plain text, which the client cannot parse.
 */
app.onError((err, c) => {
  const missing = missingEnv();
  if (missing.length > 0) {
    console.error(`[config] missing environment variables: ${missing.join(", ")}`);
    return c.json(
      {
        error: "Server is not configured",
        detail: `Missing environment variable(s): ${missing.join(", ")}`,
      },
      503,
    );
  }
  console.error("[error]", err);
  return c.json({ error: "Internal Server Error", detail: err.message }, 500);
});

/**
 * Unauthenticated diagnostic. Reports whether each required variable is present
 * — never its value — so a broken deploy can be identified with one request.
 */
app.get("/api/health", (c) => {
  const missing = missingEnv();
  return c.json(
    {
      ok: missing.length === 0,
      env: process.env.NODE_ENV ?? "unknown",
      missingEnv: missing,
    },
    missing.length === 0 ? 200 : 503,
  );
});

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

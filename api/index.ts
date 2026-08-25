/**
 * The single Vercel serverless function.
 *
 * Vercel's zero-config turns **every** `.ts` file under `api/` into its own
 * function. The previous layout had 22 modules there — routers, middleware, db
 * queries, helpers — so Vercel tried to compile each as an endpoint, using its
 * own TypeScript settings rather than tsconfig.server.json. That produced the
 * whole wall of TS2307 (`Cannot find module '@db/schema'`) and TS2835
 * (`needs explicit file extensions`) errors in the build log.
 *
 * The application now lives in `server/`, and this is the only file Vercel sees.
 * `vercel.json` rewrites every /api/* request here; static assets are served by
 * Vercel from dist/public, so the app never serves files itself.
 *
 * The default export must be a *callable*. A Hono instance is an object that
 * merely *has* a `.fetch` method, so exporting it directly gives the runtime
 * nothing to invoke and every request dies as FUNCTION_INVOCATION_FAILED before
 * any of our code runs. `handle` from `hono/vercel` wraps it as
 * `(req) => app.fetch(req)`, which is what the runtime expects.
 */
import { handle } from "hono/vercel";
import app from "../server/app.js";

export default handle(app);

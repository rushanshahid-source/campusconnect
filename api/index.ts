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
 * The default export is a Node request listener — `(req, res)` — produced by
 * `getRequestListener` from @hono/node-server.
 *
 * Two earlier shapes both failed here:
 *   - `export default app` gave the runtime a plain object with a `.fetch`
 *     property and nothing to invoke: FUNCTION_INVOCATION_FAILED.
 *   - `export default handle(app)` (hono/vercel) is an arity-1 Web handler
 *     `(Request) => Response`. This runtime invoked it Node-style instead,
 *     discarded the returned Response and waited on a `res.end()` that never
 *     came, so every request hung until maxDuration: FUNCTION_INVOCATION_TIMEOUT.
 *
 * A Node listener is unambiguous — it writes to `res` directly, so there is no
 * signature for the platform to guess at.
 */
import { getRequestListener } from "@hono/node-server";
import app from "../server/app.js";

export default getRequestListener(app.fetch);

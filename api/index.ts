/**
 * The single Vercel serverless function.
 *
 * Vercel's zero-config turns **every** `.ts` file under `api/` into its own
 * function. The previous layout had 22 modules there — routers, middleware, db
 * queries, helpers — so Vercel tried to compile each as an endpoint, using its
 * own TypeScript settings rather than tsconfig.server.json. That produced the
 * whole wall of TS2307 / TS2835 errors in the build log.
 *
 * The application now lives in `server/`, and this is the only file Vercel sees.
 * `vercel.json` rewrites every /api/* request here; static assets are served by
 * Vercel from dist/public, so the app never serves files itself.
 *
 * The handler is written out explicitly rather than delegating to an adapter,
 * because three earlier shapes each failed on this platform:
 *
 *   1. `export default app` — a Hono instance is an object with a `.fetch`
 *      property, not a callable, so the runtime had nothing to invoke:
 *      FUNCTION_INVOCATION_FAILED on every request.
 *   2. `export default handle(app)` (hono/vercel) — an arity-1 Web handler
 *      `(Request) => Response`. The runtime invoked it Node-style, discarded
 *      the returned Response and waited on a `res.end()` that never came:
 *      FUNCTION_INVOCATION_TIMEOUT on every request.
 *   3. `getRequestListener(app.fetch)` — a correct Node listener, but it builds
 *      the Request body from the raw stream. @vercel/node pre-parses the body
 *      and consumes that stream first, so GET requests succeeded while every
 *      POST hung awaiting data that would never arrive.
 *
 * Reading the body below covers both cases: if the platform already parsed it,
 * that value is reused; otherwise the raw stream is drained.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import app from "../server/app.js";

type VercelRequest = IncomingMessage & { body?: unknown };

/**
 * Collect the raw request stream, for when the platform has not consumed it.
 *
 * Bounded deliberately. If something upstream has already drained the stream
 * without leaving the result on `req.body`, waiting for an "end" event that has
 * already fired would stall the request for the full maxDuration and report
 * nothing. Returning what we have is always preferable to hanging.
 */
function readRawBody(req: IncomingMessage): Promise<Buffer> {
  return new Promise((resolve) => {
    if (req.readableEnded || req.complete) return resolve(Buffer.alloc(0));

    const chunks: Buffer[] = [];
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(Buffer.concat(chunks));
    };
    const timer = setTimeout(() => {
      console.error("[handler] request body stream did not end within 5s");
      finish();
    }, 5000);

    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", finish);
    req.on("error", (e) => {
      console.error("[handler] body stream error", e);
      finish();
    });
  });
}

function toHeaders(req: IncomingMessage): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) for (const v of value) headers.append(key, v);
    else headers.set(key, value);
  }
  return headers;
}

async function toBody(
  req: VercelRequest,
): Promise<string | Buffer | undefined> {
  const method = (req.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return undefined;

  const parsed = req.body;
  // `undefined` means nothing pre-parsed it, so the stream is still intact.
  if (parsed === undefined) {
    const raw = await readRawBody(req);
    return raw.length > 0 ? raw : undefined;
  }
  if (typeof parsed === "string") return parsed;
  if (Buffer.isBuffer(parsed)) return parsed;
  // Already decoded into an object by the platform's JSON parsing.
  return JSON.stringify(parsed);
}

export default async function handler(req: VercelRequest, res: ServerResponse) {
  try {
    const proto =
      (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0] ??
      "https";
    const host = req.headers.host ?? "localhost";
    const started = Date.now();
    const body = await toBody(req);

    // One line per request describing what the platform actually handed us.
    // POSTs were timing out here while GETs succeeded, and the shape of the
    // incoming body is the difference between them.
    if (req.method && req.method !== "GET") {
      console.log(
        `[handler] ${req.method} ${req.url} preParsed=${typeof req.body} ` +
          `complete=${req.complete} len=${req.headers["content-length"] ?? "-"} ` +
          `bodyRead=${body === undefined ? "none" : String(body).length} in ${Date.now() - started}ms`,
      );
    }

    const request = new Request(`${proto}://${host}${req.url ?? "/"}`, {
      method: req.method ?? "GET",
      headers: toHeaders(req),
      body,
    });

    const response = await app.fetch(request);

    // Set-Cookie may legitimately repeat, so it cannot go through the flattened
    // header map — the session cookie would be lost.
    const cookies = response.headers.getSetCookie?.() ?? [];
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== "set-cookie") res.setHeader(key, value);
    });
    if (cookies.length > 0) res.setHeader("set-cookie", cookies);

    res.statusCode = response.status;
    res.end(
      response.body ? Buffer.from(await response.arrayBuffer()) : undefined,
    );
  } catch (err) {
    // Never leave the socket open — an unanswered request costs the full
    // maxDuration and reports nothing useful.
    console.error("[handler]", err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "application/json");
    }
    res.end(
      JSON.stringify({
        error: "Internal Server Error",
        detail: err instanceof Error ? err.message : String(err),
      }),
    );
  }
}

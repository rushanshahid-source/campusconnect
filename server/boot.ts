/**
 * Long-running Node entry point (`npm start`, Docker, Railway, Render, Fly).
 *
 * Serves the built client from dist/public and binds a port. Vercel does NOT
 * use this file — it uses `api/index.ts`, which imports the same app without
 * the listener. See server/app.ts.
 */
import app from "./app";
import { env } from "./lib/env";

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  // Bind to all interfaces by default so the server is reachable on a public IP.
  const hostname = process.env.HOST || "0.0.0.0";
  serve({ fetch: app.fetch, port, hostname }, () => {
    console.log(`Server running on http://${hostname}:${port}/`);
  });
}

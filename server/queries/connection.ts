import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env.js";
import * as schema from "../../db/schema.js";
import * as relations from "../../db/relations.js";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

/**
 * Whether TLS should be forced. Only when the URL names a host we can see is
 * remote — managed providers (Neon, Supabase, Vercel Postgres, Railway) all
 * require it, while a local server generally has no certificate.
 *
 * An empty or unparseable value means postgres.js falls back to its own
 * defaults (localhost via PG* env vars), so TLS must not be forced there
 * either — that is how `npm run dev` works with no .env present.
 */
function shouldForceTls(url: string): boolean {
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return !(host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "");
  } catch {
    return false;
  }
}

export function getDb() {
  if (!instance) {
    const url = env.databaseUrl;
    const explicitSsl = /[?&]sslmode=/.test(url);

    const client = postgres(url, {
      // One connection per serverless invocation. A larger pool has no benefit
      // here -- each invocation is single-threaded -- and burns the provider's
      // connection limit, since every warm instance holds its own pool.
      max: 1,
      // Transaction poolers (pgbouncer, Supabase :6543) reject prepared statements.
      prepare: false,
      idle_timeout: 20,
      // Without this, an unreachable host (wrong host, blocked port, missing TLS)
      // hangs until the platform's maxDuration and returns an opaque
      // FUNCTION_INVOCATION_TIMEOUT. Failing fast surfaces a real error instead.
      connect_timeout: 10,
      ...(!explicitSsl && shouldForceTls(url) ? { ssl: "require" as const } : {}),
    });

    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}

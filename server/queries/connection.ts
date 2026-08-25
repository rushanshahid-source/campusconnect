import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env.js";
import * as schema from "../../db/schema.js";
import * as relations from "../../db/relations.js";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;

/**
 * Whether the target is a local database, in which case TLS is not expected.
 * Managed providers (Neon, Supabase, Vercel Postgres, Railway) all require it.
 */
function isLocal(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
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
      ...(explicitSsl || isLocal(url) ? {} : { ssl: "require" as const }),
    });

    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}

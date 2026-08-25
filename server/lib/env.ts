import "dotenv/config";

/**
 * Environment access.
 *
 * These are exposed as *getters* rather than eagerly-read values on purpose.
 *
 * Previously the required() calls ran at module-evaluation time, so a missing
 * variable threw while the module graph was still loading. On Vercel that kills
 * the function before Hono exists, and the platform answers with a plain-text
 * "A server error has occurred" — which the browser then fails to JSON.parse,
 * surfacing to users as `Unexpected token 'A' ... is not valid JSON`.
 *
 * Reading lazily means the app always boots, the error is raised inside a
 * request, and app.onError can turn it into a proper JSON response.
 */

const REQUIRED = ["APP_SECRET", "DATABASE_URL"] as const;

function required(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

/** Names of required vars that are absent. Empty outside production. */
export function missingEnv(): string[] {
  if (process.env.NODE_ENV !== "production") return [];
  return REQUIRED.filter((name) => !process.env[name]);
}

export const env = {
  /** Secret used to sign/verify the session JWT. Set a long random value in prod. */
  get appSecret(): string {
    return required("APP_SECRET");
  },
  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  },
  get databaseUrl(): string {
    return required("DATABASE_URL");
  },
  /** Email that should be granted the "admin" role on registration (optional). */
  get ownerEmail(): string {
    return process.env.OWNER_EMAIL ?? "";
  },
};

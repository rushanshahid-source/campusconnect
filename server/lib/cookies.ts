import type { CookieOptions } from "hono/utils/cookie";

function isHttps(headers: Headers): boolean {
  // When fronted by a reverse proxy/load balancer that terminates TLS, trust
  // the forwarded protocol header. Direct connections (dev, self-hosted on a
  // public IP over plain HTTP) are treated as insecure.
  const proto = headers.get("x-forwarded-proto");
  if (proto) return proto.split(",")[0].trim() === "https";
  return false;
}

export function getSessionCookieOptions(headers: Headers): CookieOptions {
  const https = isHttps(headers);

  return {
    httpOnly: true,
    path: "/",
    // SameSite "None" REQUIRES Secure, so only use it over HTTPS. Over plain
    // HTTP (e.g. a public IP demo) we use Lax + non-secure, which still works
    // because the SPA and API are served from the same origin.
    sameSite: https ? "None" : "Lax",
    secure: https,
  };
}

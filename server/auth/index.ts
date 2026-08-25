import * as cookie from "cookie";
import { Session } from "../../contracts/constants.js";
import { Errors } from "../../contracts/errors.js";
import { getSessionCookieOptions } from "../lib/cookies.js";
import { findUserById } from "../queries/users.js";
import { verifySessionToken } from "./session.js";

/**
 * Resolve the authenticated user from the request's session cookie.
 * Throws a forbidden error when no valid session / user is found.
 */
export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    throw Errors.forbidden("Not authenticated.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const user = await findUserById(claim.userId);
  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }
  if (user.status === "suspended") {
    throw Errors.forbidden("This account is suspended. Contact campus support.");
  }
  return user;
}

/** Serialize a Set-Cookie header value that establishes the session. */
export function serializeSessionCookie(headers: Headers, token: string): string {
  const opts = getSessionCookieOptions(headers);
  return cookie.serialize(Session.cookieName, token, {
    httpOnly: opts.httpOnly,
    path: opts.path,
    sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
    secure: opts.secure,
    maxAge: Session.maxAgeMs / 1000,
  });
}

/** Serialize a Set-Cookie header value that clears the session. */
export function serializeLogoutCookie(headers: Headers): string {
  const opts = getSessionCookieOptions(headers);
  return cookie.serialize(Session.cookieName, "", {
    httpOnly: opts.httpOnly,
    path: opts.path,
    sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
    secure: opts.secure,
    maxAge: 0,
  });
}

export { signSessionToken, verifySessionToken } from "./session.js";
export { hashPassword, verifyPassword } from "./password.js";

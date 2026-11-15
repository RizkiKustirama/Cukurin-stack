import { SignJWT, jwtVerify } from "jose";
import type { SessionPayload, SessionUser } from "./types";

const SECRET_KEY =
  process.env.NEXTAUTH_SECRET ||
  "cukurin-super-secret-key-change-in-production-min-32-chars";

const encodedKey = new TextEncoder().encode(SECRET_KEY);

export const SESSION_COOKIE_NAME = "cukurin_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
export const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60;

/**
 * Encrypt a SessionUser payload into a signed JWT string using HS256.
 */
export async function encryptSession(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

/**
 * Decrypt and verify a JWT string into a SessionPayload.
 * Returns null if token is invalid or expired.
 */
export async function decryptSession(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Create session cookie (7 days, httpOnly, sameSite lax, path /).
 */
export async function createSessionCookie(user: SessionUser): Promise<void> {
  const token = await encryptSession(user);
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

/**
 * Delete session cookie.
 */
export async function deleteSessionCookie(): Promise<void> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

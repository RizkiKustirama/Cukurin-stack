import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { decryptSession, SESSION_COOKIE_NAME, deleteSessionCookie } from "./session";
import type { SessionUser, UserRole } from "./types";

export * from "./types";
export * from "./session";

// Backwards compatibility alias
export const destroySession = deleteSessionCookie;

/**
 * Retrieve the current authenticated session from cookies.
 * Returns SessionUser or null.
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    await connection();
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const payload = await decryptSession(token);
    if (!payload) return null;

    return {
      userId: payload.userId,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
      storeId: payload.storeId,
      storeSlug: payload.storeSlug,
      brandName: payload.brandName,
      isOnboarded: payload.isOnboarded,
    };
  } catch {
    return null;
  }
}

/**
 * Enforce that the user is authenticated and optionally matches one of the allowed roles.
 * Redirects to /login if no session exists.
 * Redirects to /unauthorized if role is not permitted.
 */
export async function requireAuth(
  allowedRoles?: UserRole[]
): Promise<SessionUser> {
  await connection();
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    redirect("/unauthorized");
  }

  return session;
}

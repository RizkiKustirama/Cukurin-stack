import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import type { SessionPayload } from "@/shared/auth/types";

const SECRET_KEY =
  process.env.NEXTAUTH_SECRET ||
  "cukurin-super-secret-key-change-in-production-min-32-chars";

const encodedKey = new TextEncoder().encode(SECRET_KEY);
const COOKIE_NAME = "cukurin_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass public and static routes
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/logout") ||
    pathname.startsWith("/unauthorized") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".") // static files like favicon.ico, manifest.json
  ) {
    return NextResponse.next();
  }

  // Parse path segments
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return NextResponse.next();
  }

  const firstSegment = segments[0]; // e.g. "admin" or "[storeSlug]"
  const secondSegment = segments[1]; // e.g. "dashboard", "pos", "barber", "onboarding", "queue"

  // 2. Allow public queue display without authentication
  if (secondSegment === "queue") {
    return NextResponse.next();
  }

  // 3. Extract and verify session token
  const token = request.cookies.get(COOKIE_NAME)?.value;
  let session: SessionPayload | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, encodedKey, {
        algorithms: ["HS256"],
      });
      session = payload as unknown as SessionPayload;
    } catch {
      session = null;
    }
  }

  // Helper redirect to login with callbackUrl
  const redirectToLogin = () => {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  };

  // Helper redirect to unauthorized
  const redirectToUnauthorized = () => {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  };

  // 4. If unauthenticated, redirect to login
  if (!session) {
    return redirectToLogin();
  }

  const { role, isOnboarded, storeSlug: userStoreSlug } = session;

  // 5. Route Protection & RBAC Matrix

  // --- A. Platform Admin (/admin) ---
  if (firstSegment === "admin") {
    if (role === "SUPERADMIN" || role === "PLATFORM_ADMIN") {
      return NextResponse.next();
    }
    return redirectToUnauthorized();
  }

  // --- B. Tenant Store Routes (/[storeSlug]/...) ---
  const currentStoreSlug = firstSegment;

  // Multi-tenant store validation: Tenant user cannot access other tenants' stores
  if (
    role !== "SUPERADMIN" &&
    role !== "PLATFORM_ADMIN" &&
    userStoreSlug &&
    userStoreSlug !== currentStoreSlug
  ) {
    return redirectToUnauthorized();
  }

  // If user accesses just `/[storeSlug]` without specific subroute, redirect based on role
  if (!secondSegment) {
    if (role === "SUPERADMIN" || role === "PLATFORM_ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    if (role === "OWNER" || role === "MANAGER") {
      const target = !isOnboarded ? "onboarding" : "dashboard";
      return NextResponse.redirect(new URL(`/${currentStoreSlug}/${target}`, request.url));
    }
    if (role === "CASHIER") {
      return NextResponse.redirect(new URL(`/${currentStoreSlug}/pos`, request.url));
    }
    if (role === "BARBER") {
      return NextResponse.redirect(new URL(`/${currentStoreSlug}/barber`, request.url));
    }
    return NextResponse.next();
  }

  // --- B1. Dashboard (/[storeSlug]/dashboard) ---
  // Allowed: OWNER, MANAGER
  if (secondSegment === "dashboard") {
    if (role !== "OWNER" && role !== "MANAGER") {
      return redirectToUnauthorized();
    }
    // If Owner is not onboarded, redirect to onboarding
    if (role === "OWNER" && !isOnboarded) {
      return NextResponse.redirect(
        new URL(`/${currentStoreSlug}/onboarding`, request.url)
      );
    }
    return NextResponse.next();
  }

  // --- B2. POS Kasir (/[storeSlug]/pos) ---
  // Allowed: OWNER, MANAGER, CASHIER
  if (secondSegment === "pos") {
    if (role !== "OWNER" && role !== "MANAGER" && role !== "CASHIER") {
      return redirectToUnauthorized();
    }
    // If Owner is not onboarded, redirect to onboarding
    if (role === "OWNER" && !isOnboarded) {
      return NextResponse.redirect(
        new URL(`/${currentStoreSlug}/onboarding`, request.url)
      );
    }
    return NextResponse.next();
  }

  // --- B3. Barber Portal (/[storeSlug]/barber) ---
  // Allowed: BARBER, OWNER, MANAGER
  if (secondSegment === "barber") {
    if (role !== "BARBER" && role !== "OWNER" && role !== "MANAGER") {
      return redirectToUnauthorized();
    }
    return NextResponse.next();
  }

  // --- B4. Onboarding (/[storeSlug]/onboarding) ---
  // Allowed: Only OWNER who is NOT onboarded
  if (secondSegment === "onboarding") {
    if (role !== "OWNER") {
      return redirectToUnauthorized();
    }
    // If Owner is already onboarded, redirect to dashboard
    if (isOnboarded) {
      return NextResponse.redirect(
        new URL(`/${currentStoreSlug}/dashboard`, request.url)
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|manifest.json|login|logout|unauthorized|$).*)",
  ],
};

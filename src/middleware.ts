/**
 * Authentication & Route Protection Middleware
 *
 * Uses NextAuth's built-in `auth()` wrapper to validate the JWT on EVERY
 * protected request — not just check for cookie presence. This guarantees:
 *
 *  1. Expired tokens (after the 4-hour maxAge) are rejected and the user
 *     is redirected to /login, even if the browser still holds the old cookie.
 *
 *  2. ALL protected app routes are covered: /dashboard, /sales, /goods,
 *     /investments, /analytics, and /super-admin.
 *
 *  3. Authenticated users are bounced away from /login and /register.
 *
 *  4. Role-based guards on sensitive routes (/super-admin, /analytics,
 *     /investments) are enforced server-side before the page ever renders.
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_ORDER = ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"] as const;

function hasMinRole(userRole: string, minimum: string): boolean {
  return ROLE_ORDER.indexOf(userRole as never) >= ROLE_ORDER.indexOf(minimum as never);
}

// Routes that require a valid, unexpired session to access
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/sales",
  "/goods",
  "/investments",
  "/analytics",
  "/super-admin",
];

// Minimum role required for specific route prefixes
const ROLE_REQUIREMENTS: { prefix: string; minRole: string }[] = [
  { prefix: "/super-admin", minRole: "SUPER_ADMIN" },
  { prefix: "/analytics",   minRole: "ADMIN"       },
  { prefix: "/investments", minRole: "MANAGER"     },
];

export default auth(function middleware(request) {
  const { pathname } = request.nextUrl;
  const session = request.auth; // Populated by NextAuth only if JWT is valid & unexpired

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // ── 1. Unauthenticated access to protected routes ────────────────────────
  // session is null when the JWT is absent OR has expired (maxAge exceeded).
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 2. Role-based access control ────────────────────────────────────────
  if (session) {
    const role = (session.user as any)?.role ?? "STAFF";

    for (const { prefix, minRole } of ROLE_REQUIREMENTS) {
      if (pathname.startsWith(prefix) && !hasMinRole(role, minRole)) {
        // Authenticated but insufficiently privileged — send to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // ── 3. Redirect authenticated users away from auth pages ─────────────────
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── 4. Root path redirect ────────────────────────────────────────────────
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(session ? "/dashboard" : "/login", request.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

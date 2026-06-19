/**
 * proxy.ts — Route protection middleware (Edge runtime)
 *
 * Next.js 16 replaces "middleware.ts" with "proxy.ts". This file runs on
 * Vercel's Edge network before every request, keeping latency near-zero.
 *
 * IMPORTANT — Bundle size:
 *   We intentionally import from auth.config.ts (NOT auth.ts).
 *   auth.ts pulls in Prisma + bcrypt which are Node.js-only and would push
 *   the Edge Function bundle past Vercel's 1 MB limit.
 *   auth.config.ts is pure JWT logic with zero heavy dependencies, keeping
 *   the bundle well below the limit.
 *
 * What this file enforces:
 *   1. Unauthenticated or expired-session requests to any protected route
 *      are redirected to /login.
 *   2. Role-based access control prevents under-privileged users from
 *      reaching /super-admin, /analytics, or /investments.
 *   3. Already-authenticated users are bounced away from /login and /register.
 *   4. The root path "/" redirects to the appropriate destination.
 */

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Build a NextAuth instance using only the edge-safe config.
// This validates the JWT signature + expiry without touching Prisma or bcrypt.
const { auth } = NextAuth(authConfig);

// ── Role hierarchy ────────────────────────────────────────────────────────────
const ROLE_ORDER = ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"] as const;

function hasMinRole(userRole: string, minimum: string): boolean {
  return (
    ROLE_ORDER.indexOf(userRole as never) >=
    ROLE_ORDER.indexOf(minimum as never)
  );
}

// ── Route tables ──────────────────────────────────────────────────────────────

/** Every path prefix that requires a valid, unexpired session. */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/sales",
  "/goods",
  "/investments",
  "/analytics",
  "/super-admin",
];

/** Minimum role required for specific route prefixes (checked in order). */
const ROLE_REQUIREMENTS: { prefix: string; minRole: string }[] = [
  { prefix: "/super-admin", minRole: "SUPER_ADMIN" },
  { prefix: "/analytics",   minRole: "ADMIN"       },
  { prefix: "/investments", minRole: "MANAGER"     },
];

// ── Middleware logic ──────────────────────────────────────────────────────────

export default auth(function middleware(request: NextRequest & { auth: any }) {
  const { pathname } = request.nextUrl;

  /**
   * `request.auth` is populated by NextAuth ONLY when the JWT is present,
   * correctly signed, and has not exceeded its maxAge (4 hours).
   * It is null for missing, tampered, or expired tokens.
   */
  const session = request.auth;

  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");

  // 1. Reject unauthenticated or expired-session access to protected routes
  if (isProtectedRoute && !session) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the originally requested URL so we can redirect back after login
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Role-based access control for privileged routes
  if (session) {
    const role = (session.user as any)?.role ?? "STAFF";

    for (const { prefix, minRole } of ROLE_REQUIREMENTS) {
      if (pathname.startsWith(prefix) && !hasMinRole(role, minRole)) {
        // Authenticated but insufficiently privileged — send to dashboard
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // 3. Prevent authenticated users from accessing login / register
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 4. Root path redirect
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(session ? "/dashboard" : "/login", request.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  // Run on all paths except Next.js internals and static assets
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

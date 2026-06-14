// Middleware checks authentication via NextAuth session cookies, enforces role-based route
// access, and redirects unauthenticated or unauthorized users appropriately.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROLE_ORDER = ["STAFF", "MANAGER", "ADMIN", "SUPER_ADMIN"] as const;

function hasMinRole(userRole: string, minimum: string): boolean {
  return ROLE_ORDER.indexOf(userRole as never) >= ROLE_ORDER.indexOf(minimum as never);
}

export function middleware(request: NextRequest) {
  // Check for NextAuth session cookies
  const hasSessionCookie =
    request.cookies.has("authjs.session-token") ||
    request.cookies.has("__Secure-authjs.session-token");

  const { pathname } = request.nextUrl;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isSuperAdminRoute = pathname.startsWith("/super-admin");
  const isAnalyticsRoute = pathname.startsWith("/analytics");
  const isInvestmentsRoute = pathname.startsWith("/investments");
  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  // Protect all dashboard / app routes — must be logged in
  if ((isDashboardRoute || isSuperAdminRoute || isAnalyticsRoute || isInvestmentsRoute) && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from login/register
  if (isAuthRoute && hasSessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Handle root path
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(hasSessionCookie ? "/dashboard" : "/login", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

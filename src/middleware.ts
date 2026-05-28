// This middleware checks for the presence of NextAuth session cookies to determine if a user is authenticated. 
// It protects the dashboard routes by redirecting unauthenticated users to the login page, and it also redirects authenticated users away from the login and registration pages to the dashboard. 
// Additionally, it handles the root path by redirecting users based on their authentication status. The middleware is configured to run on all routes except for API routes, static assets, and the favicon. 
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check for NextAuth session cookies
  const hasSessionCookie = 
    request.cookies.has("authjs.session-token") || 
    request.cookies.has("__Secure-authjs.session-token");

  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname.startsWith("/register");

  // Protect dashboard routes
  if (isDashboardRoute && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from login/register to dashboard
  if (isAuthRoute && hasSessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Handle the root path '/' - redirect to dashboard if logged in, else login
  if (request.nextUrl.pathname === "/") {
    if (hasSessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

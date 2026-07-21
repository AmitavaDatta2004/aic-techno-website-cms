// src/proxy.ts
// Route protection proxy (formerly middleware.ts — renamed to proxy.ts in Next.js 16)
//
// Strategy:
//   - All /dashboard/* routes require a session cookie (`cms_authed`).
//   - We set this cookie on the client after successful Firebase sign-in.
//   - The proxy redirects unauthenticated requests to /login.
//   - The proxy redirects authenticated users away from /login to /dashboard.
//
// Note: Firebase tokens cannot be verified in the proxy at the edge without
// the Firebase Admin SDK. We use a lightweight "presence" cookie as a first
// gate; the dashboard layout performs the real token+claim check client-side.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/_next", "/favicon.ico", "/api"];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("cms_authed");
  const isAuthenticated = Boolean(sessionCookie?.value === "1");

  // Already authed → redirect away from /login
  if (pathname === "/login" && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protected route + not authed → redirect to /login
  if (!isPublicPath(pathname) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run proxy on all paths except static files, images, and API routes
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

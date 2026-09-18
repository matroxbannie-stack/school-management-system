import { NextResponse } from "next/server";
import { decodeSession } from "./lib/session";

// Which top-level pages each non-admin role is allowed to open.
// Admins can open everything, so they are not listed here.
const ROUTES_BY_ROLE = {
  TEACHER: ["/", "/students", "/attendance", "/results", "/timetable", "/notices", "/announcements", "/library", "/analytics"],
  PARENT: ["/", "/fees", "/results", "/attendance", "/notices", "/announcements", "/timetable"],
};

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const publicPath = pathname === "/login" || pathname === "/api/login" || pathname.startsWith("/_next") || pathname === "/favicon.ico";
  if (publicPath) return NextResponse.next();

  const raw = request.cookies.get("edumanage_session")?.value;
  const session = decodeSession(raw);

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // API routes enforce their own per-resource, per-method role checks.
  if (pathname.startsWith("/api/")) return NextResponse.next();

  if (session.role !== "ADMIN") {
    const allowed = ROUTES_BY_ROLE[session.role] || ["/"];
    if (!allowed.includes(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/((?!.*\\.(?:png|jpg|jpeg|gif|svg|ico|css|js|map|woff2?)$).*)"] };

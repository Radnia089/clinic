import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, decodeSession } from "@/lib/auth-shared";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/clinic")) {
    return NextResponse.next();
  }

  const session = decodeSession(request.cookies.get(AUTH_COOKIE)?.value);
  if (session) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/clinic/:path*"],
};

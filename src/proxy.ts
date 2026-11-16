import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE, decodeSession } from "@/lib/auth-shared";

function isPublicApi(method: string, pathname: string) {
  if (pathname.startsWith("/api/patient-auth/")) return true;
  if (pathname === "/api/support-tickets") return true;
  if (method === "POST" && pathname === "/api/auth/login") return true;
  if (method === "POST" && pathname === "/api/auth/logout") return true;
  if (method === "GET" && pathname === "/api/auth/me") return true;
  if (method === "POST" && pathname === "/api/appointments") return true;
  if (method === "POST" && pathname === "/api/online-consults") return true;
  if (method === "GET" && pathname === "/api/clinic/about") return true;
  if (
    method === "GET" &&
    (pathname === "/api/articles" ||
      pathname === "/api/champions" ||
      pathname === "/api/promo-banners")
  ) {
    return true;
  }
  return false;
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (isPublicApi(request.method, pathname)) return NextResponse.next();
    const session = decodeSession(request.cookies.get(AUTH_COOKIE)?.value);
    if (!session) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  if (!pathname.startsWith("/clinic")) return NextResponse.next();

  const session = decodeSession(request.cookies.get(AUTH_COOKIE)?.value);
  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/clinic/:path*", "/api/:path*"],
};

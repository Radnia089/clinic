import { NextResponse } from "next/server";
import { AUTH_COOKIE, encodeSession, validateCredentials } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();
  const username = String(body.username ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");

  const user = await validateCredentials(username, password);
  if (!user) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, user });
  response.cookies.set(AUTH_COOKIE, encodeSession(user), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return response;
}

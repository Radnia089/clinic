import { readSignedPayload, signPayload } from "@/lib/session-sign";

export const AUTH_COOKIE = "tandis_session";

export type AuthUser = {
  username: string;
  name: string;
  role: "reception" | "management";
};

export function encodeSession(user: AuthUser): string {
  return signPayload(JSON.stringify(user));
}

export function decodeSession(token?: string | null): AuthUser | null {
  if (!token) return null;
  try {
    const raw = readSignedPayload(token);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.username || !parsed?.name) return null;
    if (parsed.role !== "reception" && parsed.role !== "management") return null;
    return parsed;
  } catch {
    return null;
  }
}

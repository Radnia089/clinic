import { cookies } from "next/headers";
import {
  AUTH_COOKIE,
  decodeSession,
  type AuthUser,
} from "@/lib/auth-shared";

export {
  AUTH_COOKIE,
  decodeSession,
  encodeSession,
  validateCredentials,
  type AuthUser,
} from "@/lib/auth-shared";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  return decodeSession(jar.get(AUTH_COOKIE)?.value);
}

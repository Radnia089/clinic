import { cookies } from "next/headers";
import {
  AUTH_COOKIE,
  decodeSession,
  type AuthUser,
} from "@/lib/auth-shared";
import { validateStaffCredentials } from "@/lib/staff-auth";

export {
  AUTH_COOKIE,
  decodeSession,
  encodeSession,
  type AuthUser,
} from "@/lib/auth-shared";

/** اعتبارسنجی کارکنان از دیتابیس (با seed پیش‌فرض tandis/admin) */
export async function validateCredentials(
  username: string,
  password: string
): Promise<AuthUser | null> {
  return validateStaffCredentials(username, password);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const jar = await cookies();
  return decodeSession(jar.get(AUTH_COOKIE)?.value);
}

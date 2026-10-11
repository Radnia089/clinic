import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password-hash";
import type { AuthUser } from "@/lib/auth-shared";

const DEFAULT_STAFF: Array<AuthUser & { password: string }> = [
  {
    username: "tandis",
    password: "123456",
    name: "منشی تندیس",
    role: "reception",
  },
  {
    username: "admin",
    password: "123456",
    name: "مدیر کلینیک",
    role: "management",
  },
];

export async function ensureDefaultStaffUsers() {
  for (const user of DEFAULT_STAFF) {
    const existing = await prisma.staffUser.findUnique({
      where: { username: user.username },
    });
    if (existing) continue;
    await prisma.staffUser.create({
      data: {
        username: user.username,
        name: user.name,
        role: user.role,
        passwordHash: hashPassword(user.password),
      },
    });
  }
}

export async function validateStaffCredentials(
  username: string,
  password: string
): Promise<AuthUser | null> {
  await ensureDefaultStaffUsers();
  const user = await prisma.staffUser.findUnique({
    where: { username: username.trim().toLowerCase() },
  });
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash)) return null;
  if (user.role !== "reception" && user.role !== "management") return null;
  return {
    username: user.username,
    name: user.name,
    role: user.role,
  };
}

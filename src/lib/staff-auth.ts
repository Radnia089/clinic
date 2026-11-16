import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password-hash";
import type { AuthUser } from "@/lib/auth-shared";

const DEFAULT_STAFF: AuthUser[] = [
  {
    username: "tandis",
    name: "منشی تندیس",
    role: "reception",
  },
  {
    username: "admin",
    name: "مدیر کلینیک",
    role: "management",
  },
];

export async function ensureDefaultStaffUsers() {
  const password = process.env.STAFF_INITIAL_PASSWORD?.trim();
  if (!password || password.length < 8) return;

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
        passwordHash: hashPassword(password),
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

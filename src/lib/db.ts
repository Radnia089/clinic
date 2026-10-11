import path from "path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function resolveDbUrl() {
  const raw = process.env.DATABASE_URL ?? "file:./.data/clinic.db";
  if (raw === ":memory:" || raw.startsWith("file::memory:")) {
    return ":memory:";
  }
  const stripped = raw.replace(/^file:/, "");
  if (path.isAbsolute(stripped)) return stripped;
  return path.join(/*turbopackIgnore: true*/ process.cwd(), stripped);
}

function createPrismaClient() {
  const url = resolveDbUrl();
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function dbPath() {
  return resolveDbUrl();
}

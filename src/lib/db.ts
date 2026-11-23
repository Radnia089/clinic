import fs from "fs";
import path from "path";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma/client";
import { CLINIC_SCHEMA_SQL } from "@/lib/clinic-schema-sql";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  dbFile?: string;
};

function configuredDbPath() {
  const raw = process.env.DATABASE_URL ?? "file:./.data/clinic.db";
  if (raw === ":memory:" || raw.startsWith("file::memory:")) {
    return ":memory:";
  }
  const stripped = raw.replace(/^file:/, "");
  if (path.isAbsolute(stripped)) return stripped;
  return path.join(/*turbopackIgnore: true*/ process.cwd(), stripped);
}

function canOpen(file: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const handle = fs.openSync(file, "a");
  fs.closeSync(handle);
}

/** مسیر تنظیم‌شده، و اگر آن پوشه قابل نوشتن نباشد یک فایل موقت. */
function openableDbPath() {
  if (globalForPrisma.dbFile) return globalForPrisma.dbFile;
  const preferred = configuredDbPath();
  if (preferred === ":memory:") {
    globalForPrisma.dbFile = preferred;
    return preferred;
  }
  const candidates = [preferred, path.join("/tmp", "tandis-clinic", "clinic.db")];
  let lastError: unknown;
  for (const file of candidates) {
    try {
      canOpen(file);
      globalForPrisma.dbFile = file;
      return file;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("clinic database path is not writable");
}

function sqlStatements(sql: string) {
  return sql
    .split(/;\s*(?:\r?\n|$)/)
    .map((part) => part.trim())
    .filter((part) => part.replace(/--[^\n]*/g, "").trim().length > 0);
}

let schemaReady: Promise<void> | null = null;

/** پایگاه تازه جدول ندارد. اسکریپت‌های موجود را فقط در این حالت اجرا می‌کند. */
export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = applySchemaIfEmpty().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  return schemaReady;
}

async function applySchemaIfEmpty() {
  const existing = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'ClinicSettings'"
  );
  if (existing.length > 0) return;

  const scripts = migrationScripts();
  for (const sql of scripts) {
    for (const statement of sqlStatements(sql)) {
      await prisma.$executeRawUnsafe(statement);
    }
  }
}

function migrationScripts() {
  try {
    const root = path.join(/*turbopackIgnore: true*/ process.cwd(), "prisma", "migrations");
    const folders = fs
      .readdirSync(root)
      .filter((name) => fs.existsSync(path.join(root, name, "migration.sql")))
      .sort();
    if (folders.length > 0) {
      return folders.map((folder) => fs.readFileSync(path.join(root, folder, "migration.sql"), "utf8"));
    }
  } catch {
    /* پوشهٔ مهاجرت در بستهٔ پیش‌نمایش نیست */
  }
  return CLINIC_SCHEMA_SQL;
}

function createPrismaClient() {
  const file = openableDbPath();
  const adapter = new PrismaBetterSqlite3({ url: file });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export function dbPath() {
  return openableDbPath();
}

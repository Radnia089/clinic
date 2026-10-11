/**
 * Seed دیتابیس کلینیک تندیس
 * اجرا: npx tsx prisma/seed.ts
 */
import "dotenv/config";
import { ensureDbReady } from "../src/lib/store";
import { dbPath } from "../src/lib/db";

async function main() {
  console.log("Seeding clinic DB at", dbPath());
  await ensureDbReady();
  console.log("Seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

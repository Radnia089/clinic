import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/** فایل نصب روی دیسک سرور است، نه داخل مخزن یا ایمیج. */
export async function GET() {
  const file = path.join(process.cwd(), ".data", "tandis-patient.apk");
  const buffer = await fs.readFile(file).catch(() => null);
  if (!buffer) {
    return NextResponse.json({ error: "unavailable" }, { status: 404 });
  }

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.android.package-archive",
      "Content-Disposition": 'attachment; filename="tandis-patient.apk"',
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

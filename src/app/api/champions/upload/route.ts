import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getCurrentUser } from "@/lib/auth";

async function requireManager() {
  const user = await getCurrentUser();
  if (!user || user.role !== "management") return null;
  return user;
}

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await requireManager())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "missing_file" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "invalid_type", message: "فقط JPG، PNG یا WebP" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "too_large", message: "حجم تصویر حداکثر ۴ مگابایت" },
      { status: 400 }
    );
  }

  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "champions");
  await fs.mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, name), buffer);

  return NextResponse.json({ url: `/uploads/champions/${name}` });
}

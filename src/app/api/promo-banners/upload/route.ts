import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveUploadJpeg } from "@/lib/stored-upload";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "management") {
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

  try {
    const url = await saveUploadJpeg(
      "promos",
      Buffer.from(await file.arrayBuffer()),
      1600
    );
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json(
      { error: "invalid_image", message: "این تصویر قابل ذخیره نیست" },
      { status: 400 }
    );
  }
}

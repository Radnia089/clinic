import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getCurrentPatient } from "@/lib/patient-auth";
import { toPublicPatient } from "@/lib/patient-public";
import { updatePatient } from "@/lib/store";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 3 * 1024 * 1024;

export async function POST(request: Request) {
  const patient = await getCurrentPatient();
  if (!patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
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
      { error: "too_large", message: "حجم تصویر حداکثر ۳ مگابایت" },
      { status: 400 }
    );
  }

  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const name = `${patient.id.slice(0, 8)}-${Date.now()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", "avatars");
  await fs.mkdir(dir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, name), buffer);

  const avatarUrl = `/uploads/avatars/${name}`;
  const updated = await updatePatient(patient.id, {
    avatarUrl,
    appReviewedAt: undefined,
  });

  return NextResponse.json({
    url: avatarUrl,
    patient: updated ? toPublicPatient(updated) : updated,
  });
}

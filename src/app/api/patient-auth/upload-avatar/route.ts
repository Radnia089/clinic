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
  const dir = path.join(process.cwd(), ".data", "avatars");
  await fs.mkdir(dir, { recursive: true });
  for (const old of ["jpg", "png", "webp"]) {
    await fs.unlink(path.join(dir, `${patient.id}.${old}`)).catch(() => undefined);
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(dir, `${patient.id}.${ext}`), buffer);

  const avatarUrl = `/api/patient-auth/avatar/${patient.id}.${ext}`;
  const updated = await updatePatient(patient.id, {
    avatarUrl,
    appReviewedAt: undefined,
  });

  return NextResponse.json({
    url: avatarUrl,
    patient: updated ? toPublicPatient(updated) : updated,
  });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { isPhotoBuffer, PHOTO_PAGE_BYTES, PHOTO_PAGE_LIMIT } from "@/lib/photo-ocr";
import { addRecordPhotos } from "@/lib/record-photos";
import { getPatient } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const patient = await getPatient(id);
  if (!patient) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const files = form.getAll("pages").filter((item): item is File => item instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "empty" }, { status: 400 });
  if (files.length > PHOTO_PAGE_LIMIT) return NextResponse.json({ error: "too_many" }, { status: 400 });

  const pages: Buffer[] = [];
  for (const file of files) {
    if (file.size > PHOTO_PAGE_BYTES) return NextResponse.json({ error: "file_too_large" }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!isPhotoBuffer(bytes)) return NextResponse.json({ error: "image_only" }, { status: 400 });
    pages.push(bytes);
  }

  const stored = await addRecordPhotos(patient.id, pages);
  if (stored.saved.length === 0) return NextResponse.json({ error: "too_many" }, { status: 400 });
  return NextResponse.json({
    photos: stored.saved.map((photoId) => ({ id: photoId })),
    skipped: stored.skipped,
  });
}

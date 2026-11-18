import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { buildImportPlan, parseSpokenRecord } from "@/lib/customer-import";
import { isPhotoBuffer, PHOTO_PAGE_BYTES, PHOTO_PAGE_LIMIT, readPhotoPages } from "@/lib/photo-ocr";
import { listPatients } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

function forbidden() {
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "management") return forbidden();

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  const files = form.getAll("pages").filter((item): item is File => item instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "empty" }, { status: 400 });
  if (files.length > PHOTO_PAGE_LIMIT) return NextResponse.json({ error: "too_many" }, { status: 400 });

  const buffers: Buffer[] = [];
  for (const file of files) {
    if (file.size > PHOTO_PAGE_BYTES) return NextResponse.json({ error: "file_too_large" }, { status: 400 });
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!isPhotoBuffer(bytes)) return NextResponse.json({ error: "image_only" }, { status: 400 });
    buffers.push(bytes);
  }

  let read: { text: string; warnings: string[] };
  try {
    read = await readPhotoPages(buffers);
  } catch (error) {
    if (error instanceof Error && error.message === "ocr_unavailable") {
      return NextResponse.json({ error: "ocr_unavailable" }, { status: 503 });
    }
    return NextResponse.json({ error: "unreadable" }, { status: 400 });
  }
  if (!read.text.trim()) return NextResponse.json({ error: "empty_text" }, { status: 422 });

  const measured = await prisma.measurement.findMany({
    select: { patientId: true },
    distinct: ["patientId"],
  });
  const plan = buildImportPlan([parseSpokenRecord(read.text)], await listPatients(), new Set(measured.map((row) => row.patientId)));
  const item = plan[0];
  if (item) {
    item.warnings.unshift("این اطلاعات از عکس پرونده خوانده شده و قبل از ذخیره باید چک شود.");
    item.warnings.push(...read.warnings);
  }

  return NextResponse.json({
    items: plan,
    text: read.text,
    counts: {
      create: plan.filter((row) => row.action === "create").length,
      fill: plan.filter((row) => row.action === "fill" && !row.unchanged).length,
      unchanged: plan.filter((row) => row.unchanged).length,
      skip: plan.filter((row) => row.action === "skip").length,
      incomplete: plan.filter((row) => row.action !== "skip" && row.missing.includes("موبایل")).length,
      measurements: plan.filter((row) => row.addMeasurement).length,
    },
  });
}

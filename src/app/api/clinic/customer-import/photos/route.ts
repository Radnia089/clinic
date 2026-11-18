import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  buildImportPlan,
  draftFromRecord,
  fillPatch,
  parseSpokenRecord,
  type ImportRecord,
} from "@/lib/customer-import";
import { isPhotoBuffer, PHOTO_PAGE_BYTES, PHOTO_PAGE_LIMIT, readPhotoPages } from "@/lib/photo-ocr";
import { addRecordPhotos } from "@/lib/record-photos";
import { createMeasurement, createPatient, listPatients, updatePatient } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 120;

function forbidden() {
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

async function readPages(form: FormData) {
  const files = form.getAll("pages").filter((item): item is File => item instanceof File);
  if (files.length > PHOTO_PAGE_LIMIT) return { error: "too_many" as const, pages: [] as Buffer[] };
  const pages: Buffer[] = [];
  for (const file of files) {
    if (file.size > PHOTO_PAGE_BYTES) return { error: "file_too_large" as const, pages };
    const bytes = Buffer.from(await file.arrayBuffer());
    if (!isPhotoBuffer(bytes)) return { error: "image_only" as const, pages };
    pages.push(bytes);
  }
  return { error: null, pages };
}

async function commitPhotoImport(form: FormData) {
  const raw = form.get("record");
  if (typeof raw !== "string") return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  let record: ImportRecord;
  try {
    record = JSON.parse(raw) as ImportRecord;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const uploaded = await readPages(form);
  if (uploaded.error) return NextResponse.json({ error: uploaded.error }, { status: 400 });

  const measuredRows = await prisma.measurement.findMany({
    select: { patientId: true },
    distinct: ["patientId"],
  });
  const patients = await listPatients();
  const item = buildImportPlan([record], patients, new Set(measuredRows.map((row) => row.patientId)))[0];
  if (!item || item.action === "skip") return NextResponse.json({ error: "empty" }, { status: 400 });

  const { draft } = draftFromRecord(item.record);
  let patientId = item.existingId;
  let created = 0;
  let filled = 0;
  if (item.action === "create") {
    const patient = await createPatient({
      firstName: draft.firstName,
      lastName: draft.lastName,
      age: draft.age,
      gender: draft.gender,
      phone: draft.phone,
      nationalId: draft.nationalId,
      address: draft.address,
      province: draft.province,
      city: draft.city,
      birthDate: draft.birthDate,
      notes: draft.notes,
      heightCm: draft.heightCm,
      goalWeightKg: draft.goalWeightKg,
      source: "clinic",
      profileComplete: Boolean(draft.firstName && draft.lastName && draft.phone),
    });
    patientId = patient.id;
    created = 1;
  } else if (patientId && !item.unchanged) {
    const existing = patients.find((person) => person.id === patientId);
    if (!existing) return NextResponse.json({ error: "unreadable" }, { status: 400 });
    const updated = await updatePatient(patientId, fillPatch(existing, draft));
    if (!updated) return NextResponse.json({ error: "unreadable" }, { status: 400 });
    filled = 1;
  }
  if (!patientId) return NextResponse.json({ error: "unreadable" }, { status: 400 });

  let measurements = 0;
  if (item.addMeasurement && draft.weightKg != null) {
    await createMeasurement({
      patientId,
      recordedAt: new Date().toISOString(),
      weightKg: draft.weightKg,
      waistCm: draft.waistCm,
      hipCm: draft.hipCm,
      note: "انتقال از پرونده قبلی",
    });
    measurements = 1;
  }
  let stored: { saved: string[]; skipped: number };
  try {
    stored = await addRecordPhotos(patientId, uploaded.pages);
  } catch (error) {
    if (created) await prisma.patient.delete({ where: { id: patientId } }).catch(() => undefined);
    throw error;
  }
  return NextResponse.json({
    created,
    filled,
    skipped: 0,
    unchanged: item.unchanged ? 1 : 0,
    measurements,
    errors: [],
    patientId,
    photos: stored.saved.length,
    photosSkipped: stored.skipped,
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "management") return forbidden();

  const form = await request.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  if (String(form.get("action") ?? "") === "commit") return commitPhotoImport(form);

  const uploaded = await readPages(form);
  if (uploaded.error) return NextResponse.json({ error: uploaded.error }, { status: 400 });
  if (uploaded.pages.length === 0) return NextResponse.json({ error: "empty" }, { status: 400 });

  let read: { text: string; warnings: string[] };
  try {
    read = await readPhotoPages(uploaded.pages);
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

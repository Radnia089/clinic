import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  IMPORT_ROW_LIMIT,
  buildImportPlan,
  draftFromRecord,
  fillPatch,
  parseSpokenRecord,
  recordsFromWorkbook,
  type ImportRecord,
} from "@/lib/customer-import";
import { createMeasurement, createPatient, listPatients, updatePatient } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024;

function forbidden() {
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

async function measurementOwners() {
  const rows = await prisma.measurement.findMany({
    select: { patientId: true },
    distinct: ["patientId"],
  });
  return new Set(rows.map((row) => row.patientId));
}

function countsOf(items: ReturnType<typeof buildImportPlan>) {
  return {
    create: items.filter((item) => item.action === "create").length,
    fill: items.filter((item) => item.action === "fill" && !item.unchanged).length,
    unchanged: items.filter((item) => item.unchanged).length,
    skip: items.filter((item) => item.action === "skip").length,
    incomplete: items.filter((item) => item.action !== "skip" && item.missing.includes("موبایل")).length,
    measurements: items.filter((item) => item.addMeasurement).length,
  };
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "management") return forbidden();

  const contentType = request.headers.get("content-type") ?? "";
  let records: ImportRecord[] = [];
  let commit = false;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    commit = form.get("commit") === "1";
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file_required" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "file_too_large" }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      return NextResponse.json({ error: "xlsx_only" }, { status: 400 });
    }
    try {
      records = await recordsFromWorkbook(Buffer.from(await file.arrayBuffer()));
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      return NextResponse.json(
        { error: code === "unknown_headers" ? "unknown_headers" : "unreadable" },
        { status: 400 }
      );
    }
  } else {
    const body = (await request.json().catch(() => null)) as {
      action?: string;
      records?: ImportRecord[];
      text?: string;
    } | null;
    if (!body) return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    commit = body.action === "commit";
    if (typeof body.text === "string" && body.text.trim()) {
      records = [parseSpokenRecord(body.text)];
    } else if (Array.isArray(body.records)) {
      records = body.records.slice(0, IMPORT_ROW_LIMIT);
    }
  }

  if (records.length === 0) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const [patients, measured] = await Promise.all([listPatients(), measurementOwners()]);
  const plan = buildImportPlan(records, patients, measured);

  if (!commit) {
    return NextResponse.json({
      items: plan,
      counts: countsOf(plan),
      truncated: records.length >= IMPORT_ROW_LIMIT,
    });
  }

  let created = 0;
  let filled = 0;
  let measurements = 0;
  const errors: string[] = [];

  for (const item of plan) {
    if (item.action === "skip" || item.unchanged) continue;
    const { draft } = draftFromRecord(item.record);
    try {
      const patient =
        item.action === "create"
          ? await createPatient({
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
            })
          : await updatePatient(item.existingId!, fillPatch(
              patients.find((person) => person.id === item.existingId)!,
              draft
            ));
      if (!patient) {
        errors.push(`ردیف ${item.row} ذخیره نشد.`);
        continue;
      }
      if (item.action === "create") created += 1;
      else filled += 1;
      if (item.addMeasurement && draft.weightKg != null) {
        await createMeasurement({
          patientId: patient.id,
          recordedAt: new Date().toISOString(),
          weightKg: draft.weightKg,
          waistCm: draft.waistCm,
          hipCm: draft.hipCm,
          note: "انتقال از پرونده قبلی",
        });
        measurements += 1;
      }
    } catch {
      errors.push(`ردیف ${item.row} ذخیره نشد.`);
    }
  }

  return NextResponse.json({
    created,
    filled,
    skipped: plan.filter((item) => item.action === "skip").length,
    unchanged: plan.filter((item) => item.unchanged).length,
    measurements,
    errors,
  });
}

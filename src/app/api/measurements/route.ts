import { NextResponse } from "next/server";
import {
  createMeasurement,
  ensureDemoPatientProgress,
  getPatient,
  listMeasurements,
  listPatients,
  updatePatient,
} from "@/lib/store";
import { parseNormalizedNumber } from "@/lib/digits";

function parseOptionalPositive(raw: unknown) {
  if (raw === undefined || raw === null || raw === "") return undefined;
  const n = parseNormalizedNumber(String(raw));
  if (!Number.isFinite(n) || n <= 0) return NaN;
  return n;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");
  const demo = searchParams.get("demo") === "1";

  if (demo) {
    const demoData = await ensureDemoPatientProgress();
    return NextResponse.json(demoData);
  }

  const [measurements, patients] = await Promise.all([
    listMeasurements(patientId ?? undefined),
    listPatients(),
  ]);
  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));

  return NextResponse.json({
    patient: patientId ? patientMap[patientId] ?? null : null,
    measurements: measurements.map((m) => ({
      ...m,
      patient: patientMap[m.patientId] ?? null,
    })),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const patientId = String(body.patientId ?? "");
  const recordedAt = String(body.recordedAt ?? new Date().toISOString());
  const weightKg = parseNormalizedNumber(String(body.weightKg ?? ""));
  const waistCm = parseNormalizedNumber(String(body.waistCm ?? ""));
  const hipCm = parseOptionalPositive(body.hipCm);
  const armCm = parseOptionalPositive(body.armCm);
  const thighCm = parseOptionalPositive(body.thighCm);
  const calfCm = parseOptionalPositive(body.calfCm);
  const note = body.note ? String(body.note).trim() : undefined;

  if (
    !patientId ||
    !Number.isFinite(weightKg) ||
    weightKg <= 0 ||
    !Number.isFinite(waistCm) ||
    waistCm <= 0
  ) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  for (const [key, value] of Object.entries({ hipCm, armCm, thighCm, calfCm })) {
    if (Number.isNaN(value as number)) {
      return NextResponse.json({ error: `invalid_${key}` }, { status: 400 });
    }
  }

  const patient = await getPatient(patientId);
  if (!patient) {
    return NextResponse.json({ error: "patient_not_found" }, { status: 404 });
  }

  const measurement = await createMeasurement({
    patientId,
    recordedAt,
    weightKg,
    waistCm,
    hipCm: hipCm !== undefined && Number.isFinite(hipCm) ? hipCm : undefined,
    armCm: armCm !== undefined && Number.isFinite(armCm) ? armCm : undefined,
    thighCm:
      thighCm !== undefined && Number.isFinite(thighCm) ? thighCm : undefined,
    calfCm:
      calfCm !== undefined && Number.isFinite(calfCm) ? calfCm : undefined,
    note,
  });

  // هدف وزن / قد روی پرونده مشتری هم از همین مسیر قابل به‌روزرسانی است
  const patientPatch: {
    heightCm?: number;
    goalWeightKg?: number;
  } = {};
  if (body.heightCm !== undefined && body.heightCm !== "") {
    const heightCm = parseNormalizedNumber(String(body.heightCm));
    if (Number.isFinite(heightCm) && heightCm >= 100 && heightCm <= 230) {
      patientPatch.heightCm = heightCm;
    }
  }
  if (body.goalWeightKg !== undefined && body.goalWeightKg !== "") {
    const goalWeightKg = parseNormalizedNumber(String(body.goalWeightKg));
    if (Number.isFinite(goalWeightKg) && goalWeightKg >= 30 && goalWeightKg <= 250) {
      patientPatch.goalWeightKg = goalWeightKg;
    }
  }
  if (Object.keys(patientPatch).length > 0) {
    await updatePatient(patientId, patientPatch);
  }

  return NextResponse.json({ measurement }, { status: 201 });
}

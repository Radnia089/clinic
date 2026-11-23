import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { toPublicPatient } from "@/lib/patient-public";
import {
  createMeasurement,
  ensureDemoPatientProgress,
  getPatient,
  listMeasurements,
  listPatients,
  updatePatient,
} from "@/lib/store";
import { calculateBmi } from "@/lib/bmi";
import { parseNormalizedNumber } from "@/lib/digits";
import { isVisitSessionAllowed } from "@/lib/visit-sessions";

function parseOptionalPositive(raw: unknown) {
  if (raw === undefined || raw === null || raw === "") return undefined;
  const n = parseNormalizedNumber(String(raw));
  if (!Number.isFinite(n) || n <= 0) return NaN;
  return n;
}

async function requireStaff() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  return null;
}

export async function GET(request: Request) {
  const denied = await requireStaff();
  if (denied) return denied;
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
  const patientMap = Object.fromEntries(
    patients.map((p) => [p.id, toPublicPatient(p)])
  );

  return NextResponse.json({
    patient: patientId ? patientMap[patientId] ?? null : null,
    measurements: measurements.map((m) => ({
      ...m,
      patient: patientMap[m.patientId] ?? null,
    })),
  });
}

export async function POST(request: Request) {
  const denied = await requireStaff();
  if (denied) return denied;
  const body = await request.json();
  const patientId = String(body.patientId ?? "");
  const recordedAt = String(body.recordedAt ?? new Date().toISOString());
  const weightKg = parseNormalizedNumber(String(body.weightKg ?? ""));
  const waistRaw =
    body.waistCm !== undefined && body.waistCm !== ""
      ? parseNormalizedNumber(String(body.waistCm))
      : undefined;
  const numericKeys = [
    "hipCm",
    "armCm",
    "thighCm",
    "calfCm",
    "heightCm",
    "bmi",
    "bodyFatPct",
    "muscleMassKg",
    "visceralFat",
    "rmr",
    "armRightCm",
    "armLeftCm",
    "chestCm",
    "waistBelowCm",
    "thighRightCm",
    "thighLeftCm",
    "kneeRightCm",
    "kneeLeftCm",
    "calfRightCm",
    "calfLeftCm",
  ] as const;
  const numbers: Partial<Record<(typeof numericKeys)[number], number>> = {};
  for (const key of numericKeys) {
    const value = parseOptionalPositive(body[key]);
    if (Number.isNaN(value as number)) {
      return NextResponse.json({ error: `invalid_${key}` }, { status: 400 });
    }
    if (value !== undefined && Number.isFinite(value)) numbers[key] = value;
  }
  const note = body.note ? String(body.note).trim() : undefined;
  const sessionLabel = body.sessionLabel
    ? String(body.sessionLabel).trim().slice(0, 40)
    : "";

  if (!patientId || !Number.isFinite(weightKg) || weightKg <= 0) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }
  if (waistRaw !== undefined && (!Number.isFinite(waistRaw) || waistRaw <= 0)) {
    return NextResponse.json({ error: "invalid_waist" }, { status: 400 });
  }
  if (
    numbers.heightCm !== undefined &&
    (numbers.heightCm < 100 || numbers.heightCm > 230)
  ) {
    return NextResponse.json({ error: "invalid_heightCm" }, { status: 400 });
  }

  const patient = await getPatient(patientId);
  if (!patient) {
    return NextResponse.json({ error: "patient_not_found" }, { status: 404 });
  }

  const earlier = await listMeasurements(patientId);
  if (!isVisitSessionAllowed(sessionLabel, earlier.map((item) => item.sessionLabel))) {
    return NextResponse.json({ error: "session_in_past" }, { status: 400 });
  }

  const heightForBmi = numbers.heightCm;
  const bmi =
    numbers.bmi ??
    (heightForBmi
      ? Math.round(calculateBmi(weightKg, heightForBmi) * 10) / 10
      : undefined);

  const measurement = await createMeasurement({
    patientId,
    recordedAt,
    weightKg,
    waistCm: waistRaw,
    ...numbers,
    bmi,
    armCm: numbers.armCm ?? numbers.armRightCm ?? numbers.armLeftCm,
    thighCm: numbers.thighCm ?? numbers.thighRightCm ?? numbers.thighLeftCm,
    calfCm: numbers.calfCm ?? numbers.calfRightCm ?? numbers.calfLeftCm,
    sessionLabel,
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

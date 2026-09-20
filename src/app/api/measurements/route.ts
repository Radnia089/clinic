import { NextResponse } from "next/server";
import {
  createMeasurement,
  ensureDemoPatientProgress,
  listMeasurements,
  listPatients,
} from "@/lib/store";

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
  const weightKg = Number(body.weightKg);
  const waistCm = Number(body.waistCm);
  const hipCm = body.hipCm !== undefined && body.hipCm !== "" ? Number(body.hipCm) : undefined;
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

  const measurement = await createMeasurement({
    patientId,
    recordedAt,
    weightKg,
    waistCm,
    hipCm: Number.isFinite(hipCm as number) ? hipCm : undefined,
    note,
  });

  return NextResponse.json({ measurement }, { status: 201 });
}

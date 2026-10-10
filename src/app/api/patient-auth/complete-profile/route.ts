import { NextResponse } from "next/server";
import { parseNormalizedNumber } from "@/lib/digits";
import { getCurrentPatient } from "@/lib/patient-auth";
import { toPublicPatient } from "@/lib/patient-public";
import { createMeasurement, updatePatient } from "@/lib/store";
import type { Gender } from "@/lib/types";

export async function POST(request: Request) {
  const patient = await getCurrentPatient();
  if (!patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const gender = (body.gender as Gender) || "female";
  const ageRaw = String(body.age ?? "").trim();
  const age = ageRaw ? parseNormalizedNumber(ageRaw) : undefined;
  const address = String(body.address ?? "").trim();
  const heightCmRaw = String(body.heightCm ?? "").trim();
  const weightKgRaw = String(body.weightKg ?? "").trim();
  const goalWeightKgRaw = String(body.goalWeightKg ?? "").trim();
  const waistCmRaw = String(body.waistCm ?? "").trim();

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }
  if (!["female", "male"].includes(gender)) {
    return NextResponse.json({ error: "invalid_gender" }, { status: 400 });
  }
  if (age != null && (!Number.isFinite(age) || age < 10 || age > 100)) {
    return NextResponse.json({ error: "invalid_age" }, { status: 400 });
  }

  const heightCm = heightCmRaw ? parseNormalizedNumber(heightCmRaw) : undefined;
  const weightKg = weightKgRaw ? parseNormalizedNumber(weightKgRaw) : undefined;
  const goalWeightKg = goalWeightKgRaw
    ? parseNormalizedNumber(goalWeightKgRaw)
    : undefined;
  const waistCm = waistCmRaw ? parseNormalizedNumber(waistCmRaw) : undefined;

  const updated = await updatePatient(patient.id, {
    firstName,
    lastName,
    gender,
    age,
    address,
    heightCm:
      heightCm != null && Number.isFinite(heightCm) ? heightCm : patient.heightCm,
    goalWeightKg:
      goalWeightKg != null && Number.isFinite(goalWeightKg)
        ? goalWeightKg
        : patient.goalWeightKg,
    profileComplete: true,
    // نگه داشتن منبع؛ اگر از اپ آمده app می‌ماند
    source: patient.source === "clinic" ? "clinic" : "app",
  });

  if (
    updated &&
    weightKg != null &&
    Number.isFinite(weightKg) &&
    weightKg > 0 &&
    waistCm != null &&
    Number.isFinite(waistCm) &&
    waistCm > 0
  ) {
    await createMeasurement({
      patientId: updated.id,
      recordedAt: new Date().toISOString(),
      weightKg,
      waistCm,
      note: "ثبت اولیه از اپ مشتری",
    });
  }

  return NextResponse.json({
    patient: updated ? toPublicPatient(updated) : updated,
  });
}

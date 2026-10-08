import { NextResponse } from "next/server";
import { parseNormalizedNumber } from "@/lib/digits";
import { getCurrentPatient } from "@/lib/patient-auth";
import { createMeasurement, listMeasurements, updatePatient } from "@/lib/store";
import type { Gender } from "@/lib/types";

export async function POST(request: Request) {
  const patient = await getCurrentPatient();
  if (!patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const gender = (body.gender as Gender) || patient.gender || "female";
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
    source: patient.source === "clinic" ? "clinic" : "app",
    // تا مدیریت تغییر را دوباره ببیند و بررسی کند
    appReviewedAt: undefined,
  });

  if (updated && weightKg != null && Number.isFinite(weightKg) && weightKg > 0) {
    const existing = await listMeasurements(updated.id);
    const last = existing[existing.length - 1];
    const nextWaist =
      waistCm != null && Number.isFinite(waistCm) && waistCm > 0
        ? waistCm
        : last?.waistCm;
    if (nextWaist != null && nextWaist > 0) {
      await createMeasurement({
        patientId: updated.id,
        recordedAt: new Date().toISOString(),
        weightKg,
        waistCm: nextWaist,
        note: "به‌روزرسانی از اپ مشتری",
      });
    }
  }

  const measurements = await listMeasurements(updated!.id);
  return NextResponse.json({ patient: updated, measurements });
}

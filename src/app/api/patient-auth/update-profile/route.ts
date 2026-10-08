import { NextResponse } from "next/server";
import { parseNormalizedNumber } from "@/lib/digits";
import { getCurrentPatient } from "@/lib/patient-auth";
import { patientHasRegisteredInfo } from "@/lib/patient-profile";
import { createMeasurement, listMeasurements, updatePatient } from "@/lib/store";
import type { Gender } from "@/lib/types";

function parseOptionalNumber(raw: unknown) {
  if (raw === undefined || raw === null || String(raw).trim() === "") {
    return undefined;
  }
  const n = parseNormalizedNumber(String(raw));
  return Number.isFinite(n) ? n : NaN;
}

export async function POST(request: Request) {
  const patient = await getCurrentPatient();
  if (!patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));

  // هیچ فیلدی اجباری نیست؛ هر چه ارسال شود ذخیره می‌شود
  const firstName =
    body.firstName !== undefined
      ? String(body.firstName).trim()
      : patient.firstName;
  const lastName =
    body.lastName !== undefined
      ? String(body.lastName).trim()
      : patient.lastName;
  const address =
    body.address !== undefined
      ? String(body.address).trim()
      : patient.address;

  let gender: Gender = patient.gender;
  if (body.gender !== undefined && body.gender !== "") {
    if (!["female", "male"].includes(String(body.gender))) {
      return NextResponse.json({ error: "invalid_gender" }, { status: 400 });
    }
    gender = body.gender as Gender;
  }

  let age = patient.age;
  if (body.age !== undefined) {
    if (body.age === "" || body.age === null) {
      age = undefined;
    } else {
      const parsed = parseOptionalNumber(body.age);
      if (Number.isNaN(parsed as number)) {
        return NextResponse.json({ error: "invalid_age" }, { status: 400 });
      }
      age = parsed;
    }
  }

  let heightCm = patient.heightCm;
  if (body.heightCm !== undefined) {
    if (body.heightCm === "" || body.heightCm === null) {
      heightCm = undefined;
    } else {
      const parsed = parseOptionalNumber(body.heightCm);
      if (Number.isNaN(parsed as number)) {
        return NextResponse.json({ error: "invalid_height" }, { status: 400 });
      }
      heightCm = parsed;
    }
  }

  let goalWeightKg = patient.goalWeightKg;
  if (body.goalWeightKg !== undefined) {
    if (body.goalWeightKg === "" || body.goalWeightKg === null) {
      goalWeightKg = undefined;
    } else {
      const parsed = parseOptionalNumber(body.goalWeightKg);
      if (Number.isNaN(parsed as number)) {
        return NextResponse.json({ error: "invalid_goal" }, { status: 400 });
      }
      goalWeightKg = parsed;
    }
  }

  const weightKg = parseOptionalNumber(body.weightKg);
  const waistCm = parseOptionalNumber(body.waistCm);
  if (Number.isNaN(weightKg as number)) {
    return NextResponse.json({ error: "invalid_weight" }, { status: 400 });
  }
  if (Number.isNaN(waistCm as number)) {
    return NextResponse.json({ error: "invalid_waist" }, { status: 400 });
  }

  const avatarUrl =
    body.avatarUrl !== undefined
      ? String(body.avatarUrl || "").trim() || undefined
      : patient.avatarUrl;

  const draft = {
    ...patient,
    firstName,
    lastName,
    gender,
    age,
    address,
    heightCm,
    goalWeightKg,
    avatarUrl,
  };

  const updated = await updatePatient(patient.id, {
    firstName,
    lastName,
    gender,
    age,
    address,
    heightCm,
    goalWeightKg,
    avatarUrl,
    profileComplete: patientHasRegisteredInfo(draft) || patient.profileComplete,
    source: patient.source === "clinic" ? "clinic" : "app",
    appReviewedAt: undefined,
  });

  if (updated && weightKg != null && weightKg > 0) {
    const existing = await listMeasurements(updated.id);
    const last = existing[existing.length - 1];
    const nextWaist =
      waistCm != null && waistCm > 0 ? waistCm : last?.waistCm;
    await createMeasurement({
      patientId: updated.id,
      recordedAt: new Date().toISOString(),
      weightKg,
      waistCm: nextWaist != null && nextWaist > 0 ? nextWaist : undefined,
      note: "به‌روزرسانی از اپ مشتری",
    });
  }

  const measurements = await listMeasurements(updated!.id);
  return NextResponse.json({ patient: updated, measurements });
}

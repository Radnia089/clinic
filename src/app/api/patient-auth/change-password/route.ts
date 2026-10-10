import { NextResponse } from "next/server";
import { getCurrentPatient } from "@/lib/patient-auth";
import {
  isValidNationalId,
  normalizeNationalId,
} from "@/lib/national-id";
import {
  hashPatientPassword,
  validatePatientPassword,
  verifyPatientPassword,
} from "@/lib/patient-password";
import { updatePatient } from "@/lib/store";

export async function POST(request: Request) {
  const patient = await getCurrentPatient();
  if (!patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!patient.phone) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const current = validatePatientPassword(String(body.currentPassword ?? ""));
  const next = validatePatientPassword(String(body.newPassword ?? ""));
  const nationalIdRaw = String(body.nationalId ?? "").trim();
  const nationalId = nationalIdRaw
    ? normalizeNationalId(nationalIdRaw)
    : undefined;

  if (!current.ok || !next.ok) {
    return NextResponse.json({ error: "invalid_length" }, { status: 400 });
  }
  if (!patient.passwordHash) {
    return NextResponse.json({ error: "no_password" }, { status: 409 });
  }
  if (!verifyPatientPassword(current.password, patient.passwordHash)) {
    return NextResponse.json({ error: "invalid_current" }, { status: 401 });
  }
  if (current.password === next.password) {
    return NextResponse.json({ error: "same_password" }, { status: 400 });
  }

  // اگر کد ملی در پرونده نیست، از فرم بگیر و ثبت کن
  if (!patient.nationalId) {
    if (!nationalId || !isValidNationalId(nationalId)) {
      return NextResponse.json(
        { error: "invalid_national_id" },
        { status: 400 }
      );
    }
  }

  const updated = await updatePatient(patient.id, {
    passwordHash: hashPatientPassword(next.password),
    passwordSetAt: new Date().toISOString(),
    ...(!patient.nationalId && nationalId ? { nationalId } : {}),
  });

  if (!updated) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, nationalIdSaved: !patient.nationalId });
}

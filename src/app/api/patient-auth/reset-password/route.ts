import { NextResponse } from "next/server";
import { normalizeIntegerInput } from "@/lib/digits";
import {
  isValidNationalId,
  nationalIdsMatch,
  normalizeNationalId,
} from "@/lib/national-id";
import {
  hashPatientPassword,
  patientHasPassword,
  validatePatientPassword,
} from "@/lib/patient-password";
import { establishPatientSession } from "@/lib/patient-session";
import { findPatientByPhone, updatePatient } from "@/lib/store";

/**
 * بازیابی رمز با شماره موبایل + کد ملی (بدون OTP)
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizeIntegerInput(String(body.phone ?? ""));
  const nationalId = normalizeNationalId(String(body.nationalId ?? ""));
  const validated = validatePatientPassword(String(body.password ?? ""));

  if (!/^09\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }
  if (!isValidNationalId(nationalId)) {
    return NextResponse.json({ error: "invalid_national_id" }, { status: 400 });
  }
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const patient = await findPatientByPhone(phone);
  if (!patient) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (!patient.nationalId) {
    return NextResponse.json({ error: "national_id_missing" }, { status: 409 });
  }
  if (!nationalIdsMatch(patient.nationalId, nationalId)) {
    return NextResponse.json({ error: "national_id_mismatch" }, { status: 401 });
  }
  if (!patientHasPassword(patient)) {
    return NextResponse.json({ error: "no_password" }, { status: 409 });
  }

  const now = new Date().toISOString();
  const updated =
    (await updatePatient(patient.id, {
      passwordHash: hashPatientPassword(validated.password),
      passwordSetAt: now,
    })) ?? patient;

  const remember = body.remember !== false;
  const session = await establishPatientSession(updated, { remember });
  return NextResponse.json({ ok: true, ...session });
}

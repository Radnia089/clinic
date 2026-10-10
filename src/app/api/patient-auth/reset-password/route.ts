import { NextResponse } from "next/server";
import { normalizeIntegerInput } from "@/lib/digits";
import {
  hashPatientPassword,
  validatePatientPassword,
} from "@/lib/patient-password";
import { verifyPatientOtp } from "@/lib/patient-otp";
import { establishPatientSession } from "@/lib/patient-session";
import { findPatientByPhone, updatePatient } from "@/lib/store";

/**
 * بازنشانی رمز بعد از تأیید OTP فراموشی رمز
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizeIntegerInput(String(body.phone ?? ""));
  const code = String(body.code ?? "").trim();
  const validated = validatePatientPassword(String(body.password ?? ""));

  if (!/^09\d{9}$/.test(phone) || !/^\d{5}$/.test(code)) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const verified = await verifyPatientOtp(phone, code);
  if (!verified.ok) {
    const status =
      verified.error === "expired" || verified.error === "too_many" ? 410 : 401;
    return NextResponse.json({ error: verified.error }, { status });
  }

  const patient = await findPatientByPhone(phone);
  if (!patient) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const now = new Date().toISOString();
  const updated =
    (await updatePatient(patient.id, {
      passwordHash: hashPatientPassword(validated.password),
      passwordSetAt: now,
      phoneVerifiedAt: now,
    })) ?? patient;

  const session = await establishPatientSession(updated);
  return NextResponse.json({ ok: true, ...session });
}

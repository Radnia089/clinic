import { NextResponse } from "next/server";
import { normalizeIntegerInput } from "@/lib/digits";
import {
  isValidNationalId,
  nationalIdsMatch,
  normalizeNationalId,
} from "@/lib/national-id";
import {
  hashPatientPassword,
  validatePatientPassword,
} from "@/lib/patient-password";
import { verifyPatientOtp } from "@/lib/patient-otp";
import { establishPatientSession } from "@/lib/patient-session";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { findPatientByPhone, updatePatient } from "@/lib/store";

/**
 * بازیابی رمز فقط با کد پیامک همان شماره.
 * کد ملی به‌تنهایی کافی نیست.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizeIntegerInput(String(body.phone ?? ""));
  const nationalId = normalizeNationalId(String(body.nationalId ?? ""));
  const validated = validatePatientPassword(String(body.password ?? ""));
  const otp = String(body.otp ?? "");

  if (!/^09\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }
  const limited = rateLimit(`reset:${phone}:${clientIp(request)}`, 8, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  if (!isValidNationalId(nationalId)) {
    return NextResponse.json({ error: "invalid_national_id" }, { status: 400 });
  }
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 });
  }

  const otpResult = await verifyPatientOtp(phone, otp);
  if (!otpResult.ok) {
    return NextResponse.json({ error: "otp_invalid" }, { status: 401 });
  }

  const patient = await findPatientByPhone(phone);
  if (!patient) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (
    !patient.nationalId ||
    !nationalIdsMatch(patient.nationalId, nationalId)
  ) {
    return NextResponse.json({ error: "national_id_mismatch" }, { status: 401 });
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

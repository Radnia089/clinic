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
import { verifyPatientOtp } from "@/lib/patient-otp";
import { establishPatientSession } from "@/lib/patient-session";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import {
  createPatient,
  findPatientByPhone,
  updatePatient,
} from "@/lib/store";

/**
 * اولین رمز فقط بعد از کد پیامک همان شماره.
 * کد ملی به‌تنهایی مالکیت شماره را ثابت نمی‌کند.
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
  const limited = rateLimit(`set-password:${phone}:${clientIp(request)}`, 8, 15 * 60 * 1000);
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

  let patient = await findPatientByPhone(phone);
  if (patientHasPassword(patient)) {
    return NextResponse.json({ error: "password_exists" }, { status: 409 });
  }
  if (
    patient &&
    (!patient.nationalId || !nationalIdsMatch(patient.nationalId, nationalId))
  ) {
    return NextResponse.json({ error: "national_id_mismatch" }, { status: 401 });
  }

  const now = new Date().toISOString();
  const passwordHash = hashPatientPassword(validated.password);

  if (!patient) {
    patient = await createPatient({
      firstName: "",
      lastName: "",
      gender: "female",
      phone,
      nationalId,
      address: "",
      source: "app",
      profileComplete: false,
      phoneVerifiedAt: now,
      passwordHash,
      passwordSetAt: now,
    });
  } else {
    patient =
      (await updatePatient(patient.id, {
        passwordHash,
        passwordSetAt: now,
        phoneVerifiedAt: patient.phoneVerifiedAt ?? now,
      })) ?? patient;
  }

  const remember = body.remember !== false;
  const session = await establishPatientSession(patient, { remember });
  return NextResponse.json({
    ok: true,
    isNew: !patient.firstName && !patient.lastName,
    ...session,
  });
}

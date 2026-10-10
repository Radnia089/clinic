import { NextResponse } from "next/server";
import { normalizeIntegerInput } from "@/lib/digits";
import {
  isValidNationalId,
  normalizeNationalId,
} from "@/lib/national-id";
import {
  hashPatientPassword,
  patientHasPassword,
  validatePatientPassword,
} from "@/lib/patient-password";
import { establishPatientSession } from "@/lib/patient-session";
import {
  createPatient,
  findPatientByPhone,
  updatePatient,
} from "@/lib/store";

/**
 * اولین ورود: ساخت/ثبت رمز کوتاه بدون OTP
 * فقط وقتی هنوز رمزی برای این شماره تنظیم نشده باشد.
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

  let patient = await findPatientByPhone(phone);
  if (patientHasPassword(patient)) {
    return NextResponse.json({ error: "password_exists" }, { status: 409 });
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
        nationalId: patient.nationalId || nationalId,
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

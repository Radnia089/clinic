import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { normalizeIntegerInput } from "@/lib/digits";
import {
  PATIENT_AUTH_COOKIE,
  encodePatientSession,
} from "@/lib/patient-auth";
import { verifyPatientOtp } from "@/lib/patient-otp";
import { patientHasRegisteredInfo } from "@/lib/patient-profile";
import {
  createPatient,
  findPatientByPhone,
  updatePatient,
} from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizeIntegerInput(String(body.phone ?? ""));
  const code = String(body.code ?? "").trim();

  if (!/^09\d{9}$/.test(phone) || !/^\d{5}$/.test(code)) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const verified = await verifyPatientOtp(phone, code);
  if (!verified.ok) {
    const status =
      verified.error === "expired" || verified.error === "too_many" ? 410 : 401;
    return NextResponse.json({ error: verified.error }, { status });
  }

  const now = new Date().toISOString();
  let patient = await findPatientByPhone(phone);
  let isNew = false;

  if (!patient) {
    isNew = true;
    patient = await createPatient({
      firstName: "",
      lastName: "",
      gender: "female",
      phone,
      address: "",
      source: "app",
      profileComplete: false,
      phoneVerifiedAt: now,
    });
  } else {
    const alreadyRegistered = patientHasRegisteredInfo(patient);
    patient =
      (await updatePatient(patient.id, {
        phoneVerifiedAt: now,
        // اگر اطلاعات از قبل ثبت شده، دیگر فرم تکمیل لازم نیست
        ...(alreadyRegistered && !patient.profileComplete
          ? { profileComplete: true }
          : {}),
      })) ?? patient;
  }

  const needsProfile = !patientHasRegisteredInfo(patient);

  const jar = await cookies();
  jar.set(
    PATIENT_AUTH_COOKIE,
    encodePatientSession({ patientId: patient.id, phone: patient.phone }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    }
  );

  return NextResponse.json({
    patient,
    isNew,
    needsProfile,
    alreadyRegistered: !needsProfile,
  });
}

import { cookies } from "next/headers";
import {
  PATIENT_AUTH_COOKIE,
  encodePatientSession,
} from "@/lib/patient-auth";
import { patientHasRegisteredInfo } from "@/lib/patient-profile";
import { toPublicPatient } from "@/lib/patient-public";
import type { Patient } from "@/lib/types";

/** با ذخیره رمز: ۹۰ روز؛ بدون آن: فقط تا بستن مرورگر (جلسه) */
const REMEMBER_MAX_AGE = 60 * 60 * 24 * 90;

export async function establishPatientSession(
  patient: Patient,
  options?: { remember?: boolean }
) {
  const remember = options?.remember !== false;
  const jar = await cookies();
  jar.set(
    PATIENT_AUTH_COOKIE,
    encodePatientSession({ patientId: patient.id, phone: patient.phone }),
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      ...(remember ? { maxAge: REMEMBER_MAX_AGE } : {}),
    }
  );

  const needsProfile = !patientHasRegisteredInfo(patient);
  return {
    patient: toPublicPatient(patient),
    needsProfile,
    alreadyRegistered: !needsProfile,
    remember,
  };
}

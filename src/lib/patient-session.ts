import { cookies } from "next/headers";
import {
  PATIENT_AUTH_COOKIE,
  encodePatientSession,
} from "@/lib/patient-auth";
import { patientHasRegisteredInfo } from "@/lib/patient-profile";
import { toPublicPatient } from "@/lib/patient-public";
import type { Patient } from "@/lib/types";

export async function establishPatientSession(patient: Patient) {
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

  const needsProfile = !patientHasRegisteredInfo(patient);
  return {
    patient: toPublicPatient(patient),
    needsProfile,
    alreadyRegistered: !needsProfile,
  };
}

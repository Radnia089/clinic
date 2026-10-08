import { cookies } from "next/headers";
import {
  PATIENT_AUTH_COOKIE,
  decodePatientSession,
  encodePatientSession,
  type PatientSession,
} from "@/lib/patient-auth-shared";
import { getPatient } from "@/lib/store";
import type { Patient } from "@/lib/types";

export {
  PATIENT_AUTH_COOKIE,
  decodePatientSession,
  encodePatientSession,
  type PatientSession,
} from "@/lib/patient-auth-shared";

export async function getPatientSession(): Promise<PatientSession | null> {
  const jar = await cookies();
  return decodePatientSession(jar.get(PATIENT_AUTH_COOKIE)?.value);
}

export async function getCurrentPatient(): Promise<Patient | null> {
  const session = await getPatientSession();
  if (!session) return null;
  return getPatient(session.patientId);
}

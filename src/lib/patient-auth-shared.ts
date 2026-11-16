import { readSignedPayload, signPayload } from "@/lib/session-sign";

export const PATIENT_AUTH_COOKIE = "tandis_patient_session";

export type PatientSession = {
  patientId: string;
  phone: string;
};

export function encodePatientSession(session: PatientSession): string {
  return signPayload(JSON.stringify(session));
}

export function decodePatientSession(token?: string | null): PatientSession | null {
  if (!token) return null;
  try {
    const raw = readSignedPayload(token);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PatientSession;
    if (!parsed?.patientId || !parsed?.phone) return null;
    return { patientId: parsed.patientId, phone: parsed.phone };
  } catch {
    return null;
  }
}

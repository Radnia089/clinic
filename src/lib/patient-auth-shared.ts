export const PATIENT_AUTH_COOKIE = "tandis_patient_session";

export type PatientSession = {
  patientId: string;
  phone: string;
};

function toBase64Url(value: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64url");
  }
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(token: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(token, "base64url").toString("utf8");
  }
  const padded = token.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
  return atob(padded + pad);
}

export function encodePatientSession(session: PatientSession): string {
  return toBase64Url(JSON.stringify(session));
}

export function decodePatientSession(token?: string | null): PatientSession | null {
  if (!token) return null;
  try {
    const parsed = JSON.parse(fromBase64Url(token)) as PatientSession;
    if (!parsed?.patientId || !parsed?.phone) return null;
    return parsed;
  } catch {
    return null;
  }
}

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

/** رمز کوتاه ۴ تا ۸ کاراکتر */
export const PATIENT_PASSWORD_MIN = 4;
export const PATIENT_PASSWORD_MAX = 8;

export function normalizePatientPassword(raw: string) {
  return String(raw ?? "").trim();
}

export function validatePatientPassword(raw: string) {
  const password = normalizePatientPassword(raw);
  if (
    password.length < PATIENT_PASSWORD_MIN ||
    password.length > PATIENT_PASSWORD_MAX
  ) {
    return {
      ok: false as const,
      error: "invalid_length" as const,
      password: "",
    };
  }
  // جلوگیری از فاصله و کاراکترهای کنترلی
  if (/\s/.test(password) || /[^\x20-\x7E\u0600-\u06FF]/.test(password)) {
    return {
      ok: false as const,
      error: "invalid_chars" as const,
      password: "",
    };
  }
  return { ok: true as const, password };
}

export function hashPatientPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPatientPassword(password: string, stored?: string | null) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const next = scryptSync(password, salt, 32);
    const prev = Buffer.from(hash, "hex");
    if (prev.length !== next.length) return false;
    return timingSafeEqual(next, prev);
  } catch {
    return false;
  }
}

export function patientHasPassword(patient: {
  passwordHash?: string | null;
} | null | undefined) {
  return Boolean(patient?.passwordHash && patient.passwordHash.includes(":"));
}

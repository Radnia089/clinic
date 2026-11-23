import { hashPassword, verifyPassword } from "@/lib/password-hash";

/** رمز جدید حداقل ۸ کاراکتر است. رمزهای کوتاه قبلی هنوز برای ورود قبول می‌شوند. */
export const PATIENT_PASSWORD_MIN = 8;
export const PATIENT_PASSWORD_MAX = 64;

export function normalizePatientPassword(raw: string) {
  return String(raw ?? "").trim();
}

/** برای ورود: طول رمز قبلی را رد نمی‌کند. */
export function readLoginPassword(raw: string) {
  const password = normalizePatientPassword(raw);
  if (!password || password.length > PATIENT_PASSWORD_MAX || /\s/.test(password)) {
    return "";
  }
  return password;
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
  return hashPassword(password);
}

export function verifyPatientPassword(password: string, stored?: string | null) {
  return verifyPassword(password, stored);
}

export function patientHasPassword(patient: {
  passwordHash?: string | null;
} | null | undefined) {
  return Boolean(patient?.passwordHash && patient.passwordHash.includes(":"));
}

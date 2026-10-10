const STORAGE_KEY = "tandis_patient_remember_v1";

export type RememberedPatientLogin = {
  phone: string;
  password: string;
};

export function readRememberedPatientLogin(): RememberedPatientLogin | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as RememberedPatientLogin;
    if (
      !parsed?.phone ||
      !parsed?.password ||
      !/^09\d{9}$/.test(parsed.phone) ||
      parsed.password.length < 4
    ) {
      return null;
    }
    return {
      phone: parsed.phone,
      password: parsed.password,
    };
  } catch {
    return null;
  }
}

export function writeRememberedPatientLogin(phone: string, password: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ phone, password })
  );
}

export function clearRememberedPatientLogin() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

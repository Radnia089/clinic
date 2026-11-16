const STORAGE_KEY = "tandis_patient_remember_v1";

export type RememberedPatientLogin = {
  phone: string;
};

export function readRememberedPatientLogin(): RememberedPatientLogin | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { phone?: string; password?: string };
    if (!parsed?.phone || !/^09\d{9}$/.test(parsed.phone)) {
      window.localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if ("password" in parsed) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ phone: parsed.phone }));
    }
    return { phone: parsed.phone };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function writeRememberedPatientLogin(phone: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ phone }));
}

export function clearRememberedPatientLogin() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

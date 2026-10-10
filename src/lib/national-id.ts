import { normalizeIntegerInput } from "@/lib/digits";

/** نرمال‌سازی کد ملی به ۱۰ رقم */
export function normalizeNationalId(raw: string) {
  const digits = normalizeIntegerInput(String(raw ?? ""));
  // اگر کمتر از ۱۰ رقم بود با صفر از چپ پر نکن مگر کاربر صریح بفرستد؛
  // فقط ارقام را نگه می‌داریم.
  return digits.slice(0, 10);
}

/** اعتبارسنجی کد ملی ایران */
export function isValidNationalId(raw: string) {
  const code = normalizeNationalId(raw);
  if (!/^\d{10}$/.test(code)) return false;
  if (/^(\d)\1{9}$/.test(code)) return false;
  const check = Number(code[9]);
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(code[i]) * (10 - i);
  }
  const rem = sum % 11;
  return rem < 2 ? check === rem : check === 11 - rem;
}

export function nationalIdsMatch(
  stored: string | undefined | null,
  input: string
) {
  if (!stored) return false;
  const a = normalizeNationalId(stored);
  const b = normalizeNationalId(input);
  return a.length === 10 && a === b;
}

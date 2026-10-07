/** تبدیل ارقام فارسی و عربی به انگلیسی */
export function toEnglishDigits(value: string): string {
  return value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));
}

/** فقط رقم انگلیسی نگه می‌دارد (برای موبایل و سن) */
export function normalizeIntegerInput(value: string): string {
  return toEnglishDigits(value).replace(/[^\d]/g, "");
}

/** رقم انگلیسی + یک نقطه اعشار (برای وزن و سایز و مبلغ) */
export function normalizeDecimalInput(value: string): string {
  const english = toEnglishDigits(value).replace(/[^\d.]/g, "");
  const parts = english.split(".");
  if (parts.length <= 1) return english;
  return `${parts[0]}.${parts.slice(1).join("")}`;
}

export function parseNormalizedNumber(value: string): number {
  const n = Number(toEnglishDigits(value).trim());
  return n;
}

/** موبایل ایران: ۱۱ رقم، شروع با ۰۹ */
export function isValidIranMobile(value: string): boolean {
  return /^09\d{9}$/.test(normalizeIntegerInput(value));
}

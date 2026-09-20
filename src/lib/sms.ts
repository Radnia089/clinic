import type { ReminderSettings } from "@/lib/types";

/** نرمال‌سازی موبایل ایران به فرم 09xxxxxxxxx */
export function normalizeIranPhone(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("98") && digits.length === 12) {
    digits = `0${digits.slice(2)}`;
  }
  if (digits.startsWith("9") && digits.length === 10) {
    digits = `0${digits}`;
  }
  if (/^09\d{9}$/.test(digits)) return digits;
  return null;
}

export function renderReminderTemplate(
  template: string,
  vars: Record<string, string>
) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? "");
}

export function mergeReminderSettings(
  partial?: Partial<ReminderSettings> | null
): ReminderSettings {
  const base = {
    enabled: true,
    morningEnabled: true,
    morningHour: 8,
    hoursBeforeEnabled: true,
    hoursBefore: 3,
    template:
      "{name} عزیز، نوبت شما در {clinic} روز {date} ساعت {time} ({type}) است. منتظر دیدارتان هستیم.",
  };
  if (!partial) return base;
  return {
    ...base,
    ...partial,
    morningHour: clampInt(partial.morningHour ?? base.morningHour, 0, 23),
    hoursBefore: clampInt(partial.hoursBefore ?? base.hoursBefore, 1, 48),
  };
}

function clampInt(n: number, min: number, max: number) {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}

/** اجزای تاریخ/ساعت به‌وقت Asia/Tehran */
export function tehranParts(date = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(date).map((p) => [p.type, p.value])
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  let hour = Number(parts.hour);
  if (hour === 24) hour = 0;
  const minute = Number(parts.minute);
  const isoDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { year, month, day, hour, minute, isoDate };
}

/** ساخت Date تقریبی برای یک روز+ساعت در تهران (برای مقایسه) */
export function tehranDateTimeMs(isoDate: string, hhmm: string): number {
  // Asia/Tehran بدون DST از ۱۴۰۱؛ از offset ثابت +03:30 استفاده می‌کنیم
  const [h, m] = hhmm.split(":").map(Number);
  return Date.parse(`${isoDate}T${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00+03:30`);
}

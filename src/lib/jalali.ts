import {
  jalaaliMonthLength,
  toGregorian,
  toJalaali,
} from "jalaali-js";

const JALALI_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

/** ترتیب مطابق Date#getDay: ۰=یکشنبه … ۶=شنبه */
const WEEKDAYS_FA = [
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
  "شنبه",
];

export type JalaliParts = { jy: number; jm: number; jd: number };

export function toJalaliParts(date: Date | string): JalaliParts {
  const d = typeof date === "string" ? new Date(date) : date;
  const safe = Number.isNaN(d.getTime()) ? new Date() : d;
  return toJalaali(safe.getFullYear(), safe.getMonth() + 1, safe.getDate());
}

export function jalaliPartsToDate({ jy, jm, jd }: JalaliParts): Date {
  const g = toGregorian(jy, jm, jd);
  return new Date(g.gy, g.gm - 1, g.gd, 12, 0, 0);
}

export function jalaliPartsToIsoDate(parts: JalaliParts): string {
  const d = jalaliPartsToDate(parts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function isoDateToJalaliParts(isoDate: string): JalaliParts {
  const base = isoDate.includes("T") ? isoDate : `${isoDate}T12:00:00`;
  return toJalaliParts(base);
}

export function todayJalaliParts(): JalaliParts {
  return toJalaliParts(new Date());
}

/** جابه‌جایی روز شمسی به‌اندازه delta روز */
export function shiftIsoDateByDays(isoDate: string, delta: number): string {
  const d = jalaliPartsToDate(isoDateToJalaliParts(isoDate));
  d.setDate(d.getDate() + delta);
  return jalaliPartsToIsoDate(toJalaliParts(d));
}

export function isSameIsoDay(a: string, b: string): boolean {
  const left = a.includes("T") ? a.slice(0, 10) : a;
  const right = b.includes("T") ? b.slice(0, 10) : b;
  return left === right;
}

export function daysInJalaliMonth(jy: number, jm: number) {
  return jalaaliMonthLength(jy, jm);
}

export function weekdayFa(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input.includes("T") ? input : `${input}T12:00:00`) : input;
  if (Number.isNaN(date.getTime())) return "";
  return WEEKDAYS_FA[date.getDay()] ?? "";
}

export function formatJalaliDate(
  input?: string | Date | null,
  options?: { withMonthName?: boolean; withTime?: boolean; withWeekday?: boolean }
) {
  if (!input) return "—";
  const date =
    typeof input === "string"
      ? new Date(input.includes("T") ? input : `${input}T12:00:00`)
      : input;
  if (Number.isNaN(date.getTime())) return "—";

  const { jy, jm, jd } = toJalaliParts(date);
  const day = new Intl.NumberFormat("fa-IR").format(jd);
  const year = new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(jy);

  let datePart = options?.withMonthName
    ? `${day} ${JALALI_MONTHS[jm - 1]} ${year}`
    : `${year}/${new Intl.NumberFormat("fa-IR").format(jm)}/${day}`;

  if (options?.withWeekday) {
    const weekday = weekdayFa(date);
    if (weekday) datePart = `${datePart} — ${weekday}`;
  }

  if (!options?.withTime) return datePart;

  const time = new Intl.DateTimeFormat("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return `${datePart} · ${time}`;
}

export function formatJalaliShort(input: string | Date) {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "—";
  const { jm, jd } = toJalaliParts(date);
  return `${new Intl.NumberFormat("fa-IR").format(jd)} ${JALALI_MONTHS[jm - 1]}`;
}

export function jalaliYearOptions(centerYear?: number) {
  const current = centerYear ?? todayJalaliParts().jy;
  return Array.from({ length: 12 }, (_, i) => current - 8 + i);
}

/** بازه سال برای تاریخ تولد (حدود ۱۳۰ سال گذشته تا امسال) */
export function jalaliBirthYearOptions() {
  const current = todayJalaliParts().jy;
  const start = current - 100;
  return Array.from({ length: current - start + 1 }, (_, i) => current - i);
}

/** سن تقریبی از تاریخ تولد میلادی YYYY-MM-DD */
export function ageFromIsoBirthDate(isoDate: string): number | undefined {
  if (!isoDate) return undefined;
  const birth = new Date(
    isoDate.includes("T") ? isoDate : `${isoDate}T12:00:00`
  );
  if (Number.isNaN(birth.getTime())) return undefined;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age -= 1;
  if (age < 0 || age > 120) return undefined;
  return age;
}

export { JALALI_MONTHS };

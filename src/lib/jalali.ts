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

export function daysInJalaliMonth(jy: number, jm: number) {
  return jalaaliMonthLength(jy, jm);
}

export function formatJalaliDate(
  input?: string | Date | null,
  options?: { withMonthName?: boolean; withTime?: boolean }
) {
  if (!input) return "—";
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "—";

  const { jy, jm, jd } = toJalaliParts(date);
  const day = new Intl.NumberFormat("fa-IR").format(jd);
  const year = new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(jy);

  const datePart = options?.withMonthName
    ? `${day} ${JALALI_MONTHS[jm - 1]} ${year}`
    : `${year}/${new Intl.NumberFormat("fa-IR").format(jm)}/${day}`;

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

export { JALALI_MONTHS };

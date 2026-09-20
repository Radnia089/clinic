"use client";

import { useMemo } from "react";
import {
  daysInJalaliMonth,
  isoDateToJalaliParts,
  jalaliPartsToIsoDate,
  jalaliYearOptions,
  JALALI_MONTHS,
  todayJalaliParts,
  type JalaliParts,
} from "@/lib/jalali";

const selectClass =
  "h-12 w-full rounded-2xl border border-[#D7E2D9] bg-[#F7F8F6] px-3 text-sm outline-none focus:border-brand focus:ring-3 focus:ring-brand/20";

export function ShamsiDateInput({
  value,
  onChange,
  id,
  required,
}: {
  /** Gregorian ISO date YYYY-MM-DD for storage */
  value: string;
  onChange: (isoDate: string) => void;
  id?: string;
  required?: boolean;
}) {
  const parts: JalaliParts = useMemo(() => {
    if (!value) return todayJalaliParts();
    try {
      return isoDateToJalaliParts(value);
    } catch {
      return todayJalaliParts();
    }
  }, [value]);

  const years = jalaliYearOptions(parts.jy);
  const maxDay = daysInJalaliMonth(parts.jy, parts.jm);

  function update(next: Partial<JalaliParts>) {
    const merged = { ...parts, ...next };
    const dim = daysInJalaliMonth(merged.jy, merged.jm);
    if (merged.jd > dim) merged.jd = dim;
    onChange(jalaliPartsToIsoDate(merged));
  }

  return (
    <div id={id} className="grid grid-cols-3 gap-2" dir="rtl">
      <label className="space-y-1">
        <span className="sr-only">روز</span>
        <select
          className={selectClass}
          value={parts.jd}
          required={required}
          onChange={(e) => update({ jd: Number(e.target.value) })}
          aria-label="روز شمسی"
        >
          {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
            <option key={d} value={d}>
              {new Intl.NumberFormat("fa-IR").format(d)}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1">
        <span className="sr-only">ماه</span>
        <select
          className={selectClass}
          value={parts.jm}
          required={required}
          onChange={(e) => update({ jm: Number(e.target.value) })}
          aria-label="ماه شمسی"
        >
          {JALALI_MONTHS.map((name, index) => (
            <option key={name} value={index + 1}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-1">
        <span className="sr-only">سال</span>
        <select
          className={selectClass}
          value={parts.jy}
          required={required}
          onChange={(e) => update({ jy: Number(e.target.value) })}
          aria-label="سال شمسی"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {new Intl.NumberFormat("fa-IR", { useGrouping: false }).format(y)}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, UserPlus, Users } from "lucide-react";
import {
  formatJalaliDate,
  jalaliPartsToIsoDate,
  shiftIsoDateByDays,
  todayJalaliParts,
  isSameIsoDay,
} from "@/lib/jalali";
import {
  patientFullName,
  visitStatusLabel,
  visitTypeLabel,
  type Patient,
  type Visit,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type VisitRow = Visit & { patient: Patient | null };

export function ReceptionDayBoard({ visits }: { visits: VisitRow[] }) {
  const [day, setDay] = useState(() => jalaliPartsToIsoDate(todayJalaliParts()));
  const todayIso = jalaliPartsToIsoDate(todayJalaliParts());

  const dayVisits = useMemo(
    () => visits.filter((v) => isSameIsoDay(v.visitDate, day)),
    [visits, day]
  );

  const visitsOnly = dayVisits.filter((v) => v.visitType === "consultation");
  const packagesOnly = dayVisits.filter((v) => v.visitType === "package");

  const dayLabel = formatJalaliDate(day, { withMonthName: true });
  const isToday = day === todayIso;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">میز پذیرش</p>
          <h1 className="mt-1 text-2xl font-extrabold text-brand">مراجعه‌کنندگان روز</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/clinic/reception/customers"
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-semibold text-brand shadow-[0_6px_18px_rgba(35,70,55,0.06)]"
          >
            <Users className="size-4" />
            لیست مشتریان
          </Link>
          <Link
            href="/clinic/reception/new"
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#D86B5C] px-4 text-sm font-semibold text-white"
          >
            <UserPlus className="size-4" />
            ثبت جدید
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-[28px] bg-white p-3 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
        <button
          type="button"
          onClick={() => setDay((d) => shiftIsoDateByDays(d, -1))}
          className="flex size-11 items-center justify-center rounded-2xl bg-[#F7F8F6] text-brand"
          aria-label="روز قبل"
        >
          <ChevronRight className="size-5" />
        </button>
        <div className="text-center">
          <p className="text-base font-extrabold text-brand">{dayLabel}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isToday ? "امروز" : "تاریخ انتخاب‌شده"} ·{" "}
            {new Intl.NumberFormat("fa-IR").format(dayVisits.length)} مراجعه
          </p>
          {!isToday ? (
            <button
              type="button"
              className="mt-1 text-xs font-medium text-brand"
              onClick={() => setDay(todayIso)}
            >
              برو به امروز
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setDay((d) => shiftIsoDateByDays(d, 1))}
          className="flex size-11 items-center justify-center rounded-2xl bg-[#F7F8F6] text-brand"
          aria-label="روز بعد"
        >
          <ChevronLeft className="size-5" />
        </button>
      </div>

      {dayVisits.length === 0 ? (
        <div className="rounded-[28px] bg-white px-6 py-14 text-center shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
          <p className="font-semibold text-brand">برای این روز مراجعه‌ای ثبت نشده</p>
          <p className="mt-2 text-sm text-muted-foreground">
            می‌توانید روز را عوض کنید یا مراجعه‌کننده جدید ثبت کنید.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <DayGroup
            title="ویزیت"
            tone="bg-[#E8F2EA] text-[#2F6B4F]"
            items={visitsOnly}
          />
          <DayGroup
            title="پکیج لاغری"
            tone="bg-[#F6E6E1] text-[#9A4E42]"
            items={packagesOnly}
          />
        </div>
      )}
    </div>
  );
}

function DayGroup({
  title,
  tone,
  items,
}: {
  title: string;
  tone: string;
  items: VisitRow[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-[28px] bg-white p-4 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className={cn("rounded-full px-3 py-1 text-xs font-bold", tone)}>
          {title}
        </span>
        <span className="text-xs text-muted-foreground">
          {new Intl.NumberFormat("fa-IR").format(items.length)} نفر
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((visit) => (
          <li
            key={visit.id}
            className="flex items-center justify-between gap-3 rounded-2xl bg-[#F7F8F6] px-3 py-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground">
                {visit.patient ? patientFullName(visit.patient) : "بدون نام"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {visitTypeLabel(visit.visitType)}
                {visit.packageName ? ` · ${visit.packageName}` : ""} ·{" "}
                {visitStatusLabel(visit.status)}
              </p>
              {visit.patient?.phone ? (
                <p className="mt-0.5 text-xs text-muted-foreground" dir="ltr">
                  {visit.patient.phone}
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              {visit.patient ? (
                <Link
                  href={`/clinic/reception/customers/${visit.patient.id}`}
                  className="text-xs font-semibold text-brand"
                >
                  پرونده
                </Link>
              ) : null}
              {visit.status === "visitor" ? (
                <Link
                  href={`/clinic/reception/admission/${visit.id}`}
                  className="text-xs text-muted-foreground"
                >
                  پذیرش
                </Link>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

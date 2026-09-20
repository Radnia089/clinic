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
import { formatTimeFa, slotsForType } from "@/lib/schedule";
import {
  patientFullName,
  visitStatusLabel,
  type ClinicProfile,
  type Patient,
  type Visit,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type VisitRow = Visit & { patient: Patient | null };

export function ReceptionDayBoard({
  visits,
  clinic,
}: {
  visits: VisitRow[];
  clinic: ClinicProfile;
}) {
  const [day, setDay] = useState(() => jalaliPartsToIsoDate(todayJalaliParts()));
  const todayIso = jalaliPartsToIsoDate(todayJalaliParts());

  const dayVisits = useMemo(
    () => visits.filter((v) => isSameIsoDay(v.visitDate, day)),
    [visits, day]
  );

  const visitSlots = slotsForType(clinic, "consultation");
  const packageSlots = slotsForType(clinic, "package");

  const visitByTime = useMemo(() => {
    const map = new Map<string, VisitRow>();
    for (const visit of dayVisits) {
      if (visit.visitType === "consultation" && visit.visitTime) {
        map.set(visit.visitTime, visit);
      }
    }
    return map;
  }, [dayVisits]);

  const packageByTime = useMemo(() => {
    const map = new Map<string, VisitRow>();
    for (const visit of dayVisits) {
      if (visit.visitType === "package" && visit.visitTime) {
        map.set(visit.visitTime, visit);
      }
    }
    return map;
  }, [dayVisits]);

  const untimed = dayVisits.filter((v) => !v.visitTime);

  const dayLabel = formatJalaliDate(day, { withMonthName: true });
  const isToday = day === todayIso;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">تقویم روزانه پذیرش</p>
          <h1 className="mt-1 text-2xl font-extrabold text-brand">نوبت‌های ساعتی</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            ویزیت هر {new Intl.NumberFormat("fa-IR").format(clinic.visitSlotMinutes)} دقیقه ·
            پکیج/دستگاه هر {new Intl.NumberFormat("fa-IR").format(clinic.packageSlotMinutes)} دقیقه ·
            از {formatTimeFa(clinic.workStart)} تا {formatTimeFa(clinic.workEnd)}
          </p>
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
            href={`/clinic/reception/new?date=${day}`}
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
            {new Intl.NumberFormat("fa-IR").format(dayVisits.length)} نوبت
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

      <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
        <div className="grid grid-cols-[4.5rem_1fr_1fr] border-b border-black/5 bg-[#F7F8F6] text-center text-xs font-bold text-brand">
          <div className="px-2 py-3">ساعت</div>
          <div className="border-r border-black/5 px-2 py-3">
            ویزیت
            <span className="mt-0.5 block font-medium text-muted-foreground">
              هر {new Intl.NumberFormat("fa-IR").format(clinic.visitSlotMinutes)} دقیقه
            </span>
          </div>
          <div className="px-2 py-3">
            پکیج / دستگاه
            <span className="mt-0.5 block font-medium text-muted-foreground">
              هر {new Intl.NumberFormat("fa-IR").format(clinic.packageSlotMinutes)} دقیقه
            </span>
          </div>
        </div>

        <div className="divide-y divide-black/5">
          {visitSlots.map((time) => {
            const visit = visitByTime.get(time);
            // package column: show package slot only on package slot times
            const isPackageSlot = packageSlots.includes(time);
            const pkg = isPackageSlot ? packageByTime.get(time) : undefined;

            return (
              <div
                key={time}
                className="grid min-h-[64px] grid-cols-[4.5rem_1fr_1fr]"
              >
                <div className="flex items-start justify-center bg-[#FAFBFA] px-1 pt-3 text-xs font-semibold text-muted-foreground">
                  {formatTimeFa(time)}
                </div>

                <div className="border-r border-black/5 p-1.5">
                  {visit ? (
                    <BookedBlock visit={visit} tone="visit" />
                  ) : (
                    <EmptySlot
                      href={`/clinic/reception/new?date=${day}&time=${time}&type=consultation`}
                      label="نوبت ویزیت خالی"
                    />
                  )}
                </div>

                <div className="p-1.5">
                  {isPackageSlot ? (
                    pkg ? (
                      <BookedBlock visit={pkg} tone="package" />
                    ) : (
                      <EmptySlot
                        href={`/clinic/reception/new?date=${day}&time=${time}&type=package`}
                        label="نوبت دستگاه/پکیج خالی"
                      />
                    )
                  ) : (
                    <div className="h-full rounded-xl bg-[#F3F5F3]/70" aria-hidden />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {untimed.length > 0 ? (
        <section className="rounded-[28px] bg-[#FFF8F5] p-4">
          <h2 className="text-sm font-bold text-[#9A4E42]">بدون ساعت مشخص</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            این مراجعه‌ها هنوز در تقویم ساعتی جاگذاری نشده‌اند.
          </p>
          <ul className="mt-3 space-y-2">
            {untimed.map((visit) => (
              <li
                key={visit.id}
                className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm"
              >
                <span>
                  {visit.patient ? patientFullName(visit.patient) : "بدون نام"} ·{" "}
                  {visit.visitType === "package" ? "پکیج" : "ویزیت"}
                </span>
                {visit.patient ? (
                  <Link
                    href={`/clinic/reception/customers/${visit.patient.id}`}
                    className="text-xs font-semibold text-brand"
                  >
                    پرونده
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function BookedBlock({
  visit,
  tone,
}: {
  visit: VisitRow;
  tone: "visit" | "package";
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[52px] flex-col justify-between rounded-xl px-2.5 py-2",
        tone === "visit" ? "bg-[#E8F2EA] text-[#2F6B4F]" : "bg-[#F6E6E1] text-[#9A4E42]"
      )}
    >
      <div>
        <p className="text-xs font-extrabold">
          {visit.patient ? patientFullName(visit.patient) : "بدون نام"}
        </p>
        <p className="mt-0.5 text-[10px] opacity-80">
          {visit.visitTime ? formatTimeFa(visit.visitTime) : ""} · {visitStatusLabel(visit.status)}
        </p>
      </div>
      <div className="mt-1 flex gap-2">
        {visit.patient ? (
          <Link
            href={`/clinic/reception/customers/${visit.patient.id}`}
            className="text-[10px] font-bold underline-offset-2 hover:underline"
          >
            پرونده
          </Link>
        ) : null}
        {visit.status === "visitor" ? (
          <Link
            href={`/clinic/reception/admission/${visit.id}`}
            className="text-[10px] font-bold underline-offset-2 hover:underline"
          >
            پذیرش
          </Link>
        ) : null}
      </div>
    </div>
  );
}

function EmptySlot({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex h-full min-h-[52px] items-center justify-center rounded-xl border border-dashed border-[#D7E2D9] bg-[#FCFDFC] text-[11px] text-muted-foreground transition hover:border-brand/40 hover:bg-[#E8F2EA]/40 hover:text-brand"
    >
      {label}
    </Link>
  );
}

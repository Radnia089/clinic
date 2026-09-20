"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, UserPlus, Users } from "lucide-react";
import {
  formatJalaliDate,
  jalaliPartsToIsoDate,
  shiftIsoDateByDays,
  todayJalaliParts,
  isSameIsoDay,
} from "@/lib/jalali";
import {
  buildGridSlots,
  durationForVisit,
  endTimeFromStart,
  formatTimeFa,
  rangesOverlap,
  slotDurationForType,
  timeToMinutes,
  toFaNumber,
  visitNumberForPatient,
} from "@/lib/schedule";
import {
  patientFullName,
  visitStatusLabel,
  type ClinicProfile,
  type Patient,
  type Visit,
  type VisitType,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type VisitRow = Visit & { patient: Patient | null };
type Lane = "consultation" | "package";

const ROW_PX = 28;

export function ReceptionDayBoard({
  visits,
  clinic,
}: {
  visits: VisitRow[];
  clinic: ClinicProfile;
}) {
  const router = useRouter();
  const [day, setDay] = useState(() => jalaliPartsToIsoDate(todayJalaliParts()));
  const todayIso = jalaliPartsToIsoDate(todayJalaliParts());
  const gridMinutes = clinic.gridSlotMinutes || 15;

  const dayVisits = useMemo(
    () => visits.filter((v) => isSameIsoDay(v.visitDate, day)),
    [visits, day]
  );

  const gridSlots = useMemo(
    () => buildGridSlots(clinic.workStart, clinic.workEnd, gridMinutes),
    [clinic.workStart, clinic.workEnd, gridMinutes]
  );

  const untimed = dayVisits.filter((v) => !v.visitTime);
  const dayLabel = formatJalaliDate(day, { withMonthName: true, withWeekday: true });
  const isToday = day === todayIso;

  const [drag, setDrag] = useState<null | {
    lane: Lane;
    start: string;
    end: string;
  }>(null);
  const dragging = useRef(false);

  function laneVisits(lane: Lane) {
    return dayVisits.filter(
      (v) => v.visitType === lane && v.visitTime
    );
  }

  function coversSlot(visit: VisitRow, slot: string) {
    if (!visit.visitTime) return false;
    const duration = durationForVisit(visit, clinic);
    const start = timeToMinutes(visit.visitTime);
    const end = start + duration;
    const t = timeToMinutes(slot);
    return t >= start && t < end;
  }

  function isStartSlot(visit: VisitRow, slot: string) {
    return visit.visitTime === slot;
  }

  function beginDrag(lane: Lane, slot: string) {
    dragging.current = true;
    setDrag({ lane, start: slot, end: slot });
  }

  function moveDrag(lane: Lane, slot: string) {
    if (!dragging.current || !drag || drag.lane !== lane) return;
    setDrag({ ...drag, end: slot });
  }

  function finishDrag() {
    if (!drag) {
      dragging.current = false;
      return;
    }
    const startMin = Math.min(timeToMinutes(drag.start), timeToMinutes(drag.end));
    const endMin = Math.max(timeToMinutes(drag.start), timeToMinutes(drag.end)) + gridMinutes;
    let duration = endMin - startMin;
    const defaultDuration = slotDurationForType(clinic, drag.lane);
    // اگر فقط یک ربع کلیک شد، مدت پیش‌فرض نوع نوبت را بگذار
    if (duration <= gridMinutes) duration = defaultDuration;

    const start = minutesPad(startMin);
    const occupied = laneVisits(drag.lane).some((v) =>
      rangesOverlap(start, duration, v.visitTime!, durationForVisit(v, clinic))
    );

    dragging.current = false;
    setDrag(null);

    if (occupied) return;

    router.push(
      `/clinic/reception/new?date=${day}&time=${start}&type=${drag.lane}&duration=${duration}`
    );
  }

  function minutesPad(total: number) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }

  function selectionCovers(lane: Lane, slot: string) {
    if (!drag || drag.lane !== lane) return false;
    const a = Math.min(timeToMinutes(drag.start), timeToMinutes(drag.end));
    const b = Math.max(timeToMinutes(drag.start), timeToMinutes(drag.end));
    const t = timeToMinutes(slot);
    return t >= a && t <= b;
  }

  return (
    <div className="space-y-5" onMouseUp={finishDrag} onMouseLeave={() => { if (dragging.current) finishDrag(); }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">تقویم روزانه پذیرش</p>
          <h1 className="mt-1 text-2xl font-extrabold text-brand">تقویم شناور نوبت‌ها</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            بازه شناور {formatTimeFa(clinic.workStart)} تا {formatTimeFa(clinic.workEnd)} · واحد{" "}
            {toFaNumber(gridMinutes)} دقیقه · ویزیت معمولاً {toFaNumber(clinic.visitSlotMinutes)} دقیقه ·
            دستگاه/پکیج معمولاً {toFaNumber(clinic.packageSlotMinutes)} دقیقه
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            برای انتخاب زمان، روی خانه خالی کلیک کنید یا بکشید (مثل تقویم).
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
            {isToday ? "امروز" : "تاریخ انتخاب‌شده"} · {toFaNumber(dayVisits.length)} نوبت
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

      <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_6px_18px_rgba(35,70,55,0.06)] select-none">
        <div className="grid grid-cols-[3.75rem_1fr_1fr] border-b border-black/5 bg-[#F7F8F6] text-center text-xs font-bold text-brand">
          <div className="px-1 py-3">ساعت</div>
          <div className="border-r border-black/5 px-2 py-3">
            ویزیت
            <span className="mt-0.5 block font-medium text-muted-foreground">
              پیش‌فرض {toFaNumber(clinic.visitSlotMinutes)} دقیقه
            </span>
          </div>
          <div className="px-2 py-3">
            پکیج / دستگاه
            <span className="mt-0.5 block font-medium text-muted-foreground">
              پیش‌فرض {toFaNumber(clinic.packageSlotMinutes)} دقیقه
            </span>
          </div>
        </div>

        <div>
          {gridSlots.map((slot) => (
            <div
              key={slot}
              className="grid grid-cols-[3.75rem_1fr_1fr] border-b border-black/5"
              style={{ height: ROW_PX }}
            >
              <div className="flex items-start justify-center bg-[#FAFBFA] pt-1 text-[10px] font-semibold text-muted-foreground">
                {slot.endsWith(":00") || slot.endsWith(":30") ? formatTimeFa(slot) : ""}
              </div>
              <LaneCell
                lane="consultation"
                slot={slot}
                visits={laneVisits("consultation")}
                clinic={clinic}
                allVisits={visits}
                gridMinutes={gridMinutes}
                coversSlot={coversSlot}
                isStartSlot={isStartSlot}
                selected={selectionCovers("consultation", slot)}
                onStart={() => beginDrag("consultation", slot)}
                onEnter={() => moveDrag("consultation", slot)}
              />
              <LaneCell
                lane="package"
                slot={slot}
                visits={laneVisits("package")}
                clinic={clinic}
                allVisits={visits}
                gridMinutes={gridMinutes}
                coversSlot={coversSlot}
                isStartSlot={isStartSlot}
                selected={selectionCovers("package", slot)}
                onStart={() => beginDrag("package", slot)}
                onEnter={() => moveDrag("package", slot)}
              />
            </div>
          ))}
        </div>
      </div>

      {untimed.length > 0 ? (
        <section className="rounded-[28px] bg-[#FFF8F5] p-4">
          <h2 className="text-sm font-bold text-[#9A4E42]">بدون ساعت مشخص</h2>
          <ul className="mt-3 space-y-2">
            {untimed.map((visit) => {
              const n = visitNumberForPatient(visits, visit.patientId, visit.id);
              return (
                <li
                  key={visit.id}
                  className="flex items-center justify-between rounded-2xl bg-white px-3 py-2 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <VisitBadge n={n} />
                    {visit.patient ? patientFullName(visit.patient) : "بدون نام"} ·{" "}
                    {visit.visitType === "package" ? "پکیج" : "ویزیت"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function LaneCell({
  lane,
  slot,
  visits,
  clinic,
  allVisits,
  gridMinutes,
  coversSlot,
  isStartSlot,
  selected,
  onStart,
  onEnter,
}: {
  lane: Lane;
  slot: string;
  visits: VisitRow[];
  clinic: ClinicProfile;
  allVisits: VisitRow[];
  gridMinutes: number;
  coversSlot: (visit: VisitRow, slot: string) => boolean;
  isStartSlot: (visit: VisitRow, slot: string) => boolean;
  selected: boolean;
  onStart: () => void;
  onEnter: () => void;
}) {
  const starter = visits.find((v) => isStartSlot(v, slot));
  const coveredByOther = !starter && visits.some((v) => coversSlot(v, slot));

  if (coveredByOther) {
    return <div className="relative border-r border-black/5 last:border-r-0" />;
  }

  if (starter) {
    const duration = durationForVisit(starter, clinic);
    const rows = Math.max(1, Math.round(duration / gridMinutes));
    const end = endTimeFromStart(starter.visitTime!, duration);
    const n = visitNumberForPatient(allVisits, starter.patientId, starter.id);

    return (
      <div className="relative border-r border-black/5 last:border-r-0">
        <div
          className={cn(
            "absolute inset-x-1 top-0 z-10 overflow-hidden rounded-xl px-2 py-1 shadow-sm",
            lane === "consultation"
              ? "bg-[#E8F2EA] text-[#2F6B4F]"
              : "bg-[#F6E6E1] text-[#9A4E42]"
          )}
          style={{ height: rows * ROW_PX - 4 }}
        >
          <div className="flex items-start justify-between gap-1">
            <p className="truncate text-[11px] font-extrabold leading-tight">
              {starter.patient ? patientFullName(starter.patient) : "بدون نام"}
            </p>
            <VisitBadge n={n} />
          </div>
          <p className="mt-0.5 text-[9px] opacity-80">
            {formatTimeFa(starter.visitTime!)}–{formatTimeFa(end)} · {visitStatusLabel(starter.status)}
          </p>
          <div className="mt-1 flex gap-2">
            {starter.patient ? (
              <Link
                href={`/clinic/reception/customers/${starter.patient.id}`}
                className="text-[9px] font-bold underline-offset-2 hover:underline"
                onMouseDown={(e) => e.stopPropagation()}
              >
                پرونده
              </Link>
            ) : null}
            {starter.status === "visitor" ? (
              <Link
                href={`/clinic/reception/admission/${starter.id}`}
                className="text-[9px] font-bold underline-offset-2 hover:underline"
                onMouseDown={(e) => e.stopPropagation()}
              >
                پذیرش
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border-r border-black/5 last:border-r-0",
        selected ? "bg-brand/15" : "hover:bg-[#E8F2EA]/40"
      )}
      onMouseDown={(e) => {
        e.preventDefault();
        onStart();
      }}
      onMouseEnter={onEnter}
    />
  );
}

function VisitBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-bold text-brand ring-1 ring-brand/15">
      مراجعه {toFaNumber(n)}
    </span>
  );
}

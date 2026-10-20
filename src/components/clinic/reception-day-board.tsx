"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Phone, UserPlus, Users } from "lucide-react";
import {
  AttendanceButtons,
  AttendanceMark,
} from "@/components/clinic/attendance-buttons";
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
  minutesToTime,
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
  type VisitStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type VisitRow = Visit & { patient: Patient | null };
type Lane = "consultation" | "package";

const ROW_PX = 30;
const MIN_DURATION = 15;

type Interaction =
  | {
      kind: "create";
      lane: Lane;
      anchorMin: number;
      currentMin: number;
    }
  | {
      kind: "move";
      visitId: string;
      lane: Lane;
      duration: number;
      grabOffsetMin: number;
      previewStartMin: number;
    }
  | {
      kind: "resize";
      visitId: string;
      lane: Lane;
      startMin: number;
      previewDuration: number;
    };

export function ReceptionDayBoard({
  visits: initialVisits,
  clinic,
}: {
  visits: VisitRow[];
  clinic: ClinicProfile;
}) {
  const router = useRouter();
  const [day, setDay] = useState(() => jalaliPartsToIsoDate(todayJalaliParts()));
  const todayIso = jalaliPartsToIsoDate(todayJalaliParts());
  const gridMinutes = clinic.gridSlotMinutes || 15;
  const [visits, setVisits] = useState(initialVisits);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [hint, setHint] = useState("");

  useEffect(() => {
    setVisits(initialVisits);
  }, [initialVisits]);

  const dayVisits = useMemo(
    () => visits.filter((v) => isSameIsoDay(v.visitDate, day)),
    [visits, day]
  );

  const gridSlots = useMemo(
    () => buildGridSlots(clinic.workStart, clinic.workEnd, gridMinutes),
    [clinic.workStart, clinic.workEnd, gridMinutes]
  );

  const workStartMin = timeToMinutes(clinic.workStart);
  const workEndMin = timeToMinutes(clinic.workEnd);
  const untimed = dayVisits.filter((v) => !v.visitTime);
  const dayLabel = formatJalaliDate(day, { withMonthName: true, withWeekday: true });
  const isToday = day === todayIso;

  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const laneRefs = useRef<Record<Lane, HTMLDivElement | null>>({
    consultation: null,
    package: null,
  });

  useEffect(() => {
    interactionRef.current = interaction;
  }, [interaction]);

  function laneVisits(lane: Lane) {
    return dayVisits.filter((v) => v.visitType === lane && v.visitTime);
  }

  function snapMinutes(raw: number) {
    const snapped =
      Math.round((raw - workStartMin) / gridMinutes) * gridMinutes + workStartMin;
    return Math.max(workStartMin, Math.min(workEndMin - gridMinutes, snapped));
  }

  function minutesFromPointer(lane: Lane, clientY: number) {
    const el = laneRefs.current[lane];
    if (!el) return workStartMin;
    const rect = el.getBoundingClientRect();
    const y = clientY - rect.top;
    const raw = workStartMin + (y / ROW_PX) * gridMinutes;
    return snapMinutes(raw);
  }

  function conflictsWithOthers(
    lane: Lane,
    visitId: string,
    start: string,
    duration: number
  ) {
    return laneVisits(lane).some((v) => {
      if (v.id === visitId) return false;
      return rangesOverlap(
        start,
        duration,
        v.visitTime!,
        durationForVisit(v, clinic)
      );
    });
  }

  async function persistVisit(
    visitId: string,
    patch: Partial<Pick<Visit, "visitTime" | "durationMinutes" | "status">>
  ) {
    setSavingId(visitId);
    setHint("");
    const previous = visits;
    setVisits((list) =>
      list.map((v) => (v.id === visitId ? { ...v, ...patch } : v))
    );

    try {
      const res = await fetch("/api/visits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: visitId, ...patch }),
      });
      if (!res.ok) throw new Error("save_failed");
      router.refresh();
    } catch {
      setVisits(previous);
      setHint("تغییر ذخیره نشد. دوباره تلاش کنید.");
    } finally {
      setSavingId(null);
    }
  }

  function setAttendance(visitId: string, status: VisitStatus) {
    const visit = visits.find((v) => v.id === visitId);
    if (!visit) return;
    // اگر همان وضعیت دوباره زده شد، برگردد به حالت در انتظار
    const next = visit.status === status ? "visitor" : status;
    void persistVisit(visitId, { status: next });
  }

  function beginCreate(lane: Lane, clientY: number) {
    const min = minutesFromPointer(lane, clientY);
    setInteraction({ kind: "create", lane, anchorMin: min, currentMin: min });
  }

  function beginMove(visit: VisitRow, lane: Lane, clientY: number) {
    const startMin = timeToMinutes(visit.visitTime!);
    const duration = durationForVisit(visit, clinic);
    const pointerMin = minutesFromPointer(lane, clientY);
    setInteraction({
      kind: "move",
      visitId: visit.id,
      lane,
      duration,
      grabOffsetMin: pointerMin - startMin,
      previewStartMin: startMin,
    });
  }

  function beginResize(visit: VisitRow, lane: Lane) {
    setInteraction({
      kind: "resize",
      visitId: visit.id,
      lane,
      startMin: timeToMinutes(visit.visitTime!),
      previewDuration: durationForVisit(visit, clinic),
    });
  }

  function onPointerMove(lane: Lane, clientY: number) {
    const current = interactionRef.current;
    if (!current || current.lane !== lane) return;

    if (current.kind === "create") {
      setInteraction({
        ...current,
        currentMin: minutesFromPointer(lane, clientY),
      });
      return;
    }

    if (current.kind === "move") {
      const pointerMin = minutesFromPointer(lane, clientY);
      let nextStart = pointerMin - current.grabOffsetMin;
      nextStart =
        Math.round((nextStart - workStartMin) / gridMinutes) * gridMinutes +
        workStartMin;
      const maxStart = workEndMin - current.duration;
      nextStart = Math.max(workStartMin, Math.min(maxStart, nextStart));
      setInteraction({ ...current, previewStartMin: nextStart });
      return;
    }

    if (current.kind === "resize") {
      const pointerMin = minutesFromPointer(lane, clientY) + gridMinutes;
      let duration = pointerMin - current.startMin;
      duration = Math.max(
        MIN_DURATION,
        Math.round(duration / gridMinutes) * gridMinutes
      );
      const maxDuration = workEndMin - current.startMin;
      duration = Math.min(maxDuration, duration);
      setInteraction({ ...current, previewDuration: duration });
    }
  }

  function finishInteraction() {
    const current = interactionRef.current;
    setInteraction(null);
    if (!current) return;

    if (current.kind === "create") {
      const startMin = Math.min(current.anchorMin, current.currentMin);
      const endMin =
        Math.max(current.anchorMin, current.currentMin) + gridMinutes;
      let duration = endMin - startMin;
      if (duration <= gridMinutes) {
        duration = slotDurationForType(clinic, current.lane);
      }
      const start = minutesToTime(startMin);
      const occupied = laneVisits(current.lane).some((v) =>
        rangesOverlap(
          start,
          duration,
          v.visitTime!,
          durationForVisit(v, clinic)
        )
      );
      if (occupied) {
        setHint("این بازه با نوبت دیگری تداخل دارد.");
        return;
      }
      router.push(
        `/clinic/reception/new?date=${day}&time=${start}&type=${current.lane}&duration=${duration}`
      );
      return;
    }

    if (current.kind === "move") {
      const start = minutesToTime(current.previewStartMin);
      const visit = dayVisits.find((v) => v.id === current.visitId);
      if (!visit) return;
      if (
        start === visit.visitTime &&
        current.duration === durationForVisit(visit, clinic)
      ) {
        return;
      }
      if (
        conflictsWithOthers(
          current.lane,
          current.visitId,
          start,
          current.duration
        )
      ) {
        setHint("جابه‌جایی ممکن نیست؛ با نوبت دیگری تداخل دارد.");
        return;
      }
      void persistVisit(current.visitId, {
        visitTime: start,
        durationMinutes: current.duration,
      });
      return;
    }

    if (current.kind === "resize") {
      const visit = dayVisits.find((v) => v.id === current.visitId);
      if (!visit) return;
      const start = minutesToTime(current.startMin);
      if (current.previewDuration === durationForVisit(visit, clinic)) return;
      if (
        conflictsWithOthers(
          current.lane,
          current.visitId,
          start,
          current.previewDuration
        )
      ) {
        setHint("کوتاه/بلند کردن ممکن نیست؛ با نوبت دیگری تداخل دارد.");
        return;
      }
      void persistVisit(current.visitId, {
        visitTime: start,
        durationMinutes: current.previewDuration,
      });
    }
  }

  const finishRef = useRef(finishInteraction);
  finishRef.current = finishInteraction;

  useEffect(() => {
    function onUp() {
      if (interactionRef.current) finishRef.current();
    }
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, []);

  function createSelection(lane: Lane) {
    if (!interaction || interaction.kind !== "create" || interaction.lane !== lane) {
      return null;
    }
    const startMin = Math.min(interaction.anchorMin, interaction.currentMin);
    const endMin =
      Math.max(interaction.anchorMin, interaction.currentMin) + gridMinutes;
    return { startMin, duration: endMin - startMin };
  }

  return (
    <div className="flex flex-col gap-3 md:h-full md:min-h-0 md:gap-4">
      {/* موبایل: عنوان و جدول با صفحه اسکرول می‌شوند. دسکتاپ: فقط شبکه ساعت‌ها */}
      <div className="space-y-3 md:shrink-0 md:space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">تقویم روزانه پذیرش</p>
          <h1 className="mt-1 text-xl font-extrabold text-brand sm:text-2xl">تقویم شناور نوبت‌ها</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            بازه شناور {formatTimeFa(clinic.workStart)} تا {formatTimeFa(clinic.workEnd)} · واحد{" "}
            {toFaNumber(gridMinutes)} دقیقه · ویزیت معمولاً {toFaNumber(clinic.visitSlotMinutes)} دقیقه ·
            دستگاه/پکیج معمولاً {toFaNumber(clinic.packageSlotMinutes)} دقیقه
          </p>
          <p className="mt-1 hidden text-[11px] text-muted-foreground sm:block">
            خانه خالی را بکشید تا نوبت جدید بسازید · نوبت را بکشید تا جابه‌جا شود · از لبه پایین
            اندازه را عوض کنید · تیک سبز = مراجعه کرد · ضربدر قرمز = لغو / نیامد.
          </p>
          {hint ? (
            <p className="mt-1 text-[11px] font-medium text-[#9A4E42]">{hint}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/clinic/reception/customers"
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-white px-3 text-sm font-semibold text-brand shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:h-11 sm:px-4"
          >
            <Users className="size-4" />
            لیست مشتریان
          </Link>
          <Link
            href={`/clinic/reception/new?date=${day}&channel=phone`}
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#3B5BDB] px-3 text-sm font-semibold text-white sm:h-11 sm:px-4"
          >
            <Phone className="size-4" />
            نوبت تلفنی
          </Link>
          <Link
            href={`/clinic/reception/new?date=${day}`}
            className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#D86B5C] px-3 text-sm font-semibold text-white sm:h-11 sm:px-4"
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
      </div>

      <div className="flex flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_6px_18px_rgba(35,70,55,0.06)] select-none md:min-h-0 md:flex-1">
        <div className="grid shrink-0 grid-cols-[4.25rem_1fr_1fr] border-b border-black/5 bg-[#F7F8F6] text-center text-xs font-bold text-brand">
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

        <div className="md:min-h-0 md:flex-1 md:overflow-y-auto md:overscroll-y-contain">
        <div className="grid grid-cols-[4.25rem_1fr_1fr]">
          <div className="relative bg-[#FAFBFA]">
            {gridSlots.map((slot) => (
              <div
                key={slot}
                className="border-b border-black/5 pr-1 text-left text-[10px] font-semibold leading-none text-muted-foreground"
                style={{ height: ROW_PX }}
                dir="ltr"
              >
                <span className="inline-block pt-1.5 pl-1">{formatTimeFa(slot)}</span>
              </div>
            ))}
          </div>

          <LaneColumn
            lane="consultation"
            slots={gridSlots}
            visits={laneVisits("consultation")}
            allVisits={visits}
            clinic={clinic}
            gridMinutes={gridMinutes}
            workStartMin={workStartMin}
            selection={createSelection("consultation")}
            interaction={interaction}
            savingId={savingId}
            laneRef={(el) => {
              laneRefs.current.consultation = el;
            }}
            onEmptyDown={(y) => beginCreate("consultation", y)}
            onMove={(y) => onPointerMove("consultation", y)}
            onVisitMoveStart={(visit, y) => beginMove(visit, "consultation", y)}
            onVisitResizeStart={(visit) => beginResize(visit, "consultation")}
            onAttendance={setAttendance}
          />

          <LaneColumn
            lane="package"
            slots={gridSlots}
            visits={laneVisits("package")}
            allVisits={visits}
            clinic={clinic}
            gridMinutes={gridMinutes}
            workStartMin={workStartMin}
            selection={createSelection("package")}
            interaction={interaction}
            savingId={savingId}
            laneRef={(el) => {
              laneRefs.current.package = el;
            }}
            onEmptyDown={(y) => beginCreate("package", y)}
            onMove={(y) => onPointerMove("package", y)}
            onVisitMoveStart={(visit, y) => beginMove(visit, "package", y)}
            onVisitResizeStart={(visit) => beginResize(visit, "package")}
            onAttendance={setAttendance}
          />
        </div>
        </div>
      </div>

      {untimed.length > 0 ? (
        <section className="rounded-[28px] bg-[#FFF8F5] p-4 md:max-h-40 md:shrink-0 md:overflow-y-auto">
          <h2 className="text-sm font-bold text-[#9A4E42]">
            نوبت‌های بدون ساعت / تلفنی
          </h2>
          <ul className="mt-3 space-y-2">
            {untimed.map((visit) => {
              const n = visitNumberForPatient(visits, visit.patientId, visit.id);
              return (
                <li
                  key={visit.id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 rounded-2xl px-3 py-2 text-sm",
                    visit.status === "cancelled"
                      ? "bg-[#F3F3F3]"
                      : visit.status === "completed" || visit.status === "admitted"
                        ? "bg-[#F2FBF4]"
                        : "bg-white"
                  )}
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <AttendanceMark status={visit.status} />
                    <VisitBadge n={n} />
                    {visit.channel === "phone" ? (
                      <span className="rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[10px] font-bold text-[#3B5BDB]">
                        تلفنی
                      </span>
                    ) : null}
                    {visit.patient ? patientFullName(visit.patient) : "بدون نام"} ·{" "}
                    {visit.visitType === "package" ? "پکیج" : "ویزیت"}
                    {visit.patient?.phone ? (
                      <a
                        href={`tel:${visit.patient.phone}`}
                        className="font-semibold text-brand underline-offset-2 hover:underline"
                        dir="ltr"
                      >
                        {visit.patient.phone}
                      </a>
                    ) : null}
                  </span>
                  <AttendanceButtons
                    status={visit.status}
                    size="sm"
                    withLabels
                    onChange={(status) => setAttendance(visit.id, status)}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function LaneColumn({
  lane,
  slots,
  visits,
  allVisits,
  clinic,
  gridMinutes,
  workStartMin,
  selection,
  interaction,
  savingId,
  laneRef,
  onEmptyDown,
  onMove,
  onVisitMoveStart,
  onVisitResizeStart,
  onAttendance,
}: {
  lane: Lane;
  slots: string[];
  visits: VisitRow[];
  allVisits: VisitRow[];
  clinic: ClinicProfile;
  gridMinutes: number;
  workStartMin: number;
  selection: { startMin: number; duration: number } | null;
  interaction: Interaction | null;
  savingId: string | null;
  laneRef: (el: HTMLDivElement | null) => void;
  onEmptyDown: (clientY: number) => void;
  onMove: (clientY: number) => void;
  onVisitMoveStart: (visit: VisitRow, clientY: number) => void;
  onVisitResizeStart: (visit: VisitRow) => void;
  onAttendance: (visitId: string, status: VisitStatus) => void;
}) {
  return (
    <div
      ref={laneRef}
      className="relative border-r border-black/5 last:border-r-0"
      style={{ height: slots.length * ROW_PX }}
      onMouseDown={(e) => {
        if (e.button !== 0) return;
        if ((e.target as HTMLElement).closest("[data-visit-block]")) return;
        e.preventDefault();
        onEmptyDown(e.clientY);
      }}
      onMouseMove={(e) => onMove(e.clientY)}
    >
      {slots.map((slot) => (
        <div
          key={slot}
          className="pointer-events-none absolute inset-x-0 border-b border-black/5"
          style={{
            top: ((timeToMinutes(slot) - workStartMin) / gridMinutes) * ROW_PX,
            height: ROW_PX,
          }}
        />
      ))}

      {selection ? (
        <div
          className="pointer-events-none absolute inset-x-1 z-20 rounded-xl bg-brand/20 ring-1 ring-brand/30"
          style={{
            top: ((selection.startMin - workStartMin) / gridMinutes) * ROW_PX + 1,
            height: (selection.duration / gridMinutes) * ROW_PX - 2,
          }}
        />
      ) : null}

      {visits.map((visit) => {
        let start = visit.visitTime!;
        let duration = durationForVisit(visit, clinic);

        if (
          interaction &&
          (interaction.kind === "move" || interaction.kind === "resize") &&
          interaction.visitId === visit.id
        ) {
          if (interaction.kind === "move") {
            start = minutesToTime(interaction.previewStartMin);
            duration = interaction.duration;
          } else {
            start = minutesToTime(interaction.startMin);
            duration = interaction.previewDuration;
          }
        }

        const top =
          ((timeToMinutes(start) - workStartMin) / gridMinutes) * ROW_PX + 1;
        const height = (duration / gridMinutes) * ROW_PX - 2;
        const end = endTimeFromStart(start, duration);
        const n = visitNumberForPatient(allVisits, visit.patientId, visit.id);
        const active =
          !!interaction &&
          (interaction.kind === "move" || interaction.kind === "resize") &&
          interaction.visitId === visit.id;
        const saving = savingId === visit.id;
        const attended = visit.status === "completed" || visit.status === "admitted";
        const cancelled = visit.status === "cancelled";

        return (
          <div
            key={visit.id}
            data-visit-block
            className={cn(
              "absolute inset-x-1 z-10 overflow-hidden rounded-xl px-2 py-1 shadow-sm",
              cancelled
                ? "bg-[#F3F3F3] text-[#8A8A8A] line-through decoration-[#C45C5C]/50"
                : attended
                  ? "bg-[#DCEFDF] text-[#1F6B3A] ring-1 ring-[#2F9E5A]/35"
                  : lane === "consultation"
                    ? "bg-[#E8F2EA] text-[#2F6B4F]"
                    : "bg-[#F6E6E1] text-[#9A4E42]",
              active && "ring-2 ring-brand/40",
              saving && "opacity-70"
            )}
            style={{ top, height: Math.max(height, ROW_PX - 2), cursor: "grab" }}
            onMouseDown={(e) => {
              if (e.button !== 0) return;
              if ((e.target as HTMLElement).closest("[data-resize-handle]")) return;
              if ((e.target as HTMLElement).closest("a")) return;
              if ((e.target as HTMLElement).closest("[data-attend-btn]")) return;
              e.preventDefault();
              e.stopPropagation();
              onVisitMoveStart(visit, e.clientY);
            }}
          >
            <div className="flex items-start justify-between gap-1">
              <p className="truncate text-[11px] font-extrabold leading-tight">
                {visit.patient ? patientFullName(visit.patient) : "بدون نام"}
              </p>
              <div className="flex shrink-0 items-center gap-1">
                <AttendanceMark status={visit.status} />
                {visit.channel === "phone" ? (
                  <span className="rounded-full bg-[#EEF2FF] px-1.5 py-0.5 text-[9px] font-bold text-[#3B5BDB]">
                    تلفنی
                  </span>
                ) : null}
                <VisitBadge n={n} />
              </div>
            </div>
            {visit.patient?.phone ? (
              <a
                href={`tel:${visit.patient.phone}`}
                className="mt-0.5 block truncate text-[10px] font-semibold underline-offset-2 hover:underline"
                dir="ltr"
                title="تماس"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                {visit.patient.phone}
              </a>
            ) : null}
            <p className="mt-0.5 text-[9px] opacity-80">
              {formatTimeFa(start)}–{formatTimeFa(end)} · {visitStatusLabel(visit.status)}
            </p>

            <div
              data-attend-btn
              className="mt-1 flex items-center gap-1"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <AttendanceButtons
                status={visit.status}
                size="sm"
                onChange={(status) => onAttendance(visit.id, status)}
              />
              {visit.patient ? (
                <Link
                  href={`/clinic/reception/customers/${visit.patient.id}`}
                  className="mr-auto text-[9px] font-bold underline-offset-2 hover:underline"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  پرونده
                </Link>
              ) : null}
            </div>

            <div
              data-resize-handle
              title="کشیدن برای تغییر مدت"
              className="absolute inset-x-2 bottom-0 h-2 cursor-ns-resize rounded-b-xl"
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                onVisitResizeStart(visit);
              }}
            >
              <div className="mx-auto mt-0.5 h-1 w-8 rounded-full bg-current opacity-35" />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VisitBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full bg-white/80 px-1.5 py-0.5 text-[9px] font-bold text-brand ring-1 ring-brand/15">
      مراجعه {toFaNumber(n)}
    </span>
  );
}

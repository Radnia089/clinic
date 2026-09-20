"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import {
  AttendanceButtons,
  AttendanceMark,
} from "@/components/clinic/attendance-buttons";
import { EmptyState, StatusBadge } from "@/components/clinic/page-header";
import {
  durationForVisit,
  endTimeFromStart,
  formatTimeFa,
  toFaNumber,
  visitNumberForPatient,
} from "@/lib/schedule";
import {
  formatDateFa,
  genderLabel,
  patientFullName,
  visitChannelLabel,
  visitStatusLabel,
  visitTypeLabel,
  type ClinicProfile,
  type Patient,
  type Visit,
  type VisitStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type VisitRow = Visit & { patient: Patient | null };

export function VisitsTable({
  visits: initialVisits,
  allVisits,
  emptyTitle,
  showAdmissionAction = false,
  clinic,
}: {
  visits: VisitRow[];
  allVisits?: Visit[];
  emptyTitle: string;
  showAdmissionAction?: boolean;
  clinic?: ClinicProfile;
}) {
  const router = useRouter();
  const [visits, setVisits] = useState(initialVisits);
  const [busyId, setBusyId] = useState<string | null>(null);

  // همگام با داده سرور بعد از refresh
  if (initialVisits !== visits && initialVisits.length !== visits.length) {
    // avoid noisy loops — useEffect instead
  }

  if (visits.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        hint="با ثبت مراجعه‌کننده جدید، ردیف‌ها اینجا ظاهر می‌شوند."
      />
    );
  }

  const numberingSource = allVisits ?? visits;

  async function setAttendance(visitId: string, status: VisitStatus) {
    const current = visits.find((v) => v.id === visitId);
    if (!current) return;
    const next = current.status === status ? "visitor" : status;
    setBusyId(visitId);
    const previous = visits;
    setVisits((list) =>
      list.map((v) => (v.id === visitId ? { ...v, status: next } : v))
    );
    try {
      const res = await fetch("/api/visits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: visitId, status: next }),
      });
      if (!res.ok) throw new Error("fail");
      router.refresh();
    } catch {
      setVisits(previous);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-3">
      {visits.map((visit) => {
        const n = visitNumberForPatient(numberingSource, visit.patientId, visit.id);
        const duration = clinic
          ? durationForVisit(visit, clinic)
          : visit.durationMinutes;
        const timeLabel =
          visit.visitTime && duration
            ? `${formatTimeFa(visit.visitTime)}–${formatTimeFa(endTimeFromStart(visit.visitTime, duration))}`
            : visit.visitTime
              ? formatTimeFa(visit.visitTime)
              : visit.channel === "phone"
                ? "تلفنی"
                : "—";
        const attended =
          visit.status === "completed" || visit.status === "admitted";
        const cancelled = visit.status === "cancelled";

        return (
          <article
            key={visit.id}
            className={cn(
              "rounded-[24px] p-4 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-5",
              cancelled
                ? "bg-[#F3F3F3]"
                : attended
                  ? "bg-[#F2FBF4]"
                  : "bg-white",
              busyId === visit.id && "opacity-70"
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="flex flex-wrap items-center gap-2 text-base font-extrabold text-brand">
                  {visit.patient ? patientFullName(visit.patient) : "بدون نام"}
                  <AttendanceMark status={visit.status} />
                  <span className="inline-flex items-center rounded-full bg-[#E8F2EA] px-2 py-0.5 text-[11px] font-bold text-brand">
                    مراجعه {toFaNumber(n)}
                  </span>
                  {visit.channel === "phone" ? (
                    <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-2 py-0.5 text-[11px] font-bold text-[#3B5BDB]">
                      تلفنی
                    </span>
                  ) : null}
                </p>
                <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                  {visit.patient?.phone ?? "—"}
                </p>
              </div>
              <StatusBadge
                tone={
                  attended
                    ? "success"
                    : cancelled
                      ? "danger"
                      : visit.status === "visitor"
                        ? "info"
                        : "default"
                }
              >
                {visitStatusLabel(visit.status)}
              </StatusBadge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <div className="rounded-2xl bg-[#F7F8F6] px-3 py-2">
                <p className="text-[11px] text-muted-foreground">سن / جنسیت</p>
                <p className="mt-1 font-medium">
                  {visit.patient
                    ? `${visit.patient.age != null ? visit.patient.age : "—"} · ${genderLabel(visit.patient.gender)}`
                    : "—"}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F7F8F6] px-3 py-2">
                <p className="text-[11px] text-muted-foreground">تاریخ</p>
                <p className="mt-1 font-medium">{formatDateFa(visit.visitDate)}</p>
              </div>
              <div className="rounded-2xl bg-[#F7F8F6] px-3 py-2">
                <p className="text-[11px] text-muted-foreground">ساعت / کانال</p>
                <p className="mt-1 font-medium">
                  {timeLabel} · {visitChannelLabel(visit.channel)}
                </p>
              </div>
              <div className="rounded-2xl bg-[#F7F8F6] px-3 py-2">
                <p className="text-[11px] text-muted-foreground">نوع</p>
                <p className="mt-1 font-medium">
                  {visitTypeLabel(visit.visitType)}
                  {visit.packageName ? ` · ${visit.packageName}` : ""}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <AttendanceButtons
                status={visit.status}
                withLabels
                onChange={(status) => setAttendance(visit.id, status)}
              />
              <Link
                href={`/clinic/reception/admission/${visit.id}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-brand"
              >
                {showAdmissionAction || visit.status === "visitor"
                  ? "ادامه فرم پذیرش"
                  : "مشاهده پرونده"}
                <ChevronLeft className="size-4" />
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}

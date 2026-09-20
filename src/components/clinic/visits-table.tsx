import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { EmptyState, StatusBadge } from "@/components/clinic/page-header";
import {
  formatDateFa,
  genderLabel,
  patientFullName,
  visitStatusLabel,
  visitTypeLabel,
  type Patient,
  type Visit,
} from "@/lib/types";

type VisitRow = Visit & { patient: Patient | null };

export function VisitsTable({
  visits,
  emptyTitle,
  showAdmissionAction = false,
}: {
  visits: VisitRow[];
  emptyTitle: string;
  showAdmissionAction?: boolean;
}) {
  if (visits.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        hint="با ثبت مراجعه‌کننده جدید، ردیف‌ها اینجا ظاهر می‌شوند."
      />
    );
  }

  return (
    <div className="space-y-3">
      {visits.map((visit) => (
        <article
          key={visit.id}
          className="rounded-[24px] bg-white p-4 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-base font-extrabold text-brand">
                {visit.patient ? patientFullName(visit.patient) : "بدون نام"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                {visit.patient?.phone ?? "—"}
              </p>
            </div>
            <StatusBadge
              tone={
                visit.status === "admitted"
                  ? "success"
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
                  ? `${visit.patient.age} · ${genderLabel(visit.patient.gender)}`
                  : "—"}
              </p>
            </div>
            <div className="rounded-2xl bg-[#F7F8F6] px-3 py-2">
              <p className="text-[11px] text-muted-foreground">تاریخ</p>
              <p className="mt-1 font-medium">{formatDateFa(visit.visitDate)}</p>
            </div>
            <div className="rounded-2xl bg-[#F7F8F6] px-3 py-2">
              <p className="text-[11px] text-muted-foreground">نوع</p>
              <p className="mt-1 font-medium">{visitTypeLabel(visit.visitType)}</p>
            </div>
            <div className="rounded-2xl bg-[#F7F8F6] px-3 py-2">
              <p className="text-[11px] text-muted-foreground">پکیج</p>
              <p className="mt-1 truncate font-medium">{visit.packageName || "—"}</p>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
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
      ))}
    </div>
  );
}

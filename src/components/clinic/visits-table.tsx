import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    return <EmptyState title={emptyTitle} hint="با ثبت مراجعه‌کننده جدید، ردیف‌ها اینجا ظاهر می‌شوند." />;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-right">نام</TableHead>
            <TableHead className="text-right">موبایل</TableHead>
            <TableHead className="text-right">سن / جنسیت</TableHead>
            <TableHead className="text-right">تاریخ مراجعه</TableHead>
            <TableHead className="text-right">نوع</TableHead>
            <TableHead className="text-right">وضعیت</TableHead>
            <TableHead className="text-right">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visits.map((visit) => (
            <TableRow key={visit.id}>
              <TableCell className="font-medium">
                {visit.patient ? patientFullName(visit.patient) : "—"}
              </TableCell>
              <TableCell dir="ltr" className="text-left">
                {visit.patient?.phone ?? "—"}
              </TableCell>
              <TableCell>
                {visit.patient
                  ? `${visit.patient.age} · ${genderLabel(visit.patient.gender)}`
                  : "—"}
              </TableCell>
              <TableCell>{formatDateFa(visit.visitDate)}</TableCell>
              <TableCell>
                {visitTypeLabel(visit.visitType)}
                {visit.packageName ? (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {visit.packageName}
                  </span>
                ) : null}
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {showAdmissionAction || visit.status === "visitor" ? (
                    <Link
                      href={`/clinic/reception/admission/${visit.id}`}
                      className="text-sm font-medium text-brand hover:underline"
                    >
                      فرم پذیرش
                    </Link>
                  ) : (
                    <Link
                      href={`/clinic/reception/admission/${visit.id}`}
                      className="text-sm text-muted-foreground hover:text-brand"
                    >
                      مشاهده
                    </Link>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import Link from "next/link";
import { VisitsTable } from "@/components/clinic/visits-table";
import { PageHeader } from "@/components/clinic/page-header";
import { getAppData, listPatients, listVisits } from "@/lib/store";

export default async function VisitorsPage() {
  const [visits, patients, data] = await Promise.all([
    listVisits(),
    listPatients(),
    getAppData(),
  ]);
  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));
  const rows = visits
    .filter((v) => v.status === "visitor")
    .map((visit) => ({ ...visit, patient: patientMap[visit.patientId] ?? null }));

  return (
    <div>
      <PageHeader
        eyebrow="صف پذیرش"
        title="مراجعه‌کنندگان"
        description="افرادی که ثبت اولیه شده‌اند و هنوز فرم پذیرش تخصصی‌شان کامل نشده."
        action={
          <Link
            href="/clinic/reception/new"
            className="inline-flex h-11 items-center rounded-2xl bg-brand px-5 text-sm font-semibold text-white"
          >
            ثبت جدید
          </Link>
        }
      />
      <VisitsTable
        visits={rows}
        allVisits={visits}
        clinic={data.clinic}
        emptyTitle="مراجعه‌کننده‌ای در صف نیست"
        showAdmissionAction
      />
    </div>
  );
}

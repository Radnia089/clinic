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
  // صف پذیرش + علامت‌خورده‌ها (مراجعه کرد / نیامد) تا تیک و ضربدر دیده شوند
  const rows = visits
    .filter(
      (v) =>
        v.status === "visitor" ||
        v.status === "completed" ||
        v.status === "cancelled"
    )
    .map((visit) => ({ ...visit, patient: patientMap[visit.patientId] ?? null }));

  return (
    <div>
      <PageHeader
        eyebrow="صف پذیرش"
        title="مراجعه‌کنندگان"
        description="ویزیت حضوری یا تلفنی — با تیک سبز مراجعه کرد و با ضربدر قرمز نیامد را بزنید."
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

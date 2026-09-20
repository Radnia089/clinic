import { VisitsTable } from "@/components/clinic/visits-table";
import { PageHeader } from "@/components/clinic/page-header";
import { getAppData, listPatients, listVisits } from "@/lib/store";

export default async function AdmittedPage() {
  const [visits, patients, data] = await Promise.all([
    listVisits(),
    listPatients(),
    getAppData(),
  ]);
  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));
  const rows = visits
    .filter((v) => v.status === "admitted" || v.status === "completed")
    .map((visit) => ({ ...visit, patient: patientMap[visit.patientId] ?? null }));

  return (
    <div>
      <PageHeader
        eyebrow="پرونده‌ها"
        title="پذیرش‌شده‌ها"
        description="پرونده‌هایی که فرم پذیرش تخصصی‌شان تکمیل شده است."
      />
      <VisitsTable
        visits={rows}
        allVisits={visits}
        clinic={data.clinic}
        emptyTitle="هنوز پذیرش‌شده‌ای وجود ندارد"
      />
    </div>
  );
}

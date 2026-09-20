import { VisitsTable } from "@/components/clinic/visits-table";
import { PageHeader } from "@/components/clinic/page-header";
import { listPatients, listVisits } from "@/lib/store";

export default async function AdmittedPage() {
  const [visits, patients] = await Promise.all([listVisits(), listPatients()]);
  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));
  const rows = visits
    .filter((v) => v.status === "admitted" || v.status === "completed")
    .map((visit) => ({ ...visit, patient: patientMap[visit.patientId] ?? null }));

  return (
    <div>
      <PageHeader
        title="لیست پذیرش‌شده‌ها"
        description="پرونده‌هایی که فرم پذیرش تخصصی‌شان تکمیل و در سیستم ثبت شده است."
      />
      <VisitsTable visits={rows} emptyTitle="هنوز پذیرش‌شده‌ای وجود ندارد" />
    </div>
  );
}

import { VisitsTable } from "@/components/clinic/visits-table";
import { PageHeader } from "@/components/clinic/page-header";
import { listPatients, listVisits } from "@/lib/store";

export default async function VisitorsPage() {
  const [visits, patients] = await Promise.all([listVisits(), listPatients()]);
  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));
  const rows = visits
    .filter((v) => v.status === "visitor")
    .map((visit) => ({ ...visit, patient: patientMap[visit.patientId] ?? null }));

  return (
    <div>
      <PageHeader
        title="لیست مراجعه‌کنندگان"
        description="افرادی که ثبت اولیه شده‌اند و هنوز فرم پذیرش تخصصی‌شان کامل نشده است."
      />
      <VisitsTable visits={rows} emptyTitle="مراجعه‌کننده‌ای در صف نیست" showAdmissionAction />
    </div>
  );
}

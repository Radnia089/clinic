import { ReceptionDayBoard } from "@/components/clinic/reception-day-board";
import { getAppData, listPatients, listVisits } from "@/lib/store";

export default async function ReceptionHomePage() {
  const [data, visits, patients] = await Promise.all([
    getAppData(),
    listVisits(),
    listPatients(),
  ]);
  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));
  const rows = visits.map((visit) => ({
    ...visit,
    patient: patientMap[visit.patientId] ?? null,
  }));

  return <ReceptionDayBoard visits={rows} clinic={data.clinic} />;
}

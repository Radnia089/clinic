import { redirect } from "next/navigation";
import { PatientInboxManager } from "@/components/clinic/patient-inbox-manager";
import { getCurrentUser, requireStaffPage } from "@/lib/auth";
import { toPublicPatient } from "@/lib/patient-public";
import { listPatientInboxMessagesAdmin, listPatients } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ClinicNotificationsPage() {
  await requireStaffPage();
  const user = await getCurrentUser();
  if (!user || user.role !== "management") {
    redirect("/clinic");
  }

  const [messages, patients] = await Promise.all([
    listPatientInboxMessagesAdmin(),
    listPatients(),
  ]);

  return (
    <PatientInboxManager
      initialMessages={messages}
      patients={patients.map(toPublicPatient)}
    />
  );
}

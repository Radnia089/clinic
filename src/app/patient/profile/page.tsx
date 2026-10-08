import { redirect } from "next/navigation";
import { PatientProfile } from "@/components/patient/patient-profile";
import { getCurrentPatient } from "@/lib/patient-auth";
import { listMeasurements } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PatientProfilePage() {
  const patient = await getCurrentPatient();
  if (!patient) redirect("/patient/login");
  const measurements = await listMeasurements(patient.id);
  return <PatientProfile patient={patient} measurements={measurements} />;
}

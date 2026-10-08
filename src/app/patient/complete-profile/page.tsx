import { redirect } from "next/navigation";
import { PatientCompleteProfile } from "@/components/patient/patient-complete-profile";
import { getCurrentPatient } from "@/lib/patient-auth";

export const dynamic = "force-dynamic";

export default async function PatientCompleteProfilePage() {
  const patient = await getCurrentPatient();
  if (!patient) redirect("/patient/login");
  if (patient.profileComplete) redirect("/patient");
  return <PatientCompleteProfile patient={patient} />;
}

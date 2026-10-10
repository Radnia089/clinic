import { redirect } from "next/navigation";
import { PatientPasswordLogin } from "@/components/patient/patient-password-login";
import { getCurrentPatient } from "@/lib/patient-auth";

export const dynamic = "force-dynamic";

export default async function PatientLoginPage() {
  const patient = await getCurrentPatient();
  if (patient) {
    redirect(patient.profileComplete ? "/patient" : "/patient/complete-profile");
  }
  return <PatientPasswordLogin />;
}

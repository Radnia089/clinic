import { redirect } from "next/navigation";
import { PatientChangePassword } from "@/components/patient/patient-change-password";
import { getCurrentPatient } from "@/lib/patient-auth";

export const dynamic = "force-dynamic";

export default async function PatientChangePasswordPage() {
  const patient = await getCurrentPatient();
  if (!patient) {
    redirect("/patient/login");
  }
  return <PatientChangePassword phone={patient.phone} />;
}

import { redirect } from "next/navigation";
import { PatientOtpLogin } from "@/components/patient/patient-otp-login";
import { getCurrentPatient } from "@/lib/patient-auth";

export const dynamic = "force-dynamic";

export default async function PatientLoginPage() {
  const patient = await getCurrentPatient();
  if (patient) {
    redirect(patient.profileComplete ? "/patient" : "/patient/complete-profile");
  }
  return <PatientOtpLogin />;
}

import { redirect } from "next/navigation";
import { PatientCompleteProfile } from "@/components/patient/patient-complete-profile";
import { getCurrentPatient } from "@/lib/patient-auth";
import { patientHasRegisteredInfo } from "@/lib/patient-profile";

export const dynamic = "force-dynamic";

export default async function PatientCompleteProfilePage() {
  const patient = await getCurrentPatient();
  if (!patient) redirect("/patient/login");
  // اگر قبلاً اطلاعات ثبت شده (حضوری یا اپ)، دوباره فرم نگیر
  if (patientHasRegisteredInfo(patient)) redirect("/patient");
  return <PatientCompleteProfile patient={patient} />;
}

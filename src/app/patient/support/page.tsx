import { redirect } from "next/navigation";
import { PatientSupportScreen } from "@/components/patient/patient-support-screen";
import { getCurrentPatient } from "@/lib/patient-auth";
import { getAppData } from "@/lib/store";
import { DEFAULT_CLINIC } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function PatientSupportPage() {
  const patient = await getCurrentPatient();
  if (!patient) {
    redirect("/patient/login");
  }

  const { clinic } = await getAppData();
  const clinicPhone = clinic.phone || DEFAULT_CLINIC.phone;

  return <PatientSupportScreen clinicPhone={clinicPhone} />;
}

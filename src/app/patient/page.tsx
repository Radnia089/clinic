import { PatientHomeScreen } from "@/components/patient/patient-home";

export const dynamic = "force-dynamic";

export default function PatientAppPage() {
  return (
    <div className="min-h-[100svh] bg-[#EEF1EE]">
      <PatientHomeScreen />
    </div>
  );
}

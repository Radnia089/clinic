import { Suspense } from "react";
import { PatientHomeScreen } from "@/components/patient/patient-home";

export const dynamic = "force-dynamic";

export default function PatientAppPage() {
  return (
    <div className="min-h-[100svh] bg-[#EEF1EE]">
      <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">در حال بارگذاری...</div>}>
        <PatientHomeScreen />
      </Suspense>
    </div>
  );
}

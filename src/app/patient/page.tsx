import { Suspense } from "react";
import { PatientHomeScreen } from "@/components/patient/patient-home";
import { listChampions } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PatientAppPage() {
  const champions = await listChampions({ publishedOnly: true });

  return (
    <div className="min-h-[100svh] bg-[#EEF1EE]">
      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-muted-foreground">
            در حال بارگذاری...
          </div>
        }
      >
        <PatientHomeScreen champions={champions} />
      </Suspense>
    </div>
  );
}

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PatientHomeScreen } from "@/components/patient/patient-home";
import { getCurrentPatient } from "@/lib/patient-auth";
import { patientHasRegisteredInfo } from "@/lib/patient-profile";
import { listChampions, listPromoBanners } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PatientAppPage() {
  const patient = await getCurrentPatient();
  if (!patient) redirect("/patient/login");
  if (!patientHasRegisteredInfo(patient)) redirect("/patient/complete-profile");

  const [champions, promoBanners] = await Promise.all([
    listChampions({ publishedOnly: true }),
    listPromoBanners({ publishedOnly: true }),
  ]);

  return (
    <div className="min-h-[100svh] bg-[#EEF1EE]">
      <Suspense
        fallback={
          <div className="p-8 text-center text-sm text-muted-foreground">
            در حال بارگذاری...
          </div>
        }
      >
        <PatientHomeScreen
          champions={champions}
          promoBanners={promoBanners}
        />
      </Suspense>
    </div>
  );
}

import { redirect } from "next/navigation";
import { AboutManager } from "@/components/clinic/about-manager";
import { getCurrentUser } from "@/lib/auth";
import { getAppData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ClinicAboutPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "management") {
    redirect("/clinic");
  }

  const { clinic } = await getAppData();
  return <AboutManager initialClinic={clinic} />;
}

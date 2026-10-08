import { redirect } from "next/navigation";
import { ChampionsManager } from "@/components/clinic/champions-manager";
import { getCurrentUser } from "@/lib/auth";
import { listChampions } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ClinicChampionsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "management") {
    redirect("/clinic");
  }

  const items = await listChampions({ publishedOnly: false });

  return <ChampionsManager initialItems={items} />;
}

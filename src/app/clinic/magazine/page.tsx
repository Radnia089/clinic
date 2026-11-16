import { redirect } from "next/navigation";
import { MagazineManager } from "@/components/clinic/magazine-manager";
import { getCurrentUser, requireStaffPage } from "@/lib/auth";
import { listArticles } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ClinicMagazinePage() {
  await requireStaffPage();
  const user = await getCurrentUser();
  if (!user || user.role !== "management") {
    redirect("/clinic");
  }
  const items = await listArticles({ publishedOnly: false });
  return <MagazineManager initialItems={items} />;
}

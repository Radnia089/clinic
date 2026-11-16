import { redirect } from "next/navigation";
import { PromoBannersManager } from "@/components/clinic/promo-banners-manager";
import { getCurrentUser, requireStaffPage } from "@/lib/auth";
import { listPromoBanners } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ClinicBannersPage() {
  await requireStaffPage();
  const user = await getCurrentUser();
  if (!user || user.role !== "management") {
    redirect("/clinic");
  }

  const items = await listPromoBanners({ publishedOnly: false });
  return <PromoBannersManager initialItems={items} />;
}

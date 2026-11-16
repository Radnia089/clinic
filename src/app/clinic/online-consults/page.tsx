import { OnlineConsultsPanel } from "@/components/clinic/online-consults-panel";
import { PageHeader } from "@/components/clinic/page-header";
import { listOnlineConsults } from "@/lib/store";
import { requireStaffPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function OnlineConsultsPage() {
  await requireStaffPage();
  const items = await listOnlineConsults();
  return (
    <div>
      <PageHeader
        title="مشاوره آنلاین"
        description="درخواست‌های مشاوره آنلاین مشتری را ببینید، وقت تماس رزرو کنید، پیامک بفرستید و از اینجا تماس بگیرید."
      />
      <OnlineConsultsPanel initialItems={items} />
    </div>
  );
}

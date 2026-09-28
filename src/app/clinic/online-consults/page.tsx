import { OnlineConsultsPanel } from "@/components/clinic/online-consults-panel";
import { PageHeader } from "@/components/clinic/page-header";
import { listOnlineConsults } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function OnlineConsultsPage() {
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

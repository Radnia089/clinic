import { redirect } from "next/navigation";
import { MessengerPanel } from "@/components/clinic/messenger-panel";
import { PageHeader } from "@/components/clinic/page-header";
import { getCurrentUser } from "@/lib/auth";
import { messengerTokens } from "@/lib/messenger";
import { getClinicProfile } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function MessengerPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "management") redirect("/clinic");
  const clinic = await getClinicProfile();

  return (
    <div>
      <PageHeader
        eyebrow="فقط مدیر"
        title="اطلاع‌رسانی تلگرام و بله"
        description="وقتی از سایت نوبت یا مشاوره آنلاین ثبت شود، همان لحظه برای شناسه‌هایی که اینجا می‌نویسید پیام می‌رود."
      />
      <MessengerPanel
        initialSettings={clinic.messengerNotify}
        tokens={messengerTokens()}
      />
    </div>
  );
}

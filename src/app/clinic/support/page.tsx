import { redirect } from "next/navigation";
import { PageHeader } from "@/components/clinic/page-header";
import { SupportTicketsPanel } from "@/components/clinic/support-tickets-panel";
import { getCurrentUser } from "@/lib/auth";
import { listSupportTickets } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ClinicSupportPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const items = await listSupportTickets();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="پشتیبانی مشتریان"
        description="تیکت‌های ارسال‌شده از اپ مشتری را ببینید، پاسخ بدهید و وضعیت را به‌روز کنید."
      />
      <SupportTicketsPanel initialItems={items} />
    </div>
  );
}

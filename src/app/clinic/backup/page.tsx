import { redirect } from "next/navigation";
import { CustomerBackupPanel } from "@/components/clinic/customer-backup-panel";
import { PageHeader } from "@/components/clinic/page-header";
import { getCurrentUser } from "@/lib/auth";
import { customerBackupCounts } from "@/lib/customer-backup";

export default async function CustomerBackupPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "management") {
    redirect("/clinic");
  }

  const counts = await customerBackupCounts();

  return (
    <div>
      <PageHeader
        eyebrow="فقط مدیر"
        title="بکاپ مشتریان"
        description="همه اطلاعات مشتری را هر وقت خواستید در یک فایل اکسل دانلود کنید."
      />
      <CustomerBackupPanel counts={counts} />
    </div>
  );
}

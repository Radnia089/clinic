import { redirect } from "next/navigation";
import { CustomerImportPanel } from "@/components/clinic/customer-import-panel";
import { PageHeader } from "@/components/clinic/page-header";
import { getCurrentUser, requireStaffPage } from "@/lib/auth";

export default async function CustomerImportPage() {
  await requireStaffPage();
  const user = await getCurrentUser();
  if (!user || user.role !== "management") {
    redirect("/clinic");
  }

  return (
    <div>
      <PageHeader
        eyebrow="فقط مدیر"
        title="ورود پرونده‌های قبلی"
        description="پرونده‌های کاغذی و فایل اکسل قدیمی از اینجا وارد مشتریان می‌شوند. اطلاعات ناقص هم قبول است و بعداً قابل تکمیل است."
      />
      <CustomerImportPanel />
    </div>
  );
}

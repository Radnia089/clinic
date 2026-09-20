import { NewVisitorForm } from "@/components/clinic/new-visitor-form";
import { PageHeader } from "@/components/clinic/page-header";

export default function NewVisitorPage() {
  return (
    <div>
      <PageHeader
        title="ثبت مراجعه‌کننده"
        description="اگر مشتری برای اولین بار آمده، اطلاعات عمومی را بگیرید، تاریخ مراجعه را ثبت کنید و مشخص کنید ویزیت است یا پکیج لاغری."
      />
      <NewVisitorForm />
    </div>
  );
}

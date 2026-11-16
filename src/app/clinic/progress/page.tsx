import { PageHeader } from "@/components/clinic/page-header";
import { ProgressRecorder } from "@/components/clinic/progress-recorder";
import { requireStaffPage } from "@/lib/auth";

export default async function ClinicProgressPage() {
  await requireStaffPage();
  return (
    <div>
      <PageHeader
        title="ثبت پیشرفت وزن و سایز"
        description="در هر مراجعه، وزن و سایز مشتری را ثبت کنید تا نمودار پیشرفت در اپ مشتری به‌روز شود."
      />
      <ProgressRecorder />
    </div>
  );
}

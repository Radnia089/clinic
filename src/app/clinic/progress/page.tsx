import { PageHeader } from "@/components/clinic/page-header";
import { ProgressRecorder } from "@/components/clinic/progress-recorder";
import { requireStaffPage } from "@/lib/auth";

export default async function ClinicProgressPage() {
  await requireStaffPage();
  return (
    <div>
      <PageHeader
        title="ثبت آنالیز بدن و سایز"
        description="همان جدول پرونده کاغذی: وزن، قد، BMI، چربی، عضله، چربی احشایی، سوخت‌وساز و سایز هر دو سمت بدن."
      />
      <ProgressRecorder />
    </div>
  );
}

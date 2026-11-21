import { NewVisitorForm } from "@/components/clinic/new-visitor-form";
import { PageHeader } from "@/components/clinic/page-header";
import { requireStaffPage } from "@/lib/auth";
import { toPublicPatient } from "@/lib/patient-public";
import { getAppData, listPatients } from "@/lib/store";
import type { VisitType } from "@/lib/types";

export default async function NewVisitorPage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    time?: string;
    type?: string;
    duration?: string;
    channel?: string;
    patient?: string;
  }>;
}) {
  await requireStaffPage();
  const params = await searchParams;
  const [data, patients] = await Promise.all([getAppData(), listPatients()]);
  const initialType: VisitType | undefined =
    params.type === "package" || params.type === "consultation"
      ? params.type
      : undefined;
  const parsedDuration = params.duration ? Number(params.duration) : undefined;
  const initialDuration =
    parsedDuration && Number.isFinite(parsedDuration) && parsedDuration > 0
      ? parsedDuration
      : undefined;
  const initialChannel = params.channel === "phone" ? "phone" : "clinic";

  return (
    <div>
      <PageHeader
        eyebrow="جریان پذیرش"
        title={initialChannel === "phone" ? "ثبت نوبت تلفنی" : "ثبت مراجعه‌کننده"}
        description={
          initialChannel === "phone"
            ? "نوبت تلفنی هم ویزیت است؛ مشتری قبلی را انتخاب کنید یا نام‌خانوادگی و موبایل را وارد کنید."
            : "مشتری قبلی را از فهرست انتخاب کنید، یا برای مشتری جدید اطلاعات و بازه زمانی را وارد کنید."
        }
      />
      <NewVisitorForm
        clinic={data.clinic}
        patients={patients.map(toPublicPatient)}
        initialDate={params.date}
        initialTime={params.time}
        initialType={initialType}
        initialDuration={initialDuration}
        initialChannel={initialChannel}
        initialPatientId={params.patient}
      />
    </div>
  );
}

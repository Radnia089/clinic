import { NewVisitorForm } from "@/components/clinic/new-visitor-form";
import { PageHeader } from "@/components/clinic/page-header";
import { getAppData } from "@/lib/store";
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
  }>;
}) {
  const params = await searchParams;
  const data = await getAppData();
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
            ? "نوبت تلفنی هم ویزیت است؛ نام‌خانوادگی و موبایل کافی است و ساعت اختیاری است."
            : "اطلاعات مشتری، نوع نوبت و بازه زمانی شناور (ربع‌ساعتی) را مشخص کنید."
        }
      />
      <NewVisitorForm
        clinic={data.clinic}
        initialDate={params.date}
        initialTime={params.time}
        initialType={initialType}
        initialDuration={initialDuration}
        initialChannel={initialChannel}
      />
    </div>
  );
}

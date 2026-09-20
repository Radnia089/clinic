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

  return (
    <div>
      <PageHeader
        eyebrow="جریان پذیرش"
        title="ثبت مراجعه‌کننده"
        description="اطلاعات مشتری، نوع نوبت و بازه زمانی شناور (ربع‌ساعتی) را مشخص کنید."
      />
      <NewVisitorForm
        clinic={data.clinic}
        initialDate={params.date}
        initialTime={params.time}
        initialType={initialType}
        initialDuration={initialDuration}
      />
    </div>
  );
}

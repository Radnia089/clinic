import { NewVisitorForm } from "@/components/clinic/new-visitor-form";
import { PageHeader } from "@/components/clinic/page-header";
import { getAppData } from "@/lib/store";
import type { VisitType } from "@/lib/types";

export default async function NewVisitorPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; time?: string; type?: string }>;
}) {
  const params = await searchParams;
  const data = await getAppData();
  const initialType: VisitType | undefined =
    params.type === "package" || params.type === "consultation"
      ? params.type
      : undefined;

  return (
    <div>
      <PageHeader
        eyebrow="جریان پذیرش"
        title="ثبت مراجعه‌کننده"
        description="اطلاعات مشتری، نوع نوبت (ویزیت یا پکیج/دستگاه) و ساعت را مشخص کنید."
      />
      <NewVisitorForm
        clinic={data.clinic}
        initialDate={params.date}
        initialTime={params.time}
        initialType={initialType}
      />
    </div>
  );
}

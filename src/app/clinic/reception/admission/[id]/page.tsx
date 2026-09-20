import { notFound } from "next/navigation";
import { AdmissionFormEditor } from "@/components/clinic/admission-form";
import { PageHeader } from "@/components/clinic/page-header";
import { getPatient, getVisit } from "@/lib/store";
import { patientFullName } from "@/lib/types";

export default async function AdmissionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const visit = await getVisit(id);
  if (!visit) notFound();
  const patient = await getPatient(visit.patientId);
  if (!patient) notFound();

  return (
    <div>
      <PageHeader
        title="فرم پذیرش تخصصی"
        description="اطلاعات اندازه‌گیری، سابقه پزشکی و هدف درمان را برای ادامه مسیر رژیم ثبت کنید."
      />
      <AdmissionFormEditor visit={visit} patientName={patientFullName(patient)} />
    </div>
  );
}

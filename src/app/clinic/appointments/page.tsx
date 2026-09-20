import { AppointmentsManager } from "@/components/clinic/appointments-manager";
import { PageHeader } from "@/components/clinic/page-header";
import { listAppointments } from "@/lib/store";

export default async function AppointmentsPage() {
  const appointments = await listAppointments();
  return (
    <div>
      <PageHeader
        title="نوبت‌های آنلاین"
        description="درخواست‌هایی که از اپ مشتری ارسال شده‌اند را اینجا بررسی و تأیید کنید."
      />
      <AppointmentsManager initialAppointments={appointments} />
    </div>
  );
}

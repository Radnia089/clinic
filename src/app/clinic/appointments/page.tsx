import { AppointmentsManager } from "@/components/clinic/appointments-manager";
import { PageHeader } from "@/components/clinic/page-header";
import { listAppointments } from "@/lib/store";
import { requireStaffPage } from "@/lib/auth";

export default async function AppointmentsPage() {
  await requireStaffPage();
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

import { ClinicShell } from "@/components/clinic/clinic-shell";
import { requireStaffPage } from "@/lib/auth";
import { ensureReminderScheduler } from "@/lib/reminder-scheduler";
import { getAppData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireStaffPage();
  ensureReminderScheduler();
  const data = await getAppData();
  return (
    <ClinicShell
      version={data.clinic.version}
      userName={user?.name}
      userRole={user?.role}
    >
      {children}
    </ClinicShell>
  );
}

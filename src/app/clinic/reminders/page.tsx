import { RemindersPanel } from "@/components/clinic/reminders-panel";
import { PageHeader } from "@/components/clinic/page-header";
import { getReminderDashboard } from "@/lib/reminders";
import { ensureReminderScheduler } from "@/lib/reminder-scheduler";

export default async function RemindersPage() {
  ensureReminderScheduler();
  const dashboard = await getReminderDashboard();

  return (
    <div>
      <PageHeader
        eyebrow="اطلاع‌رسانی"
        title="پیامک یادآوری و تبلیغاتی"
        description="یادآوری نوبت، پیامک انبوه و آفرهای تبلیغاتی برای مشتریان سیستم."
      />
      <RemindersPanel
        initialSettings={dashboard.settings}
        initialLogs={dashboard.logs}
        provider={dashboard.provider}
        hasKavenegarKey={dashboard.hasKavenegarKey}
        audience={dashboard.audience}
      />
    </div>
  );
}

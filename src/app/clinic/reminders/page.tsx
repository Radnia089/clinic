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
        title="پیامک یادآوری نوبت"
        description="صبح روز نوبت یا چند ساعت قبل، برای مشتری پیامک بفرستید. بدون کلید پنل، در حالت آزمایشی کار می‌کند."
      />
      <RemindersPanel
        initialSettings={dashboard.settings}
        initialLogs={dashboard.logs}
        provider={dashboard.provider}
        hasKavenegarKey={dashboard.hasKavenegarKey}
      />
    </div>
  );
}

/** زمان‌بند سبک داخل پروسس Node برای ارسال دوره‌ای یادآوری‌ها */

let started = false;

export function ensureReminderScheduler() {
  if (started) return;
  if (typeof setInterval === "undefined") return;
  started = true;

  const tick = async () => {
    try {
      const { processDueReminders } = await import("@/lib/reminders");
      await processDueReminders();
    } catch (error) {
      console.error("[reminder-scheduler]", error);
    }
  };

  // اولین اجرا بعد از کمی تأخیر، بعد هر ۶۰ ثانیه
  setTimeout(() => {
    void tick();
  }, 5_000);
  setInterval(() => {
    void tick();
  }, 60_000);
}

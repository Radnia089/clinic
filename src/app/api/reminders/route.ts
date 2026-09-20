import { NextResponse } from "next/server";
import {
  getReminderDashboard,
  processDueReminders,
  sendTestReminder,
} from "@/lib/reminders";
import { updateClinic } from "@/lib/store";
import { mergeReminderSettings } from "@/lib/sms";
import type { ReminderSettings } from "@/lib/types";
import { ensureReminderScheduler } from "@/lib/reminder-scheduler";

export async function GET() {
  ensureReminderScheduler();
  const dashboard = await getReminderDashboard();
  return NextResponse.json(dashboard);
}

export async function PATCH(request: Request) {
  const body = (await request.json()) as Partial<ReminderSettings>;
  const reminderSettings = mergeReminderSettings(body);
  const clinic = await updateClinic({ reminderSettings });
  return NextResponse.json({
    settings: clinic.reminderSettings,
  });
}

export async function POST(request: Request) {
  ensureReminderScheduler();
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    phone?: string;
    secret?: string;
  };

  const cronSecret = process.env.REMINDER_CRON_SECRET?.trim();
  if (
    cronSecret &&
    body.action === "run" &&
    body.secret &&
    body.secret !== cronSecret
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (body.action === "test") {
    if (!body.phone) {
      return NextResponse.json({ error: "missing_phone" }, { status: 400 });
    }
    const result = await sendTestReminder(body.phone);
    if (!result.ok && result.error === "invalid_phone") {
      return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
    }
    return NextResponse.json(result);
  }

  // پیش‌فرض: اجرای صف یادآوری‌های سررسیدشده
  const result = await processDueReminders();
  return NextResponse.json(result);
}

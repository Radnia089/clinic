import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  getReminderDashboard,
  processDueReminders,
  sendBulkPromo,
  sendTestReminder,
  type PromoAudience,
} from "@/lib/reminders";
import { updateClinic } from "@/lib/store";
import { mergeReminderSettings } from "@/lib/sms";
import type { ReminderSettings } from "@/lib/types";
import { ensureReminderScheduler } from "@/lib/reminder-scheduler";

async function requireStaff() {
  const user = await getCurrentUser();
  if (!user) return null;
  return user;
}

export async function GET() {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  ensureReminderScheduler();
  const dashboard = await getReminderDashboard();
  return NextResponse.json(dashboard);
}

export async function PATCH(request: Request) {
  if (!(await requireStaff())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
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
    message?: string;
    audience?: PromoAudience;
    patientIds?: string[];
  };

  const user = await requireStaff();
  const cronSecret = process.env.REMINDER_CRON_SECRET?.trim();
  const cronRun =
    body.action === "run" &&
    Boolean(cronSecret) &&
    body.secret === cronSecret;
  if (!user && !cronRun) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if ((body.action === "test" || body.action === "promo") && user?.role !== "management") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
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

  if (body.action === "promo") {
    const result = await sendBulkPromo({
      message: body.message ?? "",
      audience: body.audience ?? "all",
      patientIds: body.patientIds,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  }

  // پیش‌فرض: اجرای صف یادآوری‌های سررسیدشده
  const result = await processDueReminders();
  return NextResponse.json(result);
}

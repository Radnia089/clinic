import { formatJalaliDate } from "@/lib/jalali";
import { formatTimeFa } from "@/lib/schedule";
import { sendSms, getActiveSmsProvider } from "@/lib/sms-provider";
import {
  mergeReminderSettings,
  normalizeIranPhone,
  renderReminderTemplate,
  tehranDateTimeMs,
  tehranParts,
} from "@/lib/sms";
import {
  listSmsLogs,
  listPatients,
  listVisits,
  createSmsLog,
  hasSmsDedupe,
  getAppData,
} from "@/lib/store";
import {
  patientFullName,
  visitTypeLabel,
  type ReminderKind,
  type SmsLogEntry,
  type Visit,
} from "@/lib/types";

export type ReminderRunResult = {
  checked: number;
  sent: number;
  skipped: number;
  failed: number;
  provider: ReturnType<typeof getActiveSmsProvider>;
  items: SmsLogEntry[];
};

function buildBody(
  template: string,
  clinicName: string,
  patientName: string,
  visit: Visit
) {
  const date = formatJalaliDate(visit.visitDate, {
    withMonthName: true,
    withWeekday: true,
  });
  const time = visit.visitTime ? formatTimeFa(visit.visitTime) : "—";
  return renderReminderTemplate(template, {
    name: patientName,
    date,
    time,
    clinic: clinicName,
    type: visitTypeLabel(visit.visitType),
  });
}

function isDue(
  kind: ReminderKind,
  visit: Visit,
  settings: ReturnType<typeof mergeReminderSettings>,
  now = new Date()
) {
  if (!visit.visitTime) return false;
  if (visit.status === "cancelled") return false;

  const nowParts = tehranParts(now);
  const visitStartMs = tehranDateTimeMs(visit.visitDate, visit.visitTime);

  if (kind === "morning") {
    if (!settings.morningEnabled) return false;
    if (nowParts.isoDate !== visit.visitDate.slice(0, 10)) return false;
    if (nowParts.hour < settings.morningHour) return false;
    // بعد از شروع نوبت دیگر پیام صبح نفرست
    if (now.getTime() >= visitStartMs) return false;
    return true;
  }

  if (kind === "hours_before") {
    if (!settings.hoursBeforeEnabled) return false;
    const windowStart = visitStartMs - settings.hoursBefore * 60 * 60 * 1000;
    const t = now.getTime();
    return t >= windowStart && t < visitStartMs;
  }

  return false;
}

export async function processDueReminders(now = new Date()): Promise<ReminderRunResult> {
  const data = await getAppData();
  const settings = mergeReminderSettings(data.clinic.reminderSettings);
  const provider = getActiveSmsProvider();
  const result: ReminderRunResult = {
    checked: 0,
    sent: 0,
    skipped: 0,
    failed: 0,
    provider,
    items: [],
  };

  if (!settings.enabled) return result;

  const [visits, patients] = await Promise.all([listVisits(), listPatients()]);
  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));
  const kinds: ReminderKind[] = ["morning", "hours_before"];

  for (const visit of visits) {
    if (!visit.visitTime || visit.status === "cancelled") continue;
    const patient = patientMap[visit.patientId];
    if (!patient) continue;
    const phone = normalizeIranPhone(patient.phone);
    if (!phone) continue;

    result.checked += 1;
    const name = patientFullName(patient);

    for (const kind of kinds) {
      if (!isDue(kind, visit, settings, now)) continue;

      const dedupeKey = `${visit.id}:${kind}:${visit.visitDate.slice(0, 10)}`;
      if (await hasSmsDedupe(dedupeKey)) {
        result.skipped += 1;
        continue;
      }

      const body = buildBody(settings.template, data.clinic.name, name, visit);
      const send = await sendSms(phone, body);
      const entry = await createSmsLog({
        visitId: visit.id,
        patientId: patient.id,
        patientName: name,
        phone,
        kind,
        body,
        status: send.status,
        provider: send.provider,
        error: send.error,
        dedupeKey,
      });
      result.items.push(entry);
      if (send.ok) result.sent += 1;
      else result.failed += 1;
    }
  }

  return result;
}

export async function sendTestReminder(phoneRaw: string) {
  const data = await getAppData();
  const settings = mergeReminderSettings(data.clinic.reminderSettings);
  const phone = normalizeIranPhone(phoneRaw);
  if (!phone) {
    return { ok: false as const, error: "invalid_phone" };
  }

  const body = renderReminderTemplate(settings.template, {
    name: "مشتری آزمایشی",
    date: formatJalaliDate(new Date().toISOString(), {
      withMonthName: true,
      withWeekday: true,
    }),
    time: formatTimeFa("10:00"),
    clinic: data.clinic.name,
    type: "ویزیت",
  });

  const send = await sendSms(phone, body);
  const entry = await createSmsLog({
    visitId: "test",
    patientId: "test",
    patientName: "مشتری آزمایشی",
    phone,
    kind: "morning",
    body,
    status: send.status,
    provider: send.provider,
    error: send.error,
    dedupeKey: `test:${Date.now()}`,
  });

  return { ok: send.ok, entry, error: send.error };
}

export async function getReminderDashboard() {
  const data = await getAppData();
  const logs = await listSmsLogs();
  return {
    settings: mergeReminderSettings(data.clinic.reminderSettings),
    provider: getActiveSmsProvider(),
    logs,
    hasKavenegarKey: Boolean(process.env.KAVENEGAR_API_KEY?.trim()),
  };
}

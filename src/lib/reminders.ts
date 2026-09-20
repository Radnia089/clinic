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
    kind: "test",
    body,
    status: send.status,
    provider: send.provider,
    error: send.error,
    dedupeKey: `test:${Date.now()}`,
  });

  return { ok: send.ok, entry, error: send.error };
}

export type PromoAudience = "all" | "with_visits" | "selected";

export async function sendBulkPromo(input: {
  message: string;
  audience: PromoAudience;
  patientIds?: string[];
}) {
  const data = await getAppData();
  const raw = input.message?.trim() ?? "";
  if (!raw) {
    return { ok: false as const, error: "empty_message" as const };
  }
  if (raw.length > 500) {
    return { ok: false as const, error: "too_long" as const };
  }

  const [patients, visits] = await Promise.all([listPatients(), listVisits()]);
  const visitPatientIds = new Set(visits.map((v) => v.patientId));

  let targets = patients;
  if (input.audience === "with_visits") {
    targets = patients.filter((p) => visitPatientIds.has(p.id));
  } else if (input.audience === "selected") {
    const ids = new Set(input.patientIds ?? []);
    if (ids.size === 0) {
      return { ok: false as const, error: "no_selection" as const };
    }
    targets = patients.filter((p) => ids.has(p.id));
  }

  const campaignId = crypto.randomUUID();
  let sent = 0;
  let failed = 0;
  let skipped = 0;
  const items: SmsLogEntry[] = [];

  for (const patient of targets) {
    const phone = normalizeIranPhone(patient.phone);
    if (!phone) {
      skipped += 1;
      continue;
    }
    const name = patientFullName(patient);
    const body = renderReminderTemplate(raw, {
      name,
      clinic: data.clinic.name,
      phone,
    });
    const send = await sendSms(phone, body);
    const entry = await createSmsLog({
      visitId: `promo:${campaignId}`,
      patientId: patient.id,
      patientName: name,
      phone,
      kind: "promo",
      body,
      status: send.status,
      provider: send.provider,
      error: send.error,
      dedupeKey: `promo:${campaignId}:${patient.id}`,
    });
    items.push(entry);
    if (send.ok) sent += 1;
    else failed += 1;
  }

  return {
    ok: true as const,
    campaignId,
    total: targets.length,
    sent,
    failed,
    skipped,
    provider: getActiveSmsProvider(),
    items,
  };
}

export async function getReminderDashboard() {
  const data = await getAppData();
  const [logs, patients, visits] = await Promise.all([
    listSmsLogs(),
    listPatients(),
    listVisits(),
  ]);
  const visitPatientIds = new Set(visits.map((v) => v.patientId));
  const withVisits = patients.filter((p) => visitPatientIds.has(p.id)).length;
  const validPhones = patients.filter((p) => normalizeIranPhone(p.phone)).length;

  return {
    settings: mergeReminderSettings(data.clinic.reminderSettings),
    provider: getActiveSmsProvider(),
    logs,
    hasKavenegarKey: Boolean(process.env.KAVENEGAR_API_KEY?.trim()),
    audience: {
      all: patients.length,
      withVisits,
      validPhones,
      patients: patients.map((p) => ({
        id: p.id,
        name: patientFullName(p),
        phone: p.phone,
        hasVisit: visitPatientIds.has(p.id),
      })),
    },
  };
}

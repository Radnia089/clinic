import { formatJalaliDate } from "@/lib/jalali";
import {
  DEFAULT_MESSENGER_NOTIFY,
  type AppointmentRequest,
  type MessengerNotifySettings,
  type OnlineConsultRequest,
} from "@/lib/types";

const CHAT_ID = /^(@[A-Za-z][A-Za-z0-9_]{3,31}|-?\d{5,20})$/;
const TELEGRAM_ENDPOINT = "https://api.telegram.org/bot";
const BALE_ENDPOINT = "https://tapi.bale.ai/bot";

export type MessengerTargetResult = {
  channel: "telegram" | "bale";
  chatId: string;
  ok: boolean;
  error?: string;
};

function asBool(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function parseChatIds(value: unknown) {
  const raw = Array.isArray(value) ? value.map(String).join("\n") : String(value ?? "");
  const ids: string[] = [];
  const rejected: string[] = [];
  for (const part of raw.split(/[\s,،;]+/)) {
    const id = part.trim();
    if (!id) continue;
    if (!CHAT_ID.test(id) || ids.includes(id)) {
      if (!ids.includes(id)) rejected.push(id);
      continue;
    }
    ids.push(id);
    if (ids.length >= 20) break;
  }
  return { ids, rejected };
}

export function mergeMessengerSettings(
  raw?: Partial<MessengerNotifySettings> | null
): MessengerNotifySettings {
  const base = DEFAULT_MESSENGER_NOTIFY;
  return {
    enabled: asBool(raw?.enabled, base.enabled),
    appointments: asBool(raw?.appointments, base.appointments),
    consults: asBool(raw?.consults, base.consults),
    telegram: {
      enabled: asBool(raw?.telegram?.enabled, base.telegram.enabled),
      chatIds: parseChatIds(raw?.telegram?.chatIds).ids,
    },
    bale: {
      enabled: asBool(raw?.bale?.enabled, base.bale.enabled),
      chatIds: parseChatIds(raw?.bale?.chatIds).ids,
    },
  };
}

export function messengerTokens() {
  return {
    telegram: Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim()),
    bale: Boolean(process.env.BALE_BOT_TOKEN?.trim()),
  };
}

function line(label: string, value?: string | number | null) {
  if (value == null || value === "") return "";
  return `${label}: ${value}`;
}

export function appointmentNotice(clinicName: string, item: AppointmentRequest) {
  return [
    `نوبت جدید در ${clinicName}`,
    line("نام", item.name),
    line("موبایل", item.phone),
    line("خدمت", item.service),
    line("تاریخ", item.preferredDate ? formatJalaliDate(item.preferredDate) : ""),
    line("ساعت", item.preferredTime),
    line("از", item.channel === "phone" ? "تلفن" : "سایت"),
    line("توضیح", item.note),
  ]
    .filter(Boolean)
    .join("\n");
}

export function consultNotice(clinicName: string, item: OnlineConsultRequest) {
  const gender = item.gender === "male" ? "مرد" : item.gender === "female" ? "زن" : "";
  return [
    `درخواست مشاوره آنلاین در ${clinicName}`,
    line("نام", item.name),
    line("موبایل", item.phone),
    line("سن", item.age),
    line("جنسیت", gender),
    line("قد", item.heightCm ? `${item.heightCm} سانتی` : ""),
    line("وزن", item.weightKg ? `${item.weightKg} کیلو` : ""),
    line("تاریخ پیشنهادی", item.preferredDate ? formatJalaliDate(item.preferredDate) : ""),
    line("توضیح", item.note),
  ]
    .filter(Boolean)
    .join("\n");
}

async function postMessage(endpoint: string, token: string, chatId: string, text: string) {
  const response = await fetch(`${endpoint}${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
    signal: AbortSignal.timeout(8000),
  });
  const data = (await response.json().catch(() => ({}))) as { ok?: boolean; description?: string };
  if (!response.ok || data.ok === false) {
    return { ok: false, error: data.description || `وضعیت ${response.status}` };
  }
  return { ok: true };
}

async function sendChannel(
  channel: "telegram" | "bale",
  endpoint: string,
  token: string | undefined,
  chatIds: string[],
  text: string
) {
  if (!token?.trim()) {
    return chatIds.map((chatId) => ({
      channel,
      chatId,
      ok: false,
      error: "توکن ربات روی سرور تنظیم نشده است.",
    }));
  }
  const results: MessengerTargetResult[] = [];
  for (const chatId of chatIds) {
    try {
      const sent = await postMessage(endpoint, token.trim(), chatId, text);
      results.push({ channel, chatId, ...sent });
    } catch {
      results.push({ channel, chatId, ok: false, error: "ارتباط با پیام‌رسان برقرار نشد." });
    }
  }
  return results;
}

export async function deliverMessengerNotice(
  settings: MessengerNotifySettings,
  text: string
) {
  const jobs: Array<Promise<MessengerTargetResult[]>> = [];
  if (settings.telegram.enabled && settings.telegram.chatIds.length) {
    jobs.push(
      sendChannel(
        "telegram",
        TELEGRAM_ENDPOINT,
        process.env.TELEGRAM_BOT_TOKEN,
        settings.telegram.chatIds,
        text
      )
    );
  }
  if (settings.bale.enabled && settings.bale.chatIds.length) {
    jobs.push(
      sendChannel("bale", BALE_ENDPOINT, process.env.BALE_BOT_TOKEN, settings.bale.chatIds, text)
    );
  }
  const results = (await Promise.all(jobs)).flat();
  return results;
}

async function notify(kind: "appointments" | "consults", textFor: (clinicName: string) => string) {
  try {
    const { getClinicProfile } = await import("@/lib/store");
    const clinic = await getClinicProfile();
    const settings = clinic.messengerNotify;
    if (!settings.enabled || !settings[kind]) return [];
    const results = await deliverMessengerNotice(settings, textFor(clinic.fullName || clinic.name));
    const failed = results.filter((item) => !item.ok).length;
    if (results.length) {
      console.info(`[messenger] ${kind}: ${results.length - failed} sent, ${failed} failed`);
    }
    return results;
  } catch (error) {
    console.error("[messenger]", error instanceof Error ? error.message : "failed");
    return [];
  }
}

export function notifyNewAppointment(item: AppointmentRequest) {
  return notify("appointments", (clinicName) => appointmentNotice(clinicName, item));
}

export function notifyNewConsult(item: OnlineConsultRequest) {
  return notify("consults", (clinicName) => consultNotice(clinicName, item));
}

export async function sendMessengerTest() {
  const { getClinicProfile } = await import("@/lib/store");
  const clinic = await getClinicProfile();
  const text = `پیام آزمایشی ${clinic.fullName || clinic.name}.\nاگر این متن را می‌بینید، اطلاع‌رسانی به این شناسه وصل است.`;
  return deliverMessengerNotice(clinic.messengerNotify, text);
}

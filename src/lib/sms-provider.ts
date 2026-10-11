import { normalizeIranPhone } from "@/lib/sms";

export type SmsProviderName = "mock" | "kavenegar" | "android";

export type SendSmsResult = {
  ok: boolean;
  provider: SmsProviderName;
  status: "sent" | "mock" | "failed";
  error?: string;
  providerMessageId?: string;
};

function hasAndroidGatewayConfig() {
  return Boolean(
    process.env.SMS_ANDROID_USERNAME?.trim() &&
      process.env.SMS_ANDROID_PASSWORD?.trim()
  );
}

function hasKavenegarConfig() {
  return Boolean(process.env.KAVENEGAR_API_KEY?.trim());
}

/** تبدیل 09xxxxxxxxx به E.164 (+98…) برای SMS Gateway */
export function toE164Iran(phone: string): string | null {
  const normalized = normalizeIranPhone(phone);
  if (!normalized) return null;
  return `+98${normalized.slice(1)}`;
}

export function getActiveSmsProvider(): SmsProviderName {
  const forced = process.env.SMS_PROVIDER?.trim().toLowerCase();
  if (forced === "mock" || forced === "kavenegar" || forced === "android") {
    if (forced === "android" && !hasAndroidGatewayConfig()) return "mock";
    if (forced === "kavenegar" && !hasKavenegarConfig()) return "mock";
    return forced;
  }
  // اولویت: گوشی اندروید → کاوه‌نگار → آزمایشی
  if (hasAndroidGatewayConfig()) return "android";
  if (hasKavenegarConfig()) return "kavenegar";
  return "mock";
}

export function getSmsProviderLabel(provider: SmsProviderName) {
  switch (provider) {
    case "android":
      return "گوشی اندروید / SMS Gateway";
    case "kavenegar":
      return "کاوه‌نگار";
    default:
      return "آزمایشی / Mock";
  }
}

export async function sendSms(
  phone: string,
  message: string
): Promise<SendSmsResult> {
  const provider = getActiveSmsProvider();
  if (provider === "android") {
    return sendViaAndroidGateway(phone, message);
  }
  if (provider === "kavenegar") {
    return sendViaKavenegar(phone, message);
  }
  return sendViaMock(phone, message);
}

async function sendViaMock(
  phone: string,
  message: string
): Promise<SendSmsResult> {
  console.info(`[sms:mock] → ${phone}: ${message}`);
  return { ok: true, provider: "mock", status: "mock" };
}

async function sendViaAndroidGateway(
  phone: string,
  message: string
): Promise<SendSmsResult> {
  const username = process.env.SMS_ANDROID_USERNAME!.trim();
  const password = process.env.SMS_ANDROID_PASSWORD!.trim();
  const baseUrl = (
    process.env.SMS_ANDROID_BASE_URL?.trim() || "https://api.sms-gate.app"
  ).replace(/\/+$/, "");
  const deviceId = process.env.SMS_ANDROID_DEVICE_ID?.trim() || undefined;
  const simRaw = process.env.SMS_ANDROID_SIM_NUMBER?.trim();
  const simNumber = simRaw ? Number(simRaw) : undefined;

  const e164 = toE164Iran(phone);
  if (!e164) {
    return {
      ok: false,
      provider: "android",
      status: "failed",
      error: "invalid_phone",
    };
  }

  // Cloud: /3rdparty/v1 — Private: /api/3rdparty/v1
  const isPrivate =
    !baseUrl.includes("api.sms-gate.app") &&
    !baseUrl.endsWith("/3rdparty/v1") &&
    !baseUrl.includes("/api/3rdparty");
  const apiRoot = baseUrl.includes("/3rdparty")
    ? baseUrl
    : isPrivate
      ? `${baseUrl}/api/3rdparty/v1`
      : `${baseUrl}/3rdparty/v1`;

  const url = `${apiRoot}/messages?skipPhoneValidation=true`;
  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  const payload: Record<string, unknown> = {
    phoneNumbers: [e164],
    textMessage: { text: message },
    withDeliveryReport: true,
  };
  if (deviceId) payload.deviceId = deviceId;
  if (simNumber && Number.isFinite(simNumber) && simNumber >= 1) {
    payload.simNumber = Math.round(simNumber);
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = (await res.json().catch(() => ({}))) as {
      id?: string;
      message?: string;
      error?: string;
      detail?: string;
    };

    // 202 Accepted = queued on phone
    if (res.status === 202 || (res.ok && data.id)) {
      return {
        ok: true,
        provider: "android",
        status: "sent",
        providerMessageId: data.id,
      };
    }

    return {
      ok: false,
      provider: "android",
      status: "failed",
      error:
        data.message ||
        data.error ||
        data.detail ||
        `android_gateway_http_${res.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      provider: "android",
      status: "failed",
      error:
        error instanceof Error ? error.message : "android_gateway_network_error",
    };
  }
}

async function sendViaKavenegar(
  phone: string,
  message: string
): Promise<SendSmsResult> {
  const apiKey = process.env.KAVENEGAR_API_KEY!.trim();
  const sender = process.env.KAVENEGAR_SENDER?.trim() || undefined;
  const url = `https://api.kavenegar.com/v1/${apiKey}/sms/send.json`;

  try {
    const body = new URLSearchParams({
      receptor: phone,
      message,
    });
    if (sender) body.set("sender", sender);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const data = (await res.json()) as {
      return?: { status?: number; message?: string };
      entries?: Array<{ messageid?: number }>;
    };

    const status = data.return?.status ?? 0;
    if (!res.ok || status !== 200) {
      return {
        ok: false,
        provider: "kavenegar",
        status: "failed",
        error: data.return?.message || `kavenegar_status_${status}`,
      };
    }

    return {
      ok: true,
      provider: "kavenegar",
      status: "sent",
      providerMessageId: data.entries?.[0]?.messageid
        ? String(data.entries[0].messageid)
        : undefined,
    };
  } catch (error) {
    return {
      ok: false,
      provider: "kavenegar",
      status: "failed",
      error: error instanceof Error ? error.message : "kavenegar_network_error",
    };
  }
}

export type SmsProviderName = "mock" | "kavenegar";

export type SendSmsResult = {
  ok: boolean;
  provider: SmsProviderName;
  status: "sent" | "mock" | "failed";
  error?: string;
  providerMessageId?: string;
};

export function getActiveSmsProvider(): SmsProviderName {
  return process.env.KAVENEGAR_API_KEY?.trim() ? "kavenegar" : "mock";
}

export async function sendSms(phone: string, message: string): Promise<SendSmsResult> {
  const provider = getActiveSmsProvider();
  if (provider === "kavenegar") {
    return sendViaKavenegar(phone, message);
  }
  return sendViaMock(phone, message);
}

async function sendViaMock(phone: string, message: string): Promise<SendSmsResult> {
  console.info(`[sms:mock] → ${phone}: ${message}`);
  return { ok: true, provider: "mock", status: "mock" };
}

async function sendViaKavenegar(phone: string, message: string): Promise<SendSmsResult> {
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

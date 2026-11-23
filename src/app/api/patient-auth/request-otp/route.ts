import { NextResponse } from "next/server";
import { normalizeIntegerInput } from "@/lib/digits";
import { clearPatientOtp, issuePatientOtp } from "@/lib/patient-otp";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getActiveSmsProvider, sendSms } from "@/lib/sms-provider";

/** کد یک‌بارمصرف پیامک. بدون پیامک واقعی کد صادر نمی‌شود. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizeIntegerInput(String(body.phone ?? ""));
  if (!/^09\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const ip = clientIp(request);
  const byPhone = rateLimit(`otp:${phone}`, 3, 15 * 60 * 1000);
  const byIp = rateLimit(`otp-ip:${ip}`, 10, 60 * 60 * 1000);
  if (!byPhone.ok || !byIp.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  if (getActiveSmsProvider() === "mock") {
    return NextResponse.json({ error: "otp_unavailable" }, { status: 503 });
  }

  const code = await issuePatientOtp(phone);
  const sent = await sendSms(phone, `کد کلینیک تندیس: ${code}`);
  if (!sent.ok || sent.status !== "sent") {
    await clearPatientOtp(phone);
    return NextResponse.json({ error: "otp_unavailable" }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}

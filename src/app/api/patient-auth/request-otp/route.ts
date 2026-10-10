import { NextResponse } from "next/server";
import { normalizeIntegerInput } from "@/lib/digits";
import { patientHasPassword } from "@/lib/patient-password";
import { issuePatientOtp } from "@/lib/patient-otp";
import { patientHasRegisteredInfo } from "@/lib/patient-profile";
import { createSmsLog, findPatientByPhone } from "@/lib/store";
import { getActiveSmsProvider, sendSms } from "@/lib/sms-provider";

/**
 * OTP فقط برای فراموشی رمز (نه ورود روزانه)
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizeIntegerInput(String(body.phone ?? ""));
  const purpose = String(body.purpose ?? "reset").trim();
  if (!/^09\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }
  if (purpose !== "reset") {
    return NextResponse.json({ error: "otp_disabled_for_login" }, { status: 400 });
  }

  const existing = await findPatientByPhone(phone);
  if (!existing || !patientHasPassword(existing)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const alreadyRegistered = patientHasRegisteredInfo(existing);
  const code = await issuePatientOtp(phone);
  const message = `کد بازیابی رمز اپ تندیس: ${code}\nاین کد تا ۵ دقیقه معتبر است.`;
  const sendResult = await sendSms(phone, message);
  await createSmsLog({
    patientName:
      `${existing.firstName} ${existing.lastName}`.trim() || "مشتری",
    phone,
    kind: "otp",
    body: message,
    status: sendResult.status,
    provider: getActiveSmsProvider(),
    error: sendResult.error,
    dedupeKey: `otp-reset:${phone}:${Date.now()}`,
  });

  if (!sendResult.ok) {
    return NextResponse.json({ error: "sms_failed" }, { status: 502 });
  }

  const isMock = getActiveSmsProvider() === "mock";
  return NextResponse.json({
    ok: true,
    phone,
    purpose: "reset",
    exists: true,
    alreadyRegistered,
    /** فقط در حالت mock برای تست محلی */
    devCode: isMock ? code : undefined,
  });
}

import { NextResponse } from "next/server";
import { normalizeIntegerInput } from "@/lib/digits";
import { issuePatientOtp } from "@/lib/patient-otp";
import { patientHasRegisteredInfo } from "@/lib/patient-profile";
import { createSmsLog, findPatientByPhone } from "@/lib/store";
import { getActiveSmsProvider, sendSms } from "@/lib/sms-provider";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizeIntegerInput(String(body.phone ?? ""));
  if (!/^09\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const existing = await findPatientByPhone(phone);
  const alreadyRegistered = patientHasRegisteredInfo(existing);

  const code = await issuePatientOtp(phone);
  const message = `کد ورود اپ تندیس: ${code}\nاین کد تا ۵ دقیقه معتبر است.`;
  const sendResult = await sendSms(phone, message);
  await createSmsLog({
    patientName: existing
      ? `${existing.firstName} ${existing.lastName}`.trim() || "مشتری"
      : "ثبت‌نام اپ",
    phone,
    kind: "otp",
    body: message,
    status: sendResult.status,
    provider: getActiveSmsProvider(),
    error: sendResult.error,
    dedupeKey: `otp:${phone}:${Date.now()}`,
  });

  if (!sendResult.ok) {
    return NextResponse.json({ error: "sms_failed" }, { status: 502 });
  }

  const isMock = getActiveSmsProvider() === "mock";
  return NextResponse.json({
    ok: true,
    phone,
    exists: Boolean(existing),
    alreadyRegistered,
    /** فقط در حالت mock برای تست محلی */
    devCode: isMock ? code : undefined,
  });
}

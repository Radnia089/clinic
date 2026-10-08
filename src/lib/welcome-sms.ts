import { createSmsLog, hasSmsDedupe, updatePatient } from "@/lib/store";
import { getActiveSmsProvider, sendSms } from "@/lib/sms-provider";
import { patientFullName, type Patient } from "@/lib/types";

function appBaseUrl(requestUrl?: string) {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (requestUrl) {
    try {
      return new URL(requestUrl).origin;
    } catch {
      /* ignore */
    }
  }
  return "http://127.0.0.1:3847";
}

/** پیامک خوشامد + لینک اپ بعد از تشکیل پرونده حضوری */
export async function sendWelcomeSms(patient: Patient, requestUrl?: string) {
  const dedupeKey = `welcome:${patient.id}`;
  if (await hasSmsDedupe(dedupeKey)) {
    return { skipped: true as const };
  }

  const link = `${appBaseUrl(requestUrl)}/patient/login`;
  const name =
    patientFullName(patient).trim() ||
    patient.firstName ||
    "دوست عزیز";
  const body =
    `${name} عزیز، به کلینیک تخصصی لاغری تندیس خوش آمدید. ` +
    `پرونده شما تشکیل شد. برای ورود به اپ مشتری از این لینک استفاده کنید: ${link}`;

  const sendResult = await sendSms(patient.phone, body);
  await createSmsLog({
    patientId: patient.id,
    patientName: name,
    phone: patient.phone,
    kind: "welcome",
    body,
    status: sendResult.status,
    provider: getActiveSmsProvider(),
    error: sendResult.error,
    dedupeKey,
  });

  if (sendResult.ok) {
    await updatePatient(patient.id, {
      welcomeSmsSentAt: new Date().toISOString(),
    });
  }

  return { skipped: false as const, sendResult };
}

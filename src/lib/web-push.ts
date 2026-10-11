import webpush from "web-push";
import { prisma } from "@/lib/db";
import { ensureDbReady } from "@/lib/store";

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  icon?: string;
};

function vapidConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() &&
      process.env.VAPID_PRIVATE_KEY?.trim()
  );
}

export function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || "";
}

function configureWebPush() {
  if (!vapidConfigured()) return false;
  const subject =
    process.env.VAPID_SUBJECT?.trim() || "mailto:info@tandisclinicyazd.ir";
  webpush.setVapidDetails(
    subject,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!.trim(),
    process.env.VAPID_PRIVATE_KEY!.trim()
  );
  return true;
}

export async function savePushSubscription(input: {
  patientId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}) {
  await ensureDbReady();
  return prisma.pushSubscription.upsert({
    where: { endpoint: input.endpoint },
    create: {
      patientId: input.patientId,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      userAgent: input.userAgent ?? null,
    },
    update: {
      patientId: input.patientId,
      p256dh: input.p256dh,
      auth: input.auth,
      userAgent: input.userAgent ?? null,
    },
  });
}

export async function removePushSubscription(endpoint: string) {
  await ensureDbReady();
  try {
    await prisma.pushSubscription.delete({ where: { endpoint } });
    return true;
  } catch {
    return false;
  }
}

export async function removePushSubscriptionsForPatient(patientId: string) {
  await ensureDbReady();
  await prisma.pushSubscription.deleteMany({ where: { patientId } });
}

async function sendOne(
  sub: { id: string; endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
) {
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        url: payload.url ?? "/patient/inbox",
        icon: payload.icon ?? "/icon-192.png",
      })
    );
    return { ok: true as const };
  } catch (error: unknown) {
    const statusCode =
      typeof error === "object" &&
      error &&
      "statusCode" in error &&
      typeof (error as { statusCode?: number }).statusCode === "number"
        ? (error as { statusCode: number }).statusCode
        : 0;
    if (statusCode === 404 || statusCode === 410) {
      await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
    }
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "push_failed",
    };
  }
}

/** ارسال نوتیف به یک یا چند مشتری (یا همه مشترکین) */
export async function sendPushToPatients(
  patientIds: string[] | "all",
  payload: PushPayload
) {
  if (!configureWebPush()) {
    return { sent: 0, failed: 0, skipped: true as const };
  }
  await ensureDbReady();

  const rows =
    patientIds === "all"
      ? await prisma.pushSubscription.findMany()
      : await prisma.pushSubscription.findMany({
          where: { patientId: { in: patientIds } },
        });

  let sent = 0;
  let failed = 0;
  for (const row of rows) {
    const result = await sendOne(row, payload);
    if (result.ok) sent += 1;
    else failed += 1;
  }
  return { sent, failed, skipped: false as const };
}

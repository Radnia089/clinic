import { NextResponse } from "next/server";
import { getCurrentPatient } from "@/lib/patient-auth";
import {
  getVapidPublicKey,
  removePushSubscription,
  savePushSubscription,
} from "@/lib/web-push";

export async function GET() {
  const patient = await getCurrentPatient();
  if (!patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const publicKey = getVapidPublicKey();
  return NextResponse.json({
    configured: Boolean(publicKey),
    publicKey,
  });
}

export async function POST(request: Request) {
  const patient = await getCurrentPatient();
  if (!patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!getVapidPublicKey()) {
    return NextResponse.json({ error: "push_not_configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const endpoint = String(body.endpoint ?? "").trim();
  const p256dh = String(body.keys?.p256dh ?? body.p256dh ?? "").trim();
  const auth = String(body.keys?.auth ?? body.auth ?? "").trim();
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  await savePushSubscription({
    patientId: patient.id,
    endpoint,
    p256dh,
    auth,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const patient = await getCurrentPatient();
  if (!patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const endpoint = String(body.endpoint ?? "").trim();
  if (!endpoint) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }
  await removePushSubscription(endpoint);
  return NextResponse.json({ ok: true });
}

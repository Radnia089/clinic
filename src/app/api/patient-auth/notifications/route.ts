import { NextResponse } from "next/server";
import { getCurrentPatient } from "@/lib/patient-auth";
import {
  countUnreadInboxForPatient,
  listInboxForPatient,
  markAllInboxReadForPatient,
  markInboxMessageRead,
} from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const patient = await getCurrentPatient();
  if (!patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [messages, unreadCount] = await Promise.all([
    listInboxForPatient(patient.id),
    countUnreadInboxForPatient(patient.id),
  ]);
  return NextResponse.json(
    { messages, unreadCount },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export async function PATCH(request: Request) {
  const patient = await getCurrentPatient();
  if (!patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));

  if (body.markAll === true) {
    await markAllInboxReadForPatient(patient.id);
    const unreadCount = await countUnreadInboxForPatient(patient.id);
    return NextResponse.json({ ok: true, unreadCount });
  }

  const messageId = String(body.messageId ?? "").trim();
  if (!messageId) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }
  const ok = await markInboxMessageRead(patient.id, messageId);
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const unreadCount = await countUnreadInboxForPatient(patient.id);
  return NextResponse.json({ ok: true, unreadCount });
}

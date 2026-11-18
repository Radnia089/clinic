import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  mergeMessengerSettings,
  messengerTokens,
  parseChatIds,
  sendMessengerTest,
} from "@/lib/messenger";
import { getClinicProfile, updateClinic } from "@/lib/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function forbidden() {
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}

async function requireManager() {
  const user = await getCurrentUser();
  if (!user || user.role !== "management") return forbidden();
  return null;
}

export async function GET() {
  const denied = await requireManager();
  if (denied) return denied;
  const clinic = await getClinicProfile();
  return NextResponse.json({ settings: clinic.messengerNotify, tokens: messengerTokens() });
}

export async function PATCH(request: Request) {
  const denied = await requireManager();
  if (denied) return denied;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const telegram = parseChatIds(body.telegramIds);
  const bale = parseChatIds(body.baleIds);
  if (telegram.rejected.length || bale.rejected.length) {
    return NextResponse.json(
      { error: "invalid_ids", telegram: telegram.rejected, bale: bale.rejected },
      { status: 400 }
    );
  }
  const clinic = await updateClinic({
    messengerNotify: mergeMessengerSettings({
      enabled: Boolean(body.enabled),
      appointments: Boolean(body.appointments),
      consults: Boolean(body.consults),
      telegram: { enabled: Boolean(body.telegramEnabled), chatIds: telegram.ids },
      bale: { enabled: Boolean(body.baleEnabled), chatIds: bale.ids },
    }),
  });
  return NextResponse.json({ settings: clinic.messengerNotify, tokens: messengerTokens() });
}

export async function POST() {
  const denied = await requireManager();
  if (denied) return denied;
  const results = await sendMessengerTest();
  if (!results.length) return NextResponse.json({ error: "no_targets" }, { status: 400 });
  return NextResponse.json({ results });
}

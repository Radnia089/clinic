import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  normalizeIntegerInput,
  parseNormalizedNumber,
} from "@/lib/digits";
import { formatJalaliDate } from "@/lib/jalali";
import {
  createOnlineConsult,
  createSmsLog,
  getAppData,
  listOnlineConsults,
  updateOnlineConsult,
} from "@/lib/store";
import { sendSms, getActiveSmsProvider } from "@/lib/sms-provider";
import type { Gender, OnlineConsultStatus } from "@/lib/types";

async function requireClinicUser() {
  return getCurrentUser();
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = parseNormalizedNumber(String(value));
  return Number.isFinite(n) ? n : undefined;
}

export async function GET() {
  const user = await requireClinicUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const items = await listOnlineConsults();
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const phone = normalizeIntegerInput(String(body.phone ?? ""));
  const note = String(body.note ?? "").trim();
  const preferredDate = body.preferredDate
    ? String(body.preferredDate)
    : undefined;
  const age = parseOptionalNumber(body.age);
  const heightCm = parseOptionalNumber(body.heightCm);
  const weightKg = parseOptionalNumber(body.weightKg);
  const waistCm = parseOptionalNumber(body.waistCm);
  const hipCm = parseOptionalNumber(body.hipCm);
  const genderRaw = String(body.gender ?? "").trim();
  const gender = (["female", "male", "other"] as Gender[]).includes(
    genderRaw as Gender
  )
    ? (genderRaw as Gender)
    : undefined;

  if (name.length < 2 || !/^09\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const item = await createOnlineConsult({
    name,
    phone,
    age: age && age > 0 ? Math.round(age) : undefined,
    gender,
    heightCm: heightCm && heightCm > 0 ? heightCm : undefined,
    weightKg: weightKg && weightKg > 0 ? weightKg : undefined,
    waistCm: waistCm && waistCm > 0 ? waistCm : undefined,
    hipCm: hipCm && hipCm > 0 ? hipCm : undefined,
    note: note || undefined,
    preferredDate,
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(request: Request) {
  const user = await requireClinicUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const id = String(body.id ?? "");
  const action = String(body.action ?? "");
  if (!id || !action) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const items = await listOnlineConsults();
  const current = items.find((item) => item.id === id);
  if (!current) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (action === "schedule") {
    const scheduledDate = String(body.scheduledDate ?? "").trim();
    const scheduledTime = String(body.scheduledTime ?? "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate) || !/^\d{2}:\d{2}$/.test(scheduledTime)) {
      return NextResponse.json({ error: "invalid_schedule" }, { status: 400 });
    }

    const { clinic } = await getAppData();
    const dateFa = formatJalaliDate(scheduledDate, {
      withMonthName: true,
      withWeekday: true,
    });
    const smsBody = `${current.name} عزیز، مشاوره آنلاین شما در ${clinic.name} برای ${dateFa} ساعت ${scheduledTime} رزرو شد. در این ساعت با شما تماس گرفته می‌شود.`;

    const sendResult = await sendSms(current.phone, smsBody);
    const now = new Date().toISOString();
    await createSmsLog({
      onlineConsultId: current.id,
      patientName: current.name,
      phone: current.phone,
      kind: "online_consult",
      body: smsBody,
      status: sendResult.status,
      provider: sendResult.provider ?? getActiveSmsProvider(),
      error: sendResult.error,
      dedupeKey: `online_consult:${current.id}:${scheduledDate}:${scheduledTime}`,
    });

    const item = await updateOnlineConsult(id, {
      status: "scheduled",
      scheduledDate,
      scheduledTime,
      smsNotifiedAt: sendResult.ok ? now : current.smsNotifiedAt,
    });

    return NextResponse.json({
      item,
      sms: {
        ok: sendResult.ok,
        status: sendResult.status,
        provider: sendResult.provider,
        error: sendResult.error,
      },
    });
  }

  if (action === "start_call") {
    const item = await updateOnlineConsult(id, {
      callStartedAt: new Date().toISOString(),
      status: current.status === "new" ? "scheduled" : current.status,
    });
    return NextResponse.json({ item });
  }

  if (action === "set_status") {
    const status = String(body.status ?? "") as OnlineConsultStatus;
    if (!["new", "scheduled", "completed", "cancelled"].includes(status)) {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }
    const item = await updateOnlineConsult(id, { status });
    return NextResponse.json({ item });
  }

  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}

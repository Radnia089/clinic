import { NextResponse } from "next/server";
import {
  createAppointment,
  listAppointments,
  listAppointmentsByPhone,
  updateAppointment,
} from "@/lib/store";
import { isValidIranMobile, normalizeIntegerInput } from "@/lib/digits";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = normalizeIntegerInput(searchParams.get("phone") ?? "");
  if (phone) {
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
    }
    const appointments = await listAppointmentsByPhone(phone);
    return NextResponse.json({ appointments });
  }
  const appointments = await listAppointments();
  return NextResponse.json({ appointments });
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const phone = normalizeIntegerInput(String(body.phone ?? ""));
  const service = String(body.service ?? "").trim();
  const preferredDate = body.preferredDate
    ? String(body.preferredDate)
    : undefined;
  const preferredTime = body.preferredTime
    ? String(body.preferredTime).trim()
    : undefined;
  const note = body.note ? String(body.note).trim() : undefined;
  const channel =
    body.channel === "phone" ? ("phone" as const) : ("clinic" as const);

  if (name.length < 2) {
    return NextResponse.json({ error: "invalid_name" }, { status: 400 });
  }
  if (!isValidIranMobile(phone)) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }
  if (!service) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const appointment = await createAppointment({
    name,
    phone,
    service,
    preferredDate,
    preferredTime:
      preferredTime && /^\d{2}:\d{2}$/.test(preferredTime)
        ? preferredTime
        : undefined,
    note,
    channel,
  });

  return NextResponse.json({ appointment }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const id = String(body.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const appointment = await updateAppointment(id, {
    status: body.status,
  });

  if (!appointment) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ appointment });
}

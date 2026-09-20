import { NextResponse } from "next/server";
import { createAppointment, listAppointments, updateAppointment } from "@/lib/store";
import { normalizeIntegerInput } from "@/lib/digits";

export async function GET() {
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
  const note = body.note ? String(body.note).trim() : undefined;

  if (name.length < 2 || !/^09\d{9}$/.test(phone) || !service) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const appointment = await createAppointment({
    name,
    phone,
    service,
    preferredDate,
    note,
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

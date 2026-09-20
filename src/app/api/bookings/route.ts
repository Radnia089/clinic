import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

type BookingPayload = {
  name?: string;
  phone?: string;
  service?: string;
  note?: string;
};

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "bookings.json");

export async function POST(request: Request) {
  let body: BookingPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = body.name?.trim() ?? "";
  const phone = (body.phone ?? "").replace(/\s|-/g, "");
  const service = body.service?.trim() ?? "";
  const note = body.note?.trim() ?? "";

  if (name.length < 2 || !/^09\d{9}$/.test(phone) || !service) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const booking = {
    id: crypto.randomUUID(),
    name,
    phone,
    service,
    note,
    createdAt: new Date().toISOString(),
  };

  await fs.mkdir(DATA_DIR, { recursive: true });

  let existing: unknown[] = [];
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    existing = JSON.parse(raw) as unknown[];
    if (!Array.isArray(existing)) existing = [];
  } catch {
    existing = [];
  }

  existing.push(booking);
  await fs.writeFile(DATA_FILE, JSON.stringify(existing, null, 2), "utf8");

  return NextResponse.json({ ok: true, id: booking.id });
}

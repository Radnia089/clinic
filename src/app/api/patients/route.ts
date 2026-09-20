import { NextResponse } from "next/server";
import { createPatient, findPatientByPhone, listPatients } from "@/lib/store";
import { normalizeIntegerInput, parseNormalizedNumber } from "@/lib/digits";
import type { Gender } from "@/lib/types";

export async function GET() {
  const patients = await listPatients();
  return NextResponse.json({ patients });
}

export async function POST(request: Request) {
  const body = await request.json();
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const ageRaw = String(body.age ?? "").trim();
  const ageParsed = ageRaw ? parseNormalizedNumber(ageRaw) : undefined;
  const gender = (body.gender as Gender) || "female";
  const phone = normalizeIntegerInput(String(body.phone ?? ""));
  const address = String(body.address ?? "").trim();
  const notes = String(body.notes ?? "").trim();

  // فقط نام‌خانوادگی و موبایل اجباری‌اند
  if (!lastName || !/^09\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  if (
    ageParsed != null &&
    (!Number.isFinite(ageParsed) || ageParsed < 1 || ageParsed > 120)
  ) {
    return NextResponse.json({ error: "invalid_age" }, { status: 400 });
  }

  if (!["female", "male", "other"].includes(gender)) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const existing = await findPatientByPhone(phone);
  if (existing) {
    return NextResponse.json(
      { error: "phone_exists", patient: existing },
      { status: 409 }
    );
  }

  const patient = await createPatient({
    firstName,
    lastName,
    age: ageParsed,
    gender,
    phone,
    address,
    notes: notes || undefined,
  });

  return NextResponse.json({ patient }, { status: 201 });
}

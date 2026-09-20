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
  const age = parseNormalizedNumber(String(body.age ?? ""));
  const gender = body.gender as Gender;
  const phone = normalizeIntegerInput(String(body.phone ?? ""));
  const address = String(body.address ?? "").trim();
  const notes = String(body.notes ?? "").trim();

  if (
    !firstName ||
    !lastName ||
    !Number.isFinite(age) ||
    age < 1 ||
    age > 120 ||
    !["female", "male", "other"].includes(gender) ||
    !/^09\d{9}$/.test(phone) ||
    !address
  ) {
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
    age,
    gender,
    phone,
    address,
    notes: notes || undefined,
  });

  return NextResponse.json({ patient }, { status: 201 });
}

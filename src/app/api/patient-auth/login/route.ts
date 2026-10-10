import { NextResponse } from "next/server";
import { normalizeIntegerInput } from "@/lib/digits";
import {
  patientHasPassword,
  validatePatientPassword,
  verifyPatientPassword,
} from "@/lib/patient-password";
import { establishPatientSession } from "@/lib/patient-session";
import { findPatientByPhone } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizeIntegerInput(String(body.phone ?? ""));
  const validated = validatePatientPassword(String(body.password ?? ""));

  if (!/^09\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }
  if (!validated.ok) {
    return NextResponse.json({ error: "invalid_password" }, { status: 400 });
  }

  const patient = await findPatientByPhone(phone);
  if (!patient) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (!patientHasPassword(patient)) {
    return NextResponse.json({ error: "no_password" }, { status: 409 });
  }
  if (!verifyPatientPassword(validated.password, patient.passwordHash)) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const remember = body.remember !== false;
  const session = await establishPatientSession(patient, { remember });
  return NextResponse.json({ ok: true, ...session });
}

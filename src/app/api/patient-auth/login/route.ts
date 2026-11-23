import { NextResponse } from "next/server";
import { normalizeIntegerInput } from "@/lib/digits";
import {
  patientHasPassword,
  readLoginPassword,
  verifyPatientPassword,
} from "@/lib/patient-password";
import { establishPatientSession } from "@/lib/patient-session";
import {
  clearLoginFailures,
  clientIp,
  loginAttemptAllowed,
  recordLoginFailure,
} from "@/lib/rate-limit";
import { findPatientByPhone } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizeIntegerInput(String(body.phone ?? ""));
  const password = readLoginPassword(String(body.password ?? ""));

  if (!/^09\d{9}$/.test(phone) || !password) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const key = `login:${phone}:${clientIp(request)}`;
  const allowed = loginAttemptAllowed(key);
  if (!allowed.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const patient = await findPatientByPhone(phone);
  const matches =
    patient &&
    patientHasPassword(patient) &&
    verifyPatientPassword(password, patient.passwordHash);

  if (!patient || !matches) {
    recordLoginFailure(key);
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  clearLoginFailures(key);
  const remember = body.remember !== false;
  const session = await establishPatientSession(patient, { remember });
  return NextResponse.json({ ok: true, ...session });
}

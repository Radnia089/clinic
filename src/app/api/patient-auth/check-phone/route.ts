import { NextResponse } from "next/server";
import { normalizeIntegerInput } from "@/lib/digits";
import { patientHasPassword } from "@/lib/patient-password";
import { patientHasRegisteredInfo } from "@/lib/patient-profile";
import { findPatientByPhone } from "@/lib/store";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const phone = normalizeIntegerInput(String(body.phone ?? ""));
  if (!/^09\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
  }

  const existing = await findPatientByPhone(phone);
  return NextResponse.json({
    ok: true,
    phone,
    exists: Boolean(existing),
    hasPassword: patientHasPassword(existing),
    alreadyRegistered: patientHasRegisteredInfo(existing),
  });
}

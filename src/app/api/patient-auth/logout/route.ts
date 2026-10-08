import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PATIENT_AUTH_COOKIE } from "@/lib/patient-auth";

export async function POST() {
  const jar = await cookies();
  jar.delete(PATIENT_AUTH_COOKIE);
  return NextResponse.json({ ok: true });
}

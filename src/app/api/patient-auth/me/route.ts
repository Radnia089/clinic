import { NextResponse } from "next/server";
import { getCurrentPatient } from "@/lib/patient-auth";
import { listMeasurements } from "@/lib/store";

export async function GET() {
  const patient = await getCurrentPatient();
  if (!patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const measurements = await listMeasurements(patient.id);
  return NextResponse.json({ patient, measurements });
}

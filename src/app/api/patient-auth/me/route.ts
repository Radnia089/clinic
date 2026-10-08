import { NextResponse } from "next/server";
import { getCurrentPatient } from "@/lib/patient-auth";
import { listMeasurements } from "@/lib/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const patient = await getCurrentPatient();
  if (!patient) {
    return NextResponse.json(
      { error: "unauthorized" },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      }
    );
  }
  const measurements = await listMeasurements(patient.id);
  return NextResponse.json(
    { patient, measurements },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    }
  );
}

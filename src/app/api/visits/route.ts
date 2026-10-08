import { NextResponse } from "next/server";
import {
  createMeasurement,
  createVisit,
  getPatient,
  listPatients,
  listVisits,
  updatePatient,
  updateVisit,
} from "@/lib/store";
import type { AdmissionForm, VisitStatus, VisitType } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") as VisitStatus | null;
  const [visits, patients] = await Promise.all([listVisits(), listPatients()]);
  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));
  const filtered = status ? visits.filter((v) => v.status === status) : visits;

  return NextResponse.json({
    visits: filtered.map((visit) => ({
      ...visit,
      patient: patientMap[visit.patientId] ?? null,
    })),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const patientId = String(body.patientId ?? "");
  const visitDate = String(body.visitDate ?? "");
  const visitType = body.visitType as VisitType;
  const packageName = body.packageName
    ? String(body.packageName).trim()
    : undefined;
  const status = (body.status as VisitStatus) || "visitor";

  if (
    !patientId ||
    !visitDate ||
    !["consultation", "package"].includes(visitType)
  ) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const patient = await getPatient(patientId);
  if (!patient) {
    return NextResponse.json({ error: "patient_not_found" }, { status: 404 });
  }

  const rawDuration = body.durationMinutes != null ? Number(body.durationMinutes) : undefined;
  const durationMinutes =
    rawDuration != null && Number.isFinite(rawDuration) && rawDuration > 0
      ? Math.round(rawDuration)
      : undefined;

  const visit = await createVisit({
    patientId,
    visitDate,
    visitType,
    visitTime: body.visitTime ? String(body.visitTime) : undefined,
    durationMinutes,
    channel: body.channel === "phone" ? "phone" : "clinic",
    packageName:
      visitType === "package" ? packageName || "پکیج لاغری" : undefined,
    status,
  });

  return NextResponse.json({ visit }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const id = String(body.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const patch: {
    status?: VisitStatus;
    admission?: AdmissionForm;
    packageName?: string;
    visitType?: VisitType;
    visitDate?: string;
    visitTime?: string;
    durationMinutes?: number;
  } = {};

  if (body.status) patch.status = body.status;
  if (body.admission) patch.admission = body.admission;
  if (body.packageName !== undefined) patch.packageName = body.packageName;
  if (body.visitType) patch.visitType = body.visitType;
  if (body.visitDate) patch.visitDate = body.visitDate;
  if (body.visitTime !== undefined) patch.visitTime = body.visitTime;
  if (body.durationMinutes != null) {
    const d = Number(body.durationMinutes);
    if (Number.isFinite(d) && d > 0) patch.durationMinutes = Math.round(d);
  }

  const visit = await updateVisit(id, patch);
  if (!visit) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  // سایز پذیرش → پرونده مشتری + سری اندازه‌گیری (همگام با اپ مشتری)
  if (patch.admission) {
    const admission = patch.admission;
    const patientPatch: {
      heightCm?: number;
      goalWeightKg?: number;
    } = {};
    if (
      admission.heightCm != null &&
      Number.isFinite(admission.heightCm) &&
      admission.heightCm > 0
    ) {
      patientPatch.heightCm = Number(admission.heightCm);
    }
    if (
      admission.goalWeightKg != null &&
      Number.isFinite(admission.goalWeightKg) &&
      admission.goalWeightKg > 0
    ) {
      patientPatch.goalWeightKg = Number(admission.goalWeightKg);
    }
    if (Object.keys(patientPatch).length > 0) {
      await updatePatient(visit.patientId, patientPatch);
    }

    const weightKg = Number(admission.weightKg);
    const waistCm = Number(admission.waistCm);
    if (Number.isFinite(weightKg) && weightKg > 0 && Number.isFinite(waistCm) && waistCm > 0) {
      await createMeasurement({
        patientId: visit.patientId,
        recordedAt: visit.visitDate || new Date().toISOString(),
        weightKg,
        waistCm,
        hipCm:
          admission.hipCm != null && Number.isFinite(Number(admission.hipCm))
            ? Number(admission.hipCm)
            : undefined,
        note: "ثبت از فرم پذیرش",
      });
    }
  }

  return NextResponse.json({ visit });
}

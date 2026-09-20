import { NextResponse } from "next/server";
import {
  createPayment,
  listPatients,
  listPayments,
  listVisits,
  updatePayment,
} from "@/lib/store";
import { parseNormalizedNumber } from "@/lib/digits";
import type { PaymentMethod, PaymentStatus } from "@/lib/types";

export async function GET() {
  const [payments, patients, visits] = await Promise.all([
    listPayments(),
    listPatients(),
    listVisits(),
  ]);
  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));
  const visitMap = Object.fromEntries(visits.map((v) => [v.id, v]));

  return NextResponse.json({
    payments: payments.map((payment) => ({
      ...payment,
      patient: patientMap[payment.patientId] ?? null,
      visit: payment.visitId ? visitMap[payment.visitId] ?? null : null,
    })),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const patientId = String(body.patientId ?? "");
  const title = String(body.title ?? "").trim();
  const amount = parseNormalizedNumber(String(body.amount ?? ""));
  const paidAmount = parseNormalizedNumber(String(body.paidAmount ?? "0"));
  const method = body.method as PaymentMethod;
  const visitId = body.visitId ? String(body.visitId) : undefined;
  const note = body.note ? String(body.note).trim() : undefined;

  if (
    !patientId ||
    !title ||
    !Number.isFinite(amount) ||
    amount < 0 ||
    !["cash", "card", "transfer"].includes(method)
  ) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  let status: PaymentStatus = "pending";
  if (paidAmount <= 0) status = "pending";
  else if (paidAmount >= amount) status = "paid";
  else status = "partial";

  const payment = await createPayment({
    patientId,
    visitId,
    title,
    amount,
    paidAmount: Math.min(paidAmount, amount),
    method,
    status,
    note,
  });

  return NextResponse.json({ payment }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const id = String(body.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const payment = await updatePayment(id, {
    status: body.status,
    paidAmount: body.paidAmount,
    amount: body.amount,
    method: body.method,
    title: body.title,
    note: body.note,
  });

  if (!payment) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ payment });
}

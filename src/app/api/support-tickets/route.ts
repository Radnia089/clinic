import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getCurrentPatient } from "@/lib/patient-auth";
import {
  createSupportTicket,
  listSupportTickets,
  updateSupportTicket,
} from "@/lib/store";
import {
  patientFullName,
  type SupportTicketCategory,
  type SupportTicketStatus,
} from "@/lib/types";

const CATEGORIES: SupportTicketCategory[] = [
  "appointment",
  "diet",
  "app",
  "billing",
  "other",
];

const STATUSES: SupportTicketStatus[] = [
  "new",
  "in_progress",
  "resolved",
  "closed",
];

export const dynamic = "force-dynamic";

export async function GET() {
  const clinicUser = await getCurrentUser();
  if (clinicUser) {
    const items = await listSupportTickets();
    return NextResponse.json({ items });
  }

  const patient = await getCurrentPatient();
  if (!patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const items = await listSupportTickets(patient.id);
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const patient = await getCurrentPatient();
  if (!patient) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const subject = String(body.subject ?? "").trim();
  const message = String(body.body ?? "").trim();
  const categoryRaw = String(body.category ?? "other").trim();
  const category = CATEGORIES.includes(categoryRaw as SupportTicketCategory)
    ? (categoryRaw as SupportTicketCategory)
    : "other";

  if (subject.length < 3 || message.length < 5) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const item = await createSupportTicket({
    patientId: patient.id,
    patientName: patientFullName(patient) || patient.phone,
    phone: patient.phone,
    category,
    subject: subject.slice(0, 120),
    body: message.slice(0, 2000),
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(request: Request) {
  const clinicUser = await getCurrentUser();
  if (!clinicUser) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const patch: {
    status?: SupportTicketStatus;
    clinicReply?: string;
  } = {};

  if (body.status !== undefined) {
    const status = String(body.status);
    if (!STATUSES.includes(status as SupportTicketStatus)) {
      return NextResponse.json({ error: "invalid_status" }, { status: 400 });
    }
    patch.status = status as SupportTicketStatus;
  }

  if (body.clinicReply !== undefined) {
    patch.clinicReply = String(body.clinicReply).trim().slice(0, 2000);
  }

  if (!patch.status && patch.clinicReply === undefined) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const item = await updateSupportTicket(id, patch);
  if (!item) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ item });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createPatientInboxMessage,
  listPatientInboxMessagesAdmin,
  listPatients,
} from "@/lib/store";

async function requireManager() {
  const user = await getCurrentUser();
  if (!user || user.role !== "management") return null;
  return user;
}

export async function GET() {
  if (!(await requireManager())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const [messages, patients] = await Promise.all([
    listPatientInboxMessagesAdmin(),
    listPatients(),
  ]);
  return NextResponse.json({ messages, patients });
}

export async function POST(request: Request) {
  const user = await requireManager();
  if (!user) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const title = String(body.title ?? "").trim();
  const text = String(body.body ?? "").trim();
  const audience = body.audience === "selected" ? "selected" : "all";
  const patientIds = Array.isArray(body.patientIds)
    ? body.patientIds.map((id: unknown) => String(id).trim()).filter(Boolean)
    : [];

  if (!title || !text) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  if (audience === "selected") {
    const valid = new Set((await listPatients()).map((p) => p.id));
    const filtered = patientIds.filter((id) => valid.has(id));
    if (filtered.length === 0) {
      return NextResponse.json({ error: "no_recipients" }, { status: 400 });
    }
    const message = await createPatientInboxMessage({
      title,
      body: text,
      audience: "selected",
      patientIds: filtered,
      createdBy: user.name,
    });
    if (!message) {
      return NextResponse.json({ error: "create_failed" }, { status: 400 });
    }
    return NextResponse.json({ message }, { status: 201 });
  }

  const message = await createPatientInboxMessage({
    title,
    body: text,
    audience: "all",
    createdBy: user.name,
  });
  if (!message) {
    return NextResponse.json({ error: "create_failed" }, { status: 400 });
  }
  return NextResponse.json({ message }, { status: 201 });
}

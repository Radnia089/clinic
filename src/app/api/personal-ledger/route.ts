import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { parseNormalizedNumber } from "@/lib/digits";
import {
  createPersonalLedgerEntry,
  deletePersonalLedgerEntry,
  listPersonalLedger,
} from "@/lib/store";
import type { PersonalLedgerKind } from "@/lib/types";

async function requireManager() {
  const user = await getCurrentUser();
  if (!user || user.role !== "management") return null;
  return user;
}

export async function GET() {
  if (!(await requireManager())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const entries = await listPersonalLedger();
  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  if (!(await requireManager())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const kind = body.kind as PersonalLedgerKind;
  const category = String(body.category ?? "").trim();
  const title = String(body.title ?? "").trim();
  const note = String(body.note ?? "").trim();
  const entryDate = String(body.entryDate ?? "").trim();
  const amount = parseNormalizedNumber(String(body.amount ?? ""));

  if (
    !["income", "expense"].includes(kind) ||
    !category ||
    !entryDate ||
    !Number.isFinite(amount) ||
    amount <= 0
  ) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const entry = await createPersonalLedgerEntry({
    kind,
    category,
    title: title || undefined,
    amount: Math.round(amount),
    entryDate,
    note: note || undefined,
  });

  return NextResponse.json({ entry }, { status: 201 });
}

export async function DELETE(request: Request) {
  if (!(await requireManager())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = await request.json().catch(() => ({}));
  const id = String(body.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }
  const ok = await deletePersonalLedgerEntry(id);
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

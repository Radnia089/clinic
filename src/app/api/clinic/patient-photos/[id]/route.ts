import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { deleteRecordPhoto, readRecordPhoto } from "@/lib/record-photos";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function staff() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return null;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await staff();
  if (denied) return denied;
  const { id } = await context.params;
  const bytes = await readRecordPhoto(id);
  if (!bytes) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await staff();
  if (denied) return denied;
  const { id } = await context.params;
  const removed = await deleteRecordPhoto(id);
  if (!removed) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

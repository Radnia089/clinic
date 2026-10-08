import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { parseNormalizedNumber } from "@/lib/digits";
import {
  createChampion,
  deleteChampion,
  listChampions,
  updateChampion,
} from "@/lib/store";

async function requireManager() {
  const user = await getCurrentUser();
  if (!user || user.role !== "management") return null;
  return user;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all") === "1";
  const user = await getCurrentUser();
  const publishedOnly = !(all && user?.role === "management");
  const items = await listChampions({ publishedOnly });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  if (!(await requireManager())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const quote = String(body.quote ?? "").trim();
  const beforeImage = String(body.beforeImage ?? "").trim();
  const afterImage = String(body.afterImage ?? "").trim();
  const startKg = parseNormalizedNumber(String(body.startKg ?? ""));
  const endKg = parseNormalizedNumber(String(body.endKg ?? ""));
  const startWaistRaw = body.startWaistCm;
  const endWaistRaw = body.endWaistCm;
  const startWaistCm =
    startWaistRaw === undefined || startWaistRaw === "" || startWaistRaw === null
      ? undefined
      : parseNormalizedNumber(String(startWaistRaw));
  const endWaistCm =
    endWaistRaw === undefined || endWaistRaw === "" || endWaistRaw === null
      ? undefined
      : parseNormalizedNumber(String(endWaistRaw));
  const sortOrder = Number.isFinite(Number(body.sortOrder))
    ? Number(body.sortOrder)
    : 0;
  const published = body.published !== false;

  if (
    name.length < 2 ||
    !beforeImage ||
    !afterImage ||
    !Number.isFinite(startKg) ||
    !Number.isFinite(endKg) ||
    startKg <= 0 ||
    endKg <= 0 ||
    endKg > startKg ||
    startWaistCm === undefined ||
    endWaistCm === undefined ||
    !Number.isFinite(startWaistCm) ||
    !Number.isFinite(endWaistCm) ||
    startWaistCm <= 0 ||
    endWaistCm <= 0 ||
    endWaistCm > startWaistCm
  ) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const item = await createChampion({
    name,
    quote,
    beforeImage,
    afterImage,
    startKg,
    endKg,
    startWaistCm,
    endWaistCm,
    published,
    sortOrder,
  });

  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await requireManager())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const id = String(body.id ?? "");
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = String(body.name).trim();
  if (body.quote !== undefined) patch.quote = String(body.quote).trim();
  if (body.beforeImage !== undefined) {
    patch.beforeImage = String(body.beforeImage).trim();
  }
  if (body.afterImage !== undefined) {
    patch.afterImage = String(body.afterImage).trim();
  }
  if (body.startKg !== undefined) {
    patch.startKg = parseNormalizedNumber(String(body.startKg));
  }
  if (body.endKg !== undefined) {
    patch.endKg = parseNormalizedNumber(String(body.endKg));
  }
  if (body.startWaistCm !== undefined) {
    patch.startWaistCm =
      body.startWaistCm === "" || body.startWaistCm === null
        ? undefined
        : parseNormalizedNumber(String(body.startWaistCm));
  }
  if (body.endWaistCm !== undefined) {
    patch.endWaistCm =
      body.endWaistCm === "" || body.endWaistCm === null
        ? undefined
        : parseNormalizedNumber(String(body.endWaistCm));
  }
  if (body.sortOrder !== undefined) patch.sortOrder = Number(body.sortOrder) || 0;
  if (body.published !== undefined) patch.published = Boolean(body.published);

  if (
    (patch.startKg !== undefined &&
      (!Number.isFinite(patch.startKg as number) || (patch.startKg as number) <= 0)) ||
    (patch.endKg !== undefined &&
      (!Number.isFinite(patch.endKg as number) || (patch.endKg as number) <= 0))
  ) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const item = await updateChampion(id, patch);
  if (!item) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ item });
}

export async function DELETE(request: Request) {
  if (!(await requireManager())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const ok = await deleteChampion(id);
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import {
  createPromoBanner,
  deletePromoBanner,
  listPromoBanners,
  updatePromoBanner,
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
  const items = await listPromoBanners({ publishedOnly });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  if (!(await requireManager())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const subtitle = String(body.subtitle ?? "").trim();
  const image = String(body.image ?? "").trim();
  const href = String(body.href ?? "").trim();
  const sortOrder = Number.isFinite(Number(body.sortOrder))
    ? Number(body.sortOrder)
    : 0;
  const published = body.published !== false;

  if (title.length < 2 || !image) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const item = await createPromoBanner({
    title,
    subtitle: subtitle || undefined,
    image,
    href: href || undefined,
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
  if (body.title !== undefined) patch.title = String(body.title).trim();
  if (body.subtitle !== undefined) {
    const subtitle = String(body.subtitle).trim();
    patch.subtitle = subtitle || undefined;
  }
  if (body.image !== undefined) patch.image = String(body.image).trim();
  if (body.href !== undefined) {
    const href = String(body.href).trim();
    patch.href = href || undefined;
  }
  if (body.sortOrder !== undefined) patch.sortOrder = Number(body.sortOrder) || 0;
  if (body.published !== undefined) patch.published = Boolean(body.published);

  const item = await updatePromoBanner(id, patch);
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

  const ok = await deletePromoBanner(id);
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

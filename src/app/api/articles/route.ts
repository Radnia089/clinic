import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { slugifyTitle } from "@/lib/magazine";
import {
  createArticle,
  deleteArticle,
  listArticles,
  updateArticle,
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
  const items = await listArticles({ publishedOnly });
  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  if (!(await requireManager())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const excerpt = String(body.excerpt ?? "").trim();
  const articleBody = String(body.body ?? "").trim();
  const category = String(body.category ?? "").trim();
  const coverImage = String(body.coverImage ?? "").trim();
  const slugRaw = String(body.slug ?? "").trim();
  const slug = slugifyTitle(slugRaw || title);
  const sortOrder = Number.isFinite(Number(body.sortOrder))
    ? Number(body.sortOrder)
    : 0;
  const published = body.published !== false;

  if (
    title.length < 3 ||
    excerpt.length < 10 ||
    articleBody.length < 20 ||
    !category ||
    !coverImage ||
    !slug
  ) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  const item = await createArticle({
    title,
    excerpt,
    body: articleBody,
    category,
    coverImage,
    slug,
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
  if (body.excerpt !== undefined) patch.excerpt = String(body.excerpt).trim();
  if (body.body !== undefined) patch.body = String(body.body).trim();
  if (body.category !== undefined) patch.category = String(body.category).trim();
  if (body.coverImage !== undefined) {
    patch.coverImage = String(body.coverImage).trim();
  }
  if (body.slug !== undefined) {
    patch.slug = slugifyTitle(String(body.slug).trim());
  }
  if (body.sortOrder !== undefined) patch.sortOrder = Number(body.sortOrder) || 0;
  if (body.published !== undefined) patch.published = Boolean(body.published);

  const item = await updateArticle(id, patch);
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

  const ok = await deleteArticle(id);
  if (!ok) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

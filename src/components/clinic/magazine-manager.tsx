"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MAGAZINE_CATEGORIES, type MagazineArticle } from "@/lib/magazine";
import { cn } from "@/lib/utils";

async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/articles/upload", { method: "POST", body });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(data?.message || "آپلود تصویر انجام نشد");
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export function MagazineManager({
  initialItems,
}: {
  initialItems: MagazineArticle[];
}) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>(MAGAZINE_CATEGORIES[0]);
  const [coverImage, setCoverImage] = useState("");
  const [published, setPublished] = useState(true);

  function resetForm() {
    setTitle("");
    setExcerpt("");
    setBody("");
    setCategory(MAGAZINE_CATEGORIES[0]);
    setCoverImage("");
    setPublished(true);
  }

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      setCoverImage(await uploadImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "آپلود ناموفق بود");
    } finally {
      setUploading(false);
    }
  }

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          excerpt,
          body,
          category,
          coverImage,
          published,
          sortOrder: items.length + 1,
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { item: MagazineArticle };
      setItems((prev) => [data.item, ...prev]);
      resetForm();
    } catch {
      setError("ثبت مقاله انجام نشد. عنوان، خلاصه، متن و تصویر را بررسی کنید.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(item: MagazineArticle) {
    const res = await fetch("/api/articles", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, published: !item.published }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { item: MagazineArticle };
    setItems((prev) =>
      prev.map((row) => (row.id === item.id ? data.item : row))
    );
  }

  async function removeItem(id: string) {
    if (!confirm("این مقاله حذف شود؟")) return;
    const res = await fetch(`/api/articles?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) return;
    setItems((prev) => prev.filter((row) => row.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-brand">مجله و مقالات</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          مقالات منتشرشده در لندینگ، اپ مشتری و مسیر `/magazine` برای سئو نمایش
          داده می‌شوند.
        </p>
      </div>

      <form
        onSubmit={onCreate}
        className="space-y-4 rounded-[1.75rem] bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-brand">
          <Plus className="size-4" />
          افزودن مقاله
        </div>

        <div className="space-y-2">
          <Label htmlFor="art-title">عنوان</Label>
          <Input
            id="art-title"
            className="h-11 rounded-2xl"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="art-category">دسته‌بندی</Label>
          <select
            id="art-category"
            className="h-11 w-full rounded-2xl border border-input bg-transparent px-3 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {MAGAZINE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="art-excerpt">خلاصه (برای سئو و کارت مقاله)</Label>
          <Textarea
            id="art-excerpt"
            className="min-h-20 rounded-2xl"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="art-body">متن کامل (پاراگراف‌ها را با خط خالی جدا کنید)</Label>
          <Textarea
            id="art-body"
            className="min-h-40 rounded-2xl"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>تصویر کاور</Label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-[#D7E2D9] bg-[#F7F8F6] p-3">
            {coverImage ? (
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={coverImage}
                  alt="کاور"
                  fill
                  className="rounded-xl object-cover"
                  sizes="480px"
                />
              </div>
            ) : (
              <span className="flex flex-col items-center gap-2 py-10 text-sm text-muted-foreground">
                {uploading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Upload className="size-5" />
                )}
                انتخاب تصویر
              </span>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => onUpload(e.target.files?.[0])}
            />
          </label>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="size-4 accent-[#14352A]"
          />
          انتشار در سایت و اپ
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button
          type="submit"
          disabled={saving || !coverImage}
          className="h-11 rounded-2xl bg-brand text-white hover:bg-brand/90"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" />
              در حال ذخیره...
            </>
          ) : (
            "ثبت مقاله"
          )}
        </Button>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-brand">لیست مقالات</h3>
        {items.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-4 rounded-[1.5rem] bg-white p-4 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl sm:w-40">
              <Image
                src={item.coverImage}
                alt={item.title}
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-bold text-brand">{item.title}</h4>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-bold",
                    item.published
                      ? "bg-[#E8F2EA] text-brand"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.published ? "منتشر شده" : "پیش‌نویس"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {item.category} · /magazine/{item.slug}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-xl text-xs"
                onClick={() => togglePublished(item)}
              >
                {item.published ? "عدم انتشار" : "انتشار"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-xl text-xs text-destructive"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="size-3.5" />
                حذف
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

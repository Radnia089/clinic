"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PromoBanner } from "@/lib/types";
import { cn } from "@/lib/utils";

async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/promo-banners/upload", {
    method: "POST",
    body,
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(data?.message || "آپلود تصویر انجام نشد");
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export function PromoBannersManager({
  initialItems,
}: {
  initialItems: PromoBanner[];
}) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [href, setHref] = useState("/patient/book");
  const [image, setImage] = useState("");
  const [published, setPublished] = useState(true);

  function resetForm() {
    setTitle("");
    setSubtitle("");
    setHref("/patient/book");
    setImage("");
    setPublished(true);
  }

  async function onUpload(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      setImage(await uploadImage(file));
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
      const res = await fetch("/api/promo-banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          href,
          image,
          published,
          sortOrder: items.length + 1,
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { item: PromoBanner };
      setItems((prev) => [data.item, ...prev]);
      resetForm();
    } catch {
      setError("ثبت بنر انجام نشد. عنوان و تصویر را بررسی کنید.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(item: PromoBanner) {
    const res = await fetch("/api/promo-banners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, published: !item.published }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { item: PromoBanner };
    setItems((prev) =>
      prev.map((row) => (row.id === item.id ? data.item : row))
    );
  }

  async function removeItem(id: string) {
    if (!confirm("این بنر حذف شود؟")) return;
    const res = await fetch(`/api/promo-banners?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) return;
    setItems((prev) => prev.filter((row) => row.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-brand">بنرهای تبلیغاتی</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          بنرهای جشنواره (مثل تخفیف زمستانه یا اقساطی) را اینجا بگذارید تا در اپ
          مشتری به‌صورت اسلایدر نمایش داده شوند.
        </p>
      </div>

      <form
        onSubmit={onCreate}
        className="space-y-4 rounded-[1.75rem] bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-brand">
          <Plus className="size-4" />
          افزودن بنر جدید
        </div>

        <div className="space-y-2">
          <Label htmlFor="promo-title">عنوان</Label>
          <Input
            id="promo-title"
            className="h-11 rounded-2xl"
            placeholder="مثلاً جشنواره تخفیف زمستانه"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promo-subtitle">زیرعنوان</Label>
          <Input
            id="promo-subtitle"
            className="h-11 rounded-2xl"
            placeholder="توضیح کوتاه پیشنهاد"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="promo-href">لینک کلیک (اختیاری)</Label>
          <Input
            id="promo-href"
            className="h-11 rounded-2xl"
            dir="ltr"
            placeholder="/patient/book"
            value={href}
            onChange={(e) => setHref(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>تصویر بنر</Label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-[#D7E2D9] bg-[#F7F8F6] p-3 transition hover:bg-[#EEF4F0]">
            {image ? (
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={image}
                  alt="بنر"
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
                انتخاب تصویر عریض (۱۶:۹)
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
          انتشار در اپ مشتری
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button
          type="submit"
          disabled={saving || !image}
          className="h-11 rounded-2xl bg-brand text-white hover:bg-brand/90"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" />
              در حال ذخیره...
            </>
          ) : (
            "ثبت بنر"
          )}
        </Button>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-brand">لیست بنرها</h3>
        {items.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-sm text-muted-foreground">
            هنوز بنری ثبت نشده است.
          </p>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 rounded-[1.5rem] bg-white p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-xl sm:w-48">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="192px"
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
                {item.subtitle ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.subtitle}
                  </p>
                ) : null}
                {item.href ? (
                  <p className="mt-1 text-[11px] text-muted-foreground" dir="ltr">
                    {item.href}
                  </p>
                ) : null}
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
          ))
        )}
      </div>
    </div>
  );
}

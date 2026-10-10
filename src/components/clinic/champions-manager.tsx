"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DigitsInput } from "@/components/ui/digits-input";
import { lostKg, lostSizeCm, type Champion } from "@/lib/champions";
import { cn } from "@/lib/utils";

function faNum(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}

async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/champions/upload", {
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

export function ChampionsManager({
  initialItems,
}: {
  initialItems: Champion[];
}) {
  const [items, setItems] = useState(initialItems);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [quote, setQuote] = useState("");
  const [startKg, setStartKg] = useState("");
  const [endKg, setEndKg] = useState("");
  const [startWaistCm, setStartWaistCm] = useState("");
  const [endWaistCm, setEndWaistCm] = useState("");
  const [beforeImage, setBeforeImage] = useState("");
  const [afterImage, setAfterImage] = useState("");
  const [published, setPublished] = useState(true);
  const [uploading, setUploading] = useState<"before" | "after" | null>(null);

  function resetForm() {
    setName("");
    setQuote("");
    setStartKg("");
    setEndKg("");
    setStartWaistCm("");
    setEndWaistCm("");
    setBeforeImage("");
    setAfterImage("");
    setPublished(true);
  }

  async function onUpload(
    side: "before" | "after",
    file: File | undefined
  ) {
    if (!file) return;
    setError("");
    setUploading(side);
    try {
      const url = await uploadImage(file);
      if (side === "before") setBeforeImage(url);
      else setAfterImage(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "آپلود ناموفق بود");
    } finally {
      setUploading(null);
    }
  }

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/champions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          quote,
          startKg,
          endKg,
          startWaistCm: startWaistCm || undefined,
          endWaistCm: endWaistCm || undefined,
          beforeImage,
          afterImage,
          published,
          sortOrder: items.length + 1,
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = (await res.json()) as { item: Champion };
      setItems((prev) => [data.item, ...prev]);
      resetForm();
    } catch {
      setError(
        "ثبت قهرمان انجام نشد. وزن، دور کمر (در صورت وارد کردن هر دو) و تصاویر را بررسی کنید."
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(item: Champion) {
    const res = await fetch("/api/champions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, published: !item.published }),
    });
    if (!res.ok) return;
    const data = (await res.json()) as { item: Champion };
    setItems((prev) =>
      prev.map((row) => (row.id === item.id ? data.item : row))
    );
  }

  async function removeItem(id: string) {
    if (!confirm("این قهرمان حذف شود؟")) return;
    const res = await fetch(`/api/champions?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) return;
    setItems((prev) => prev.filter((row) => row.id !== id));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-brand">قهرمانان تندیس</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          عکس قبل و بعد، وزن و دور کمر را اینجا بگذارید تا کاهش وزن و کاهش سایز
          در لندینگ و اپ مشتری دیده شود.
        </p>
      </div>

      <form
        onSubmit={onCreate}
        className="space-y-4 rounded-[1.75rem] bg-white p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-2 text-sm font-bold text-brand">
          <Plus className="size-4" />
          افزودن قهرمان جدید
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="ch-name">نام</Label>
            <Input
              id="ch-name"
              className="h-11 rounded-2xl"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ch-start">وزن شروع (kg)</Label>
              <DigitsInput
                id="ch-start"
                mode="decimal"
                className="h-11 rounded-2xl"
                value={startKg}
                onValueChange={setStartKg}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ch-end">وزن پایان (kg)</Label>
              <DigitsInput
                id="ch-end"
                mode="decimal"
                className="h-11 rounded-2xl"
                value={endKg}
                onValueChange={setEndKg}
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="ch-waist-start">دور کمر شروع (cm)</Label>
            <DigitsInput
              id="ch-waist-start"
              mode="decimal"
              className="h-11 rounded-2xl"
              value={startWaistCm}
              onValueChange={setStartWaistCm}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ch-waist-end">دور کمر پایان (cm)</Label>
            <DigitsInput
              id="ch-waist-end"
              mode="decimal"
              className="h-11 rounded-2xl"
              value={endWaistCm}
              onValueChange={setEndWaistCm}
              required
            />
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground">
          کاهش سایز از روی دور کمر محاسبه و کنار کاهش وزن نمایش داده می‌شود.
        </p>

        <div className="space-y-2">
          <Label htmlFor="ch-quote">توضیح کوتاه</Label>
          <Textarea
            id="ch-quote"
            className="min-h-20 rounded-2xl"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            placeholder="مثلاً با رژیم شخصی تندیس به هدفم رسیدم..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              {
                side: "before" as const,
                label: "عکس قبل",
                value: beforeImage,
              },
              {
                side: "after" as const,
                label: "عکس بعد",
                value: afterImage,
              },
            ]
          ).map((slot) => (
            <div key={slot.side} className="space-y-2">
              <Label>{slot.label}</Label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl border border-dashed border-[#D7E2D9] bg-[#F7F8F6] p-3 transition hover:bg-[#EEF4F0]">
                {slot.value ? (
                  <div className="relative h-40 w-full">
                    <Image
                      src={slot.value}
                      alt={slot.label}
                      fill
                      className="rounded-xl object-cover"
                      sizes="240px"
                    />
                  </div>
                ) : (
                  <span className="flex flex-col items-center gap-2 py-8 text-sm text-muted-foreground">
                    {uploading === slot.side ? (
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
                  onChange={(e) => onUpload(slot.side, e.target.files?.[0])}
                />
              </label>
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="size-4 accent-[#14352A]"
          />
          انتشار در سایت و اپ مشتری
        </label>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button
          type="submit"
          disabled={saving || !beforeImage || !afterImage}
          className="h-11 rounded-2xl bg-brand text-white hover:bg-brand/90"
        >
          {saving ? (
            <>
              <Loader2 className="animate-spin" />
              در حال ذخیره...
            </>
          ) : (
            "ثبت قهرمان"
          )}
        </Button>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-brand">لیست فعلی</h3>
        {items.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-sm text-muted-foreground">
            هنوز موردی ثبت نشده است.
          </p>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="flex flex-col gap-4 rounded-[1.5rem] bg-white p-4 shadow-sm sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl sm:w-36">
                <div className="absolute inset-0 grid grid-cols-2">
                  <div className="relative">
                    <Image
                      src={item.beforeImage}
                      alt="قبل"
                      fill
                      className="object-cover grayscale-[30%]"
                      sizes="72px"
                    />
                  </div>
                  <div className="relative">
                    <Image
                      src={item.afterImage}
                      alt="بعد"
                      fill
                      className="object-cover"
                      sizes="72px"
                    />
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-brand">{item.name}</h4>
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
                  وزن {faNum(item.startKg)}→{faNum(item.endKg)} kg (−
                  {faNum(lostKg(item))})
                  {lostSizeCm(item) !== undefined
                    ? ` · سایز کمر −${faNum(lostSizeCm(item)!)} cm`
                    : ""}
                </p>
                {item.quote ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {item.quote}
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

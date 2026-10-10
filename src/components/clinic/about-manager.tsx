"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2, Upload } from "lucide-react";
import { PageHeader } from "@/components/clinic/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ClinicAbout, ClinicProfile } from "@/lib/types";
import { cn } from "@/lib/utils";

const fieldClass =
  "rounded-xl border-[#D7E2D9] bg-[#F7F8F6] focus-visible:border-brand focus-visible:ring-brand/20";

async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const res = await fetch("/api/clinic/about/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "آپلود انجام نشد");
  return data.url as string;
}

export function AboutManager({
  initialClinic,
}: {
  initialClinic: ClinicProfile;
}) {
  const about = initialClinic.about;
  const [fullName, setFullName] = useState(initialClinic.fullName);
  const [tagline, setTagline] = useState(initialClinic.tagline);
  const [phone, setPhone] = useState(initialClinic.phone);
  const [address, setAddress] = useState(initialClinic.address);
  const [hours, setHours] = useState(initialClinic.hours);
  const [aboutText, setAboutText] = useState(about.aboutText);
  const [doctorName, setDoctorName] = useState(about.doctorName);
  const [doctorTitle, setDoctorTitle] = useState(about.doctorTitle);
  const [doctorBio, setDoctorBio] = useState(about.doctorBio);
  const [doctorImage, setDoctorImage] = useState(about.doctorImage || "");
  const [coverImage, setCoverImage] = useState(about.coverImage || "");
  const [gallery, setGallery] = useState<string[]>(about.gallery ?? []);
  const [mapUrl, setMapUrl] = useState(about.mapUrl || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function onUpload(
    kind: "cover" | "doctor" | "gallery",
    file?: File
  ) {
    if (!file) return;
    setUploading(kind);
    setError("");
    try {
      const url = await uploadImage(file);
      if (kind === "cover") setCoverImage(url);
      if (kind === "doctor") setDoctorImage(url);
      if (kind === "gallery") setGallery((prev) => [...prev, url].slice(0, 8));
    } catch (err) {
      setError(err instanceof Error ? err.message : "آپلود ناموفق بود");
    } finally {
      setUploading(null);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setOk("");
    try {
      const payload = {
        fullName,
        tagline,
        phone,
        address,
        hours,
        about: {
          aboutText,
          doctorName,
          doctorTitle,
          doctorBio,
          doctorImage,
          coverImage,
          gallery,
          mapUrl,
        } satisfies ClinicAbout,
      };
      const res = await fetch("/api/clinic/about", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.error === "validation_failed"
            ? "متن معرفی و نام پزشک را کامل کنید."
            : "ذخیره انجام نشد."
        );
      }
      setOk("اطلاعات درباره ما ذخیره شد و در اپ مشتری نمایش داده می‌شود.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیره انجام نشد.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <PageHeader
        title="درباره ما"
        description="اطلاعات کلینیک، پزشک، تصاویر، آدرس و لوکیشن را برای نمایش در اپ مشتری تنظیم کنید."
      />

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-[1.75rem] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)]"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>نام کامل کلینیک</Label>
            <Input
              className={cn(fieldClass, "h-11")}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>شعار کوتاه</Label>
            <Input
              className={cn(fieldClass, "h-11")}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>تلفن</Label>
            <Input
              className={cn(fieldClass, "h-11")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
            />
          </div>
          <div className="space-y-1.5">
            <Label>ساعات کاری</Label>
            <Input
              className={cn(fieldClass, "h-11")}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>آدرس</Label>
            <Textarea
              className={cn(fieldClass, "min-h-20")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>لینک نقشه / لوکیشن</Label>
            <Input
              className={cn(fieldClass, "h-11")}
              value={mapUrl}
              onChange={(e) => setMapUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              dir="ltr"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>متن معرفی کلینیک</Label>
          <Textarea
            className={cn(fieldClass, "min-h-28")}
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>نام پزشک / مشاور</Label>
            <Input
              className={cn(fieldClass, "h-11")}
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label>عنوان / سمت</Label>
            <Input
              className={cn(fieldClass, "h-11")}
              value={doctorTitle}
              onChange={(e) => setDoctorTitle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>درباره پزشک</Label>
            <Textarea
              className={cn(fieldClass, "min-h-24")}
              value={doctorBio}
              onChange={(e) => setDoctorBio(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>تصویر کاور کلینیک</Label>
            {coverImage ? (
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                <Image src={coverImage} alt="" fill className="object-cover" />
              </div>
            ) : null}
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#E8F2EA] px-4 text-xs font-bold text-brand">
              {uploading === "cover" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              آپلود کاور
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => void onUpload("cover", e.target.files?.[0])}
              />
            </label>
          </div>
          <div className="space-y-2">
            <Label>تصویر پزشک</Label>
            {doctorImage ? (
              <div className="relative aspect-square max-w-[180px] overflow-hidden rounded-2xl">
                <Image src={doctorImage} alt="" fill className="object-cover" />
              </div>
            ) : null}
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full bg-[#E8F2EA] px-4 text-xs font-bold text-brand">
              {uploading === "doctor" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Upload className="size-3.5" />
              )}
              آپلود تصویر پزشک
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => void onUpload("doctor", e.target.files?.[0])}
              />
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Label>گالری تصاویر</Label>
            <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-[#14352A] px-3 text-xs font-bold text-white">
              {uploading === "gallery" ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
              افزودن عکس
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => void onUpload("gallery", e.target.files?.[0])}
              />
            </label>
          </div>
          {gallery.length === 0 ? (
            <p className="text-sm text-muted-foreground">هنوز تصویری نیست.</p>
          ) : (
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {gallery.map((src) => (
                <li key={src} className="relative aspect-square overflow-hidden rounded-2xl">
                  <Image src={src} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setGallery((prev) => prev.filter((item) => item !== src))
                    }
                    className="absolute top-2 left-2 rounded-full bg-white/90 p-1.5 text-[#9A4E42]"
                    aria-label="حذف"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        {ok ? <p className="text-sm text-[#2F6B4F]">{ok}</p> : null}

        <Button
          type="submit"
          disabled={saving}
          className="h-11 rounded-full px-6"
        >
          {saving ? "در حال ذخیره..." : "ذخیره درباره ما"}
        </Button>
      </form>
    </div>
  );
}

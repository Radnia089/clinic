"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DigitsInput } from "@/components/ui/digits-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShamsiDateInput } from "@/components/ui/shamsi-date-input";
import { citiesForProvince, IRAN_PROVINCES } from "@/lib/iran-locations";
import {
  ageFromIsoBirthDate,
  formatJalaliDate,
  jalaliPartsToIsoDate,
  todayJalaliParts,
} from "@/lib/jalali";
import {
  patientAvatarSrc,
  type Gender,
  type Patient,
  type ProgressMeasurement,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-12 rounded-2xl border-[#D7E2D9] bg-white focus-visible:border-brand focus-visible:ring-brand/20";

const selectClass =
  "h-12 w-full rounded-2xl border border-[#D7E2D9] bg-white px-3 text-sm outline-none focus:border-brand focus:ring-3 focus:ring-brand/20";

export function PatientProfile({
  patient,
  measurements,
}: {
  patient: Patient;
  measurements: ProgressMeasurement[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const latest = measurements[measurements.length - 1];
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState(patient.firstName || "");
  const [lastName, setLastName] = useState(patient.lastName || "");
  const [nationalId, setNationalId] = useState(patient.nationalId || "");
  const [age, setAge] = useState(patient.age != null ? String(patient.age) : "");
  const [gender, setGender] = useState<Gender>(patient.gender || "female");
  const [province, setProvince] = useState(patient.province || "");
  const [city, setCity] = useState(patient.city || "");
  const [birthDate, setBirthDate] = useState(patient.birthDate || "");
  const [address, setAddress] = useState(patient.address || "");
  const [avatarUrl, setAvatarUrl] = useState(patient.avatarUrl);

  const cityOptions = useMemo(
    () => (province ? citiesForProvince(province) : []),
    [province]
  );
  const [heightCm, setHeightCm] = useState(
    patient.heightCm != null ? String(patient.heightCm) : ""
  );
  const [weightKg, setWeightKg] = useState(
    latest?.weightKg != null ? String(latest.weightKg) : ""
  );
  const [goalWeightKg, setGoalWeightKg] = useState(
    patient.goalWeightKg != null ? String(patient.goalWeightKg) : ""
  );
  const [waistCm, setWaistCm] = useState(
    latest?.waistCm != null ? String(latest.waistCm) : ""
  );

  const previewSrc = patientAvatarSrc({ avatarUrl, gender });
  const displayName = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");

  async function onPickAvatar(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/patient-auth/upload-avatar", {
        method: "POST",
        body,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "آپلود تصویر انجام نشد.");
      }
      setAvatarUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "آپلود انجام نشد.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/patient-auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          nationalId,
          age,
          gender,
          province,
          city,
          birthDate,
          address,
          heightCm,
          weightKg,
          goalWeightKg,
          waistCm,
          avatarUrl: avatarUrl ?? "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "invalid_national_id") {
          throw new Error("کد ملی معتبر نیست.");
        }
        throw new Error("failed");
      }
      // Hard navigation so home always reloads fresh weight/goal/avatar
      window.location.assign("/patient");
      return;
    } catch (err) {
      setError(
        err instanceof Error && err.message !== "failed"
          ? err.message
          : "ذخیره انجام نشد. دوباره تلاش کنید."
      );
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100svh] bg-[#F6F8F5]">
      <div className="mx-auto w-full max-w-[430px] px-4 pb-16 pt-6">
        <Link
          href="/patient"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#14352A]/70"
        >
          <ArrowRight className="size-4" />
          بازگشت
        </Link>

        <div className="mt-6 flex flex-col items-center text-center">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="group relative size-28 overflow-hidden rounded-full bg-[#E8F2EA] shadow-[0_10px_28px_rgba(20,53,42,0.14)] ring-4 ring-white transition hover:ring-[#F0B429]/50"
            aria-label="انتخاب عکس پروفایل"
          >
            <Image
              src={previewSrc}
              alt=""
              fill
              className="object-cover"
              sizes="112px"
              unoptimized={previewSrc.endsWith(".svg")}
            />
            <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-[#14352A]/72 py-1.5 text-[10px] font-bold text-white opacity-100 transition group-hover:bg-[#14352A]/85">
              <Camera className="size-3" />
              {uploading ? "..." : "عکس"}
            </span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => void onPickAvatar(e.target.files?.[0] ?? null)}
          />
          <p className="mt-2 text-[11px] text-muted-foreground">
            اختیاری — اگر عکس نگذارید آواتار {gender === "male" ? "مرد" : "زن"} نشان داده می‌شود
          </p>

          {displayName ? (
            <p className="mt-3 text-lg font-extrabold text-[#14352A]">{displayName}</p>
          ) : null}
          {patient.phone ? (
            <p className="mt-1 text-sm font-semibold text-[#14352A]/70" dir="ltr">
              {patient.phone}
            </p>
          ) : null}
        </div>

        <p className="mt-6 text-xs font-bold tracking-wide text-[#C48A12]">
          ویرایش اطلاعات
        </p>
        <p className="mt-1 text-sm leading-7 text-[#1A2E26]/65">
          هر فیلدی را خواستید پر کنید؛ اجباری نیست. بعد از ذخیره به صفحه اصلی
          برمی‌گردید.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-4 space-y-4 rounded-[1.75rem] bg-white p-5 shadow-[0_12px_32px_rgba(20,53,42,0.08)]"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>نام</Label>
              <Input
                className={fieldClass}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>نام خانوادگی</Label>
              <Input
                className={fieldClass}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>کد ملی</Label>
            <DigitsInput
              mode="integer"
              className={fieldClass}
              value={nationalId}
              onValueChange={(v) => setNationalId(v.slice(0, 10))}
              placeholder="۱۰ رقم"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>سن</Label>
              <DigitsInput
                mode="integer"
                className={fieldClass}
                value={age}
                onValueChange={setAge}
              />
            </div>
            <div className="space-y-1.5">
              <Label>جنسیت</Label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "female", label: "زن" },
                    { id: "male", label: "مرد" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGender(item.id)}
                    className={cn(
                      "h-12 rounded-2xl text-sm font-bold transition",
                      gender === item.id
                        ? "bg-[#14352A] text-white"
                        : "bg-[#F7F8F6] text-[#14352A]"
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label>تاریخ تولد</Label>
              {birthDate ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-[#14352A]/55"
                  onClick={() => setBirthDate("")}
                >
                  پاک کردن
                </button>
              ) : null}
            </div>
            {birthDate ? (
              <>
                <ShamsiDateInput
                  variant="birth"
                  value={birthDate}
                  onChange={(iso) => {
                    setBirthDate(iso);
                    const nextAge = ageFromIsoBirthDate(iso);
                    if (nextAge != null) setAge(String(nextAge));
                  }}
                />
                <p className="text-[11px] text-muted-foreground">
                  {formatJalaliDate(birthDate, { withMonthName: true })}
                </p>
              </>
            ) : (
              <button
                type="button"
                className="h-12 w-full rounded-2xl border border-dashed border-[#D7E2D9] text-sm font-bold text-brand"
                onClick={() => {
                  const iso = jalaliPartsToIsoDate({
                    ...todayJalaliParts(),
                    jy: todayJalaliParts().jy - 30,
                    jm: 1,
                    jd: 1,
                  });
                  setBirthDate(iso);
                  const nextAge = ageFromIsoBirthDate(iso);
                  if (nextAge != null) setAge(String(nextAge));
                }}
              >
                انتخاب تاریخ شمسی
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>استان</Label>
              <select
                className={selectClass}
                value={province}
                onChange={(e) => {
                  const next = e.target.value;
                  setProvince(next);
                  const cities = citiesForProvince(next);
                  setCity((prev) =>
                    cities.includes(prev) ? prev : cities[0] || ""
                  );
                }}
              >
                <option value="">انتخاب استان</option>
                {IRAN_PROVINCES.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>شهر</Label>
              <select
                className={selectClass}
                value={city}
                disabled={!province}
                onChange={(e) => setCity(e.target.value)}
              >
                <option value="">
                  {province ? "انتخاب شهر" : "ابتدا استان"}
                </option>
                {cityOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>آدرس</Label>
            <Input
              className={fieldClass}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="خیابان، پلاک، ..."
            />
          </div>

          <div className="rounded-2xl bg-[#F7F8F6] p-3">
            <p className="mb-3 text-xs font-bold text-[#14352A]">اندازه‌ها</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>قد (cm)</Label>
                <DigitsInput
                  mode="decimal"
                  className={fieldClass}
                  value={heightCm}
                  onValueChange={setHeightCm}
                />
              </div>
              <div className="space-y-1.5">
                <Label>وزن فعلی (kg)</Label>
                <DigitsInput
                  mode="decimal"
                  className={fieldClass}
                  value={weightKg}
                  onValueChange={setWeightKg}
                />
              </div>
              <div className="space-y-1.5">
                <Label>وزن هدف (kg)</Label>
                <DigitsInput
                  mode="decimal"
                  className={fieldClass}
                  value={goalWeightKg}
                  onValueChange={setGoalWeightKg}
                />
              </div>
              <div className="space-y-1.5">
                <Label>دور کمر (cm)</Label>
                <DigitsInput
                  mode="decimal"
                  className={fieldClass}
                  value={waistCm}
                  onValueChange={setWaistCm}
                />
              </div>
            </div>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            type="submit"
            disabled={loading || uploading}
            className="h-12 w-full rounded-full bg-[#F0B429] text-sm font-extrabold text-[#14352A] hover:bg-[#e0a61f]"
          >
            {loading ? "در حال ذخیره..." : "ذخیره و بازگشت"}
          </Button>
        </form>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DigitsInput } from "@/components/ui/digits-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Gender, Patient, ProgressMeasurement } from "@/lib/types";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-12 rounded-2xl border-[#D7E2D9] bg-white focus-visible:border-brand focus-visible:ring-brand/20";

export function PatientProfile({
  patient,
  measurements,
}: {
  patient: Patient;
  measurements: ProgressMeasurement[];
}) {
  const router = useRouter();
  const latest = measurements[measurements.length - 1];
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState(patient.firstName || "");
  const [lastName, setLastName] = useState(patient.lastName || "");
  const [age, setAge] = useState(patient.age != null ? String(patient.age) : "");
  const [gender, setGender] = useState<Gender>(patient.gender || "female");
  const [address, setAddress] = useState(patient.address || "");
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
          age,
          gender,
          address,
          heightCm,
          weightKg,
          goalWeightKg,
          waistCm,
        }),
      });
      if (!res.ok) throw new Error("failed");
      router.replace("/patient");
      router.refresh();
    } catch {
      setError("ذخیره انجام نشد. دوباره تلاش کنید.");
    } finally {
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

        <p className="mt-5 text-xs font-bold tracking-wide text-[#C48A12]">
          حساب من
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-[#14352A]">
          ویرایش اطلاعات
        </h1>
        <p className="mt-2 text-sm leading-7 text-[#1A2E26]/65">
          هر فیلدی را خواستید پر کنید؛ اجباری نیست. بعد از ذخیره به صفحه اصلی
          برمی‌گردید.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-5 space-y-4 rounded-[1.75rem] bg-white p-5 shadow-[0_12px_32px_rgba(20,53,42,0.08)]"
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
            <Label>آدرس</Label>
            <Input
              className={fieldClass}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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

          <p className="text-[11px] leading-6 text-muted-foreground" dir="ltr">
            موبایل: {patient.phone}
          </p>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <Button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-full bg-[#F0B429] text-sm font-extrabold text-[#14352A] hover:bg-[#e0a61f]"
          >
            {loading ? "در حال ذخیره..." : "ذخیره و بازگشت"}
          </Button>
        </form>
      </div>
    </div>
  );
}

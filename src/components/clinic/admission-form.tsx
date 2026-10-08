"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DigitsInput } from "@/components/ui/digits-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { parseNormalizedNumber } from "@/lib/digits";
import type { AdmissionForm, Visit } from "@/lib/types";

const fieldClass =
  "h-12 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6] px-3 text-base focus-visible:border-brand focus-visible:ring-brand/20";
const areaClass =
  "min-h-20 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6] focus-visible:border-brand focus-visible:ring-brand/20";

function numToStr(value?: number) {
  return value === undefined || value === null || Number.isNaN(value) ? "" : String(value);
}

function strToNum(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const n = parseNormalizedNumber(value);
  return Number.isFinite(n) ? n : undefined;
}

export function AdmissionFormEditor({
  visit,
  patientName,
}: {
  visit: Visit;
  patientName: string;
}) {
  const router = useRouter();
  const initial = visit.admission ?? {};
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<AdmissionForm>({
    heightCm: initial.heightCm,
    weightKg: initial.weightKg,
    goalWeightKg: initial.goalWeightKg,
    waistCm: initial.waistCm,
    hipCm: initial.hipCm,
    bloodPressure: initial.bloodPressure ?? "",
    activityLevel: initial.activityLevel ?? "medium",
    previousDiets: initial.previousDiets ?? "",
    medicalHistory: initial.medicalHistory ?? "",
    medications: initial.medications ?? "",
    allergies: initial.allergies ?? "",
    chiefComplaint: initial.chiefComplaint ?? "",
    therapistNotes: initial.therapistNotes ?? "",
  });

  function setField<K extends keyof AdmissionForm>(key: K, value: AdmissionForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/visits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: visit.id,
          status: "admitted",
          admission: {
            ...form,
            heightCm: form.heightCm ? Number(form.heightCm) : undefined,
            weightKg: form.weightKg ? Number(form.weightKg) : undefined,
            goalWeightKg: form.goalWeightKg ? Number(form.goalWeightKg) : undefined,
            waistCm: form.waistCm ? Number(form.waistCm) : undefined,
            hipCm: form.hipCm ? Number(form.hipCm) : undefined,
          },
        }),
      });

      if (!res.ok) throw new Error("failed");
      router.push("/clinic/reception/admitted");
      router.refresh();
    } catch {
      setError("ذخیره فرم پذیرش انجام نشد.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="rounded-[28px] bg-[#E8F2EA] px-5 py-4">
        <p className="text-xs text-muted-foreground">فرم پذیرش تخصصی برای</p>
        <p className="mt-1 text-lg font-extrabold text-brand">{patientName}</p>
      </div>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6">
        <h3 className="mb-4 text-sm font-bold text-brand">اندازه‌ها و وضعیت بدنی</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>قد (cm)</Label>
            <DigitsInput
              mode="decimal"
              className={fieldClass}
              value={numToStr(form.heightCm)}
              onValueChange={(v) => setField("heightCm", strToNum(v))}
            />
          </div>
          <div className="space-y-2">
            <Label>وزن فعلی (kg)</Label>
            <DigitsInput
              mode="decimal"
              className={fieldClass}
              value={numToStr(form.weightKg)}
              onValueChange={(v) => setField("weightKg", strToNum(v))}
            />
          </div>
          <div className="space-y-2">
            <Label>وزن هدف (kg)</Label>
            <DigitsInput
              mode="decimal"
              className={fieldClass}
              value={numToStr(form.goalWeightKg)}
              onValueChange={(v) => setField("goalWeightKg", strToNum(v))}
            />
          </div>
          <div className="space-y-2">
            <Label>دور کمر (cm)</Label>
            <DigitsInput
              mode="decimal"
              className={fieldClass}
              value={numToStr(form.waistCm)}
              onValueChange={(v) => setField("waistCm", strToNum(v))}
            />
          </div>
          <div className="space-y-2">
            <Label>دور باسن (cm)</Label>
            <DigitsInput
              mode="decimal"
              className={fieldClass}
              value={numToStr(form.hipCm)}
              onValueChange={(v) => setField("hipCm", strToNum(v))}
            />
          </div>
          <div className="space-y-2">
            <Label>فشار خون</Label>
            <Input
              className={fieldClass}
              placeholder="مثلاً ۱۲/۸"
              value={form.bloodPressure ?? ""}
              onChange={(e) => setField("bloodPressure", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-3">
            <Label>سطح فعالیت</Label>
            <select
              className={`w-full ${fieldClass}`}
              value={form.activityLevel ?? "medium"}
              onChange={(e) =>
                setField("activityLevel", e.target.value as AdmissionForm["activityLevel"])
              }
            >
              <option value="low">کم</option>
              <option value="medium">متوسط</option>
              <option value="high">زیاد</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6">
        <h3 className="text-sm font-bold text-brand">سابقه و هدف درمان</h3>
        <div className="space-y-2">
          <Label>شکایت اصلی / هدف مراجعه</Label>
          <Textarea
            className={areaClass}
            value={form.chiefComplaint ?? ""}
            onChange={(e) => setField("chiefComplaint", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>سابقه رژیم‌های قبلی</Label>
          <Textarea
            className={areaClass}
            value={form.previousDiets ?? ""}
            onChange={(e) => setField("previousDiets", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>سابقه بیماری</Label>
          <Textarea
            className={areaClass}
            value={form.medicalHistory ?? ""}
            onChange={(e) => setField("medicalHistory", e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>داروهای مصرفی</Label>
            <Textarea
              className={areaClass}
              value={form.medications ?? ""}
              onChange={(e) => setField("medications", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>حساسیت‌ها</Label>
            <Textarea
              className={areaClass}
              value={form.allergies ?? ""}
              onChange={(e) => setField("allergies", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>یادداشت کارشناس</Label>
          <Textarea
            className={`${areaClass} min-h-24`}
            value={form.therapistNotes ?? ""}
            onChange={(e) => setField("therapistNotes", e.target.value)}
          />
        </div>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="h-12 rounded-2xl bg-[#D86B5C] px-6 font-semibold text-white hover:bg-[#D86B5C]/90"
        >
          {loading ? "در حال ذخیره..." : "تکمیل پذیرش"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-2xl"
          onClick={() => router.push("/clinic/reception/visitors")}
        >
          بعداً تکمیل می‌کنم
        </Button>
      </div>
    </form>
  );
}

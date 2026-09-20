"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdmissionForm, Visit } from "@/lib/types";

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
    <form
      onSubmit={onSubmit}
      className="space-y-6 rounded-3xl border border-border/80 bg-card/90 p-5 shadow-sm sm:p-8"
    >
      <div className="rounded-2xl bg-brand-soft/70 px-4 py-3">
        <p className="text-sm text-muted-foreground">فرم پذیرش تخصصی برای</p>
        <p className="text-lg font-bold text-brand">{patientName}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label>قد (سانتی‌متر)</Label>
          <Input
            type="number"
            className="h-11 rounded-xl"
            value={form.heightCm ?? ""}
            onChange={(e) => setField("heightCm", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div className="space-y-2">
          <Label>وزن فعلی (کیلوگرم)</Label>
          <Input
            type="number"
            className="h-11 rounded-xl"
            value={form.weightKg ?? ""}
            onChange={(e) => setField("weightKg", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div className="space-y-2">
          <Label>وزن هدف</Label>
          <Input
            type="number"
            className="h-11 rounded-xl"
            value={form.goalWeightKg ?? ""}
            onChange={(e) =>
              setField("goalWeightKg", e.target.value ? Number(e.target.value) : undefined)
            }
          />
        </div>
        <div className="space-y-2">
          <Label>دور کمر</Label>
          <Input
            type="number"
            className="h-11 rounded-xl"
            value={form.waistCm ?? ""}
            onChange={(e) => setField("waistCm", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div className="space-y-2">
          <Label>دور باسن</Label>
          <Input
            type="number"
            className="h-11 rounded-xl"
            value={form.hipCm ?? ""}
            onChange={(e) => setField("hipCm", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div className="space-y-2">
          <Label>فشار خون</Label>
          <Input
            className="h-11 rounded-xl"
            placeholder="مثلاً ۱۲/۸"
            value={form.bloodPressure ?? ""}
            onChange={(e) => setField("bloodPressure", e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-3">
          <Label>سطح فعالیت</Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-transparent px-3"
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

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>شکایت اصلی / هدف مراجعه</Label>
          <Textarea
            className="min-h-20 rounded-xl"
            value={form.chiefComplaint ?? ""}
            onChange={(e) => setField("chiefComplaint", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>سابقه رژیم‌های قبلی</Label>
          <Textarea
            className="min-h-20 rounded-xl"
            value={form.previousDiets ?? ""}
            onChange={(e) => setField("previousDiets", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>سابقه بیماری</Label>
          <Textarea
            className="min-h-20 rounded-xl"
            value={form.medicalHistory ?? ""}
            onChange={(e) => setField("medicalHistory", e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>داروهای مصرفی</Label>
            <Textarea
              className="min-h-20 rounded-xl"
              value={form.medications ?? ""}
              onChange={(e) => setField("medications", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>حساسیت‌ها</Label>
            <Textarea
              className="min-h-20 rounded-xl"
              value={form.allergies ?? ""}
              onChange={(e) => setField("allergies", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>یادداشت کارشناس</Label>
          <Textarea
            className="min-h-24 rounded-xl"
            value={form.therapistNotes ?? ""}
            onChange={(e) => setField("therapistNotes", e.target.value)}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={loading}
          className="h-12 rounded-xl bg-cta px-6 text-cta-foreground hover:bg-cta/90"
        >
          {loading ? "در حال ذخیره..." : "تکمیل پذیرش و انتقال به لیست پذیرش‌شده‌ها"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-12 rounded-xl"
          onClick={() => router.push("/clinic/reception/visitors")}
        >
          بعداً تکمیل می‌کنم
        </Button>
      </div>
    </form>
  );
}

"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, PencilLine, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DigitsInput } from "@/components/ui/digits-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatDateFa,
  genderLabel,
  patientFullName,
  type Gender,
  type Patient,
  type ProgressMeasurement,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-12 rounded-2xl border-[#D7E2D9] bg-white focus-visible:border-brand focus-visible:ring-brand/20";

function missingFields(patient: Patient, latest?: ProgressMeasurement) {
  const gaps: string[] = [];
  if (!patient.firstName?.trim()) gaps.push("نام");
  if (!patient.lastName?.trim()) gaps.push("نام خانوادگی");
  if (patient.age == null) gaps.push("سن");
  if (!patient.heightCm) gaps.push("قد");
  if (!patient.goalWeightKg) gaps.push("وزن هدف");
  if (!patient.address?.trim()) gaps.push("آدرس");
  if (!latest?.weightKg) gaps.push("وزن فعلی");
  if (!latest?.waistCm) gaps.push("دور کمر");
  return gaps;
}

export function PatientProfile({
  patient: initialPatient,
  measurements: initialMeasurements,
}: {
  patient: Patient;
  measurements: ProgressMeasurement[];
}) {
  const router = useRouter();
  const [patient, setPatient] = useState(initialPatient);
  const [measurements, setMeasurements] = useState(initialMeasurements);
  const latest = measurements[measurements.length - 1];
  const gaps = useMemo(
    () => missingFields(patient, latest),
    [patient, latest]
  );
  const [editing, setEditing] = useState(gaps.length > 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

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
    setOk("");
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
      const data = await res.json();
      setPatient(data.patient);
      setMeasurements(data.measurements ?? []);
      setEditing(false);
      setOk("اطلاعات ذخیره شد و در پنل کلینیک هم به‌روز می‌شود.");
      router.refresh();
    } catch {
      setError("ذخیره انجام نشد. نام و نام خانوادگی الزامی است.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100svh] bg-[#F6F8F5]">
      <div className="mx-auto w-full max-w-[430px] px-4 pb-16 pt-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/patient"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#14352A]/70"
          >
            <ArrowRight className="size-4" />
            بازگشت
          </Link>
          {!editing ? (
            <button
              type="button"
              onClick={() => {
                setEditing(true);
                setOk("");
                setError("");
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#14352A] px-3 py-1.5 text-xs font-bold text-white"
            >
              <PencilLine className="size-3.5" />
              ویرایش
            </button>
          ) : null}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#E8F2EA] text-[#14352A]">
            <UserRound className="size-6" />
          </span>
          <div>
            <p className="text-xs font-bold tracking-wide text-[#C48A12]">
              پروفایل من
            </p>
            <h1 className="text-2xl font-extrabold text-[#14352A]">
              {patientFullName(patient) || "اطلاعات کاربر"}
            </h1>
          </div>
        </div>

        {gaps.length > 0 ? (
          <div className="mt-4 rounded-2xl bg-[#FFF4D6] px-4 py-3 text-sm leading-7 text-[#9A6B10]">
            این موارد هنوز کامل نیست: {gaps.join("، ")}. با تکمیل آن‌ها پرونده‌تان
            در کلینیک هم کامل‌تر می‌شود.
          </div>
        ) : null}

        {!editing ? (
          <section className="mt-5 space-y-3 rounded-[1.75rem] bg-white p-5 shadow-[0_12px_32px_rgba(20,53,42,0.08)]">
            <InfoRow label="موبایل" value={patient.phone} ltr />
            <InfoRow label="نام و نام خانوادگی" value={patientFullName(patient) || "—"} />
            <InfoRow
              label="سن / جنسیت"
              value={`${patient.age != null ? patient.age : "—"} · ${genderLabel(patient.gender)}`}
            />
            <InfoRow
              label="قد"
              value={patient.heightCm != null ? `${patient.heightCm} cm` : "—"}
            />
            <InfoRow
              label="وزن فعلی"
              value={latest?.weightKg != null ? `${latest.weightKg} kg` : "—"}
            />
            <InfoRow
              label="وزن هدف"
              value={
                patient.goalWeightKg != null ? `${patient.goalWeightKg} kg` : "—"
              }
            />
            <InfoRow
              label="دور کمر"
              value={latest?.waistCm != null ? `${latest.waistCm} cm` : "—"}
            />
            <InfoRow label="آدرس" value={patient.address || "—"} />
            <InfoRow
              label="آخرین به‌روزرسانی"
              value={formatDateFa(patient.updatedAt)}
            />
            <p className="pt-1 text-[11px] leading-6 text-muted-foreground">
              هر تغییری اینجا بدهید، همان لحظه در پرونده مشتری پنل مدیریت دیده
              می‌شود.
            </p>
          </section>
        ) : (
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
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>نام خانوادگی</Label>
                <Input
                  className={fieldClass}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
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

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {ok ? <p className="text-sm text-[#2F6B4F]">{ok}</p> : null}

            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={loading}
                className="h-12 flex-1 rounded-full bg-[#F0B429] text-sm font-extrabold text-[#14352A] hover:bg-[#e0a61f]"
              >
                {loading ? "در حال ذخیره..." : "ذخیره در پرونده"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                className="h-12 rounded-full px-5"
                onClick={() => {
                  setEditing(false);
                  setError("");
                }}
              >
                انصراف
              </Button>
            </div>
          </form>
        )}

        {ok && !editing ? (
          <p className="mt-4 text-center text-sm text-[#2F6B4F]">{ok}</p>
        ) : null}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  ltr,
}: {
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[#EEF1EE] pb-3 last:border-0 last:pb-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className="max-w-[60%] text-left text-sm font-semibold text-[#14352A]"
        dir={ltr ? "ltr" : undefined}
      >
        {value}
      </p>
    </div>
  );
}

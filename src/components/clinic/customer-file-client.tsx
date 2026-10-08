"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  AttendanceButtons,
  AttendanceMark,
} from "@/components/clinic/attendance-buttons";
import { Button } from "@/components/ui/button";
import { DigitsInput } from "@/components/ui/digits-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShamsiDateInput } from "@/components/ui/shamsi-date-input";
import { Textarea } from "@/components/ui/textarea";
import { jalaliPartsToIsoDate, todayJalaliParts } from "@/lib/jalali";
import {
  formatDateFa,
  formatMoney,
  patientFullName,
  visitChannelLabel,
  visitStatusLabel,
  visitTypeLabel,
  type Gender,
  type Patient,
  type ProgressMeasurement,
  type Payment,
  type Visit,
  type VisitStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-11 rounded-xl border-[#D7E2D9] bg-[#F7F8F6] focus-visible:border-brand focus-visible:ring-brand/20";

function numToStr(value?: number) {
  return value === undefined || value === null || Number.isNaN(value)
    ? ""
    : String(value);
}

export function CustomerFileClient({
  patient: initialPatient,
  initialVisits,
  measurements: initialMeasurements,
  payments,
}: {
  patient: Patient;
  initialVisits: Visit[];
  measurements: ProgressMeasurement[];
  payments: Payment[];
}) {
  const router = useRouter();
  const [patient, setPatient] = useState(initialPatient);
  const [visits, setVisits] = useState(initialVisits);
  const [measurements, setMeasurements] = useState(initialMeasurements);

  const [infoSaving, setInfoSaving] = useState(false);
  const [infoError, setInfoError] = useState("");
  const [infoOk, setInfoOk] = useState("");
  const [firstName, setFirstName] = useState(initialPatient.firstName);
  const [lastName, setLastName] = useState(initialPatient.lastName);
  const [phone, setPhone] = useState(initialPatient.phone);
  const [age, setAge] = useState(numToStr(initialPatient.age));
  const [gender, setGender] = useState<Gender>(initialPatient.gender);
  const [address, setAddress] = useState(initialPatient.address);
  const [notes, setNotes] = useState(initialPatient.notes ?? "");
  const [heightCm, setHeightCm] = useState(numToStr(initialPatient.heightCm));
  const [goalWeightKg, setGoalWeightKg] = useState(
    numToStr(initialPatient.goalWeightKg)
  );

  const [sizeSaving, setSizeSaving] = useState(false);
  const [sizeError, setSizeError] = useState("");
  const [sizeOk, setSizeOk] = useState("");
  const [recordedAt, setRecordedAt] = useState(() =>
    jalaliPartsToIsoDate(todayJalaliParts())
  );
  const [weightKg, setWeightKg] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [hipCm, setHipCm] = useState("");
  const [armCm, setArmCm] = useState("");
  const [thighCm, setThighCm] = useState("");
  const [calfCm, setCalfCm] = useState("");
  const [sizeNote, setSizeNote] = useState("");

  async function setAttendance(visitId: string, status: VisitStatus) {
    const current = visits.find((v) => v.id === visitId);
    if (!current) return;
    const next = current.status === status ? "visitor" : status;
    const previous = visits;
    setVisits((list) =>
      list.map((v) => (v.id === visitId ? { ...v, status: next } : v))
    );
    try {
      const res = await fetch("/api/visits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: visitId, status: next }),
      });
      if (!res.ok) throw new Error("fail");
      router.refresh();
    } catch {
      setVisits(previous);
    }
  }

  async function saveInfo(event: FormEvent) {
    event.preventDefault();
    setInfoSaving(true);
    setInfoError("");
    setInfoOk("");
    try {
      const res = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: patient.id,
          firstName,
          lastName,
          phone,
          age: age || null,
          gender,
          address,
          notes,
          heightCm: heightCm || null,
          goalWeightKg: goalWeightKg || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "invalid_phone") throw new Error("موبایل معتبر نیست.");
        if (data.error === "phone_exists") throw new Error("این موبایل برای مشتری دیگری ثبت شده.");
        throw new Error("ذخیره اطلاعات انجام نشد.");
      }
      setPatient(data.patient);
      setInfoOk("اطلاعات مشتری ذخیره شد و در اپ مشتری هم به‌روز می‌شود.");
      router.refresh();
    } catch (err) {
      setInfoError(err instanceof Error ? err.message : "ذخیره انجام نشد.");
    } finally {
      setInfoSaving(false);
    }
  }

  async function saveSize(event: FormEvent) {
    event.preventDefault();
    setSizeSaving(true);
    setSizeError("");
    setSizeOk("");
    try {
      const res = await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          recordedAt: new Date(recordedAt).toISOString(),
          weightKg,
          waistCm,
          hipCm: hipCm || undefined,
          armCm: armCm || undefined,
          thighCm: thighCm || undefined,
          calfCm: calfCm || undefined,
          note: sizeNote || undefined,
          heightCm: heightCm || undefined,
          goalWeightKg: goalWeightKg || undefined,
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setMeasurements((list) =>
        [...list, data.measurement].sort(
          (a, b) =>
            new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
        )
      );
      setWeightKg("");
      setWaistCm("");
      setHipCm("");
      setArmCm("");
      setThighCm("");
      setCalfCm("");
      setSizeNote("");
      setSizeOk("سایز ثبت شد و در اپ مشتری هم نمایش داده می‌شود.");
      router.refresh();
    } catch {
      setSizeError("ثبت سایز انجام نشد. وزن و دور کمر الزامی است.");
    } finally {
      setSizeSaving(false);
    }
  }

  const latest = measurements[measurements.length - 1];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">پرونده مشتری</p>
          <h1 className="mt-1 flex flex-wrap items-center gap-2 text-2xl font-extrabold text-brand">
            {patientFullName(patient) || "بدون نام"}
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                patient.source === "app"
                  ? "bg-[#EEF2FF] text-[#3B5BDB]"
                  : "bg-[#E8F2EA] text-[#2F6B4F]"
              )}
            >
              {patient.source === "app" ? "ثبت‌نام اپ" : "مراجع حضوری"}
            </span>
            {!patient.profileComplete ? (
              <span className="rounded-full bg-[#FFF4D6] px-2.5 py-0.5 text-[10px] font-bold text-[#9A6B10]">
                پروفایل ناقص
              </span>
            ) : null}
          </h1>
          {latest ? (
            <p className="mt-1 text-xs text-muted-foreground">
              آخرین سایز: {latest.weightKg} kg
              {latest.waistCm != null ? ` · کمر ${latest.waistCm} cm` : ""}
              {patient.goalWeightKg != null
                ? ` · هدف ${patient.goalWeightKg} kg`
                : ""}
            </p>
          ) : null}
          {patient.welcomeSmsSentAt ? (
            <p className="mt-1 text-[11px] text-[#2F6B4F]">
              پیامک خوشامد و لینک اپ ارسال شده
            </p>
          ) : null}
        </div>
        <Link href="/clinic/reception/customers" className="text-sm font-medium text-brand">
          بازگشت به لیست
        </Link>
      </div>

      <form
        onSubmit={saveInfo}
        className="space-y-4 rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-brand">اطلاعات مشتری</h2>
          <p className="text-[11px] text-muted-foreground">
            با اپ مشتری همگام است
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
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
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>موبایل</Label>
            <DigitsInput
              mode="phone"
              className={fieldClass}
              value={phone}
              onValueChange={setPhone}
              required
            />
          </div>
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
            <select
              className={cn(fieldClass, "w-full px-3 text-sm")}
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
            >
              <option value="female">زن</option>
              <option value="male">مرد</option>
            </select>
          </div>
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
            <Label>وزن هدف (kg)</Label>
            <DigitsInput
              mode="decimal"
              className={fieldClass}
              value={goalWeightKg}
              onValueChange={setGoalWeightKg}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>آدرس</Label>
            <Input
              className={fieldClass}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>یادداشت</Label>
            <Textarea
              className="min-h-20 rounded-xl border-[#D7E2D9] bg-[#F7F8F6]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        {infoError ? (
          <p className="text-sm text-destructive">{infoError}</p>
        ) : null}
        {infoOk ? <p className="text-sm text-[#2F6B4F]">{infoOk}</p> : null}
        <Button type="submit" disabled={infoSaving} className="rounded-full">
          {infoSaving ? "در حال ذخیره..." : "ذخیره اطلاعات مشتری"}
        </Button>
      </form>

      <form
        onSubmit={saveSize}
        className="space-y-4 rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-brand">ثبت سایز جدید</h2>
          <p className="text-[11px] text-muted-foreground">
            بلافاصله در نمودار اپ مشتری دیده می‌شود
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
            <Label>تاریخ اندازه‌گیری</Label>
            <ShamsiDateInput value={recordedAt} onChange={setRecordedAt} required />
          </div>
          <div className="space-y-1.5">
            <Label>وزن (kg) *</Label>
            <DigitsInput
              mode="decimal"
              className={fieldClass}
              value={weightKg}
              onValueChange={setWeightKg}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>دور کمر (cm) *</Label>
            <DigitsInput
              mode="decimal"
              className={fieldClass}
              value={waistCm}
              onValueChange={setWaistCm}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>دور باسن (cm)</Label>
            <DigitsInput
              mode="decimal"
              className={fieldClass}
              value={hipCm}
              onValueChange={setHipCm}
            />
          </div>
          <div className="space-y-1.5">
            <Label>دور بازو (cm)</Label>
            <DigitsInput
              mode="decimal"
              className={fieldClass}
              value={armCm}
              onValueChange={setArmCm}
            />
          </div>
          <div className="space-y-1.5">
            <Label>دور ران (cm)</Label>
            <DigitsInput
              mode="decimal"
              className={fieldClass}
              value={thighCm}
              onValueChange={setThighCm}
            />
          </div>
          <div className="space-y-1.5">
            <Label>دور ساق (cm)</Label>
            <DigitsInput
              mode="decimal"
              className={fieldClass}
              value={calfCm}
              onValueChange={setCalfCm}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <Label>یادداشت جلسه</Label>
            <Input
              className={fieldClass}
              value={sizeNote}
              onChange={(e) => setSizeNote(e.target.value)}
              placeholder="مثلاً هفته چهارم رژیم"
            />
          </div>
        </div>
        {sizeError ? (
          <p className="text-sm text-destructive">{sizeError}</p>
        ) : null}
        {sizeOk ? <p className="text-sm text-[#2F6B4F]">{sizeOk}</p> : null}
        <Button type="submit" disabled={sizeSaving} className="rounded-full">
          {sizeSaving ? "در حال ثبت..." : "ثبت سایز در پرونده و اپ مشتری"}
        </Button>
      </form>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
        <h2 className="text-sm font-bold text-brand">تاریخچه اندازه‌گیری‌ها</h2>
        {measurements.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">اندازه‌گیری ثبت نشده.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {[...measurements].reverse().map((m) => (
              <li key={m.id} className="rounded-2xl bg-[#F7F8F6] px-3 py-3 text-sm">
                <p className="font-semibold">{formatDateFa(m.recordedAt)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  وزن {m.weightKg} kg
                  {m.waistCm != null ? ` · کمر ${m.waistCm} cm` : ""}
                  {m.hipCm != null ? ` · باسن ${m.hipCm} cm` : ""}
                  {m.armCm != null ? ` · بازو ${m.armCm} cm` : ""}
                  {m.thighCm != null ? ` · ران ${m.thighCm} cm` : ""}
                  {m.calfCm != null ? ` · ساق ${m.calfCm} cm` : ""}
                </p>
                {m.note ? (
                  <p className="mt-1 text-xs text-muted-foreground">{m.note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
        <h2 className="text-sm font-bold text-brand">مراجعات (ویزیت / تلفنی)</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          تیک سبز = مراجعه کرد · ضربدر قرمز = نیامد / لغو
        </p>
        {visits.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">مراجعه‌ای ثبت نشده.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {visits.map((visit) => (
              <li
                key={visit.id}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm",
                  visit.status === "cancelled"
                    ? "bg-[#F3F3F3]"
                    : visit.status === "completed" || visit.status === "admitted"
                      ? "bg-[#F2FBF4]"
                      : "bg-[#F7F8F6]"
                )}
              >
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    <AttendanceMark status={visit.status} />
                    {visitTypeLabel(visit.visitType)} · {visitChannelLabel(visit.channel)} ·{" "}
                    {visitStatusLabel(visit.status)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateFa(visit.visitDate)}
                    {visit.visitTime ? ` · ${visit.visitTime}` : ""}
                    {visit.packageName ? ` · ${visit.packageName}` : ""}
                  </p>
                </div>
                <AttendanceButtons
                  status={visit.status}
                  withLabels
                  onChange={(status) => setAttendance(visit.id, status)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
        <h2 className="text-sm font-bold text-brand">پرداخت‌ها</h2>
        {payments.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">پرداختی ثبت نشده.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {payments.map((p) => (
              <li key={p.id} className="rounded-2xl bg-[#F7F8F6] px-3 py-3 text-sm">
                <p className="font-semibold">{p.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatMoney(p.paidAmount)} از {formatMoney(p.amount)} ·{" "}
                  {formatDateFa(p.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

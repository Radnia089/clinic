"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
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
import { citiesForProvince, IRAN_PROVINCES } from "@/lib/iran-locations";
import {
  ageFromIsoBirthDate,
  formatJalaliDate,
  jalaliPartsToIsoDate,
  todayJalaliParts,
} from "@/lib/jalali";
import Image from "next/image";
import {
  formatDateFa,
  formatMoney,
  avatarImageUnoptimized,
  patientAvatarSrc,
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
import {
  isVisitSessionAllowed,
  nextVisitSession,
  visitSessionChoices,
  visitSessionTitle,
} from "@/lib/visit-sessions";
import { RecordPhotosCard } from "@/components/clinic/record-photos-card";

const fieldClass =
  "h-11 rounded-xl border-[#D7E2D9] bg-[#F7F8F6] focus-visible:border-brand focus-visible:ring-brand/20";

const selectClass =
  "h-11 w-full rounded-xl border border-[#D7E2D9] bg-[#F7F8F6] px-3 text-sm outline-none focus:border-brand focus:ring-3 focus:ring-brand/20";

function SizeField({
  label,
  english,
  value,
  onChange,
  required,
}: {
  label: string;
  english?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        className={
          english
            ? "w-full flex-row items-baseline justify-start gap-x-2 text-right sm:flex-col sm:items-stretch sm:gap-0.5"
            : undefined
        }
      >
        <span className="text-right">{label}</span>
        {english ? (
          <span dir="ltr" className="text-right text-[11px] font-medium text-muted-foreground sm:block sm:w-full">
            {english}
          </span>
        ) : null}
      </Label>
      <DigitsInput
        mode="decimal"
        className={fieldClass}
        value={value}
        onValueChange={onChange}
        required={required}
      />
    </div>
  );
}

function measurementSummary(m: ProgressMeasurement) {
  const parts: string[] = [];
  const add = (label: string, value?: number, unit = "") => {
    if (value == null) return;
    parts.push(`${label} ${value}${unit}`);
  };
  if (m.sessionLabel) parts.push(`جلسه ${m.sessionLabel}`);
  add("وزن", m.weightKg, " kg");
  add("قد", m.heightCm);
  add("BMI", m.bmi);
  add("چربی", m.bodyFatPct);
  add("عضله", m.muscleMassKg, " kg");
  add("احشایی", m.visceralFat);
  add("سوخت‌وساز", m.rmr);
  add("بازو راست", m.armRightCm ?? m.armCm);
  add("بازو چپ", m.armLeftCm);
  add("سینه", m.chestCm);
  add("شکم بالای ناف", m.waistCm);
  add("شکم پایین ناف", m.waistBelowCm);
  add("باسن", m.hipCm);
  add("ران راست", m.thighRightCm ?? m.thighCm);
  add("ران چپ", m.thighLeftCm);
  add("زانوی راست", m.kneeRightCm);
  add("زانوی چپ", m.kneeLeftCm);
  add("ساق راست", m.calfRightCm ?? m.calfCm);
  add("ساق چپ", m.calfLeftCm);
  return parts.join(" · ");
}

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
  recordPhotos,
}: {
  patient: Patient;
  initialVisits: Visit[];
  measurements: ProgressMeasurement[];
  payments: Payment[];
  recordPhotos: Array<{ id: string }>;
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
  const [nationalId, setNationalId] = useState(initialPatient.nationalId || "");
  const [age, setAge] = useState(numToStr(initialPatient.age));
  const [gender, setGender] = useState<Gender>(initialPatient.gender);
  const [province, setProvince] = useState(initialPatient.province || "");
  const [city, setCity] = useState(initialPatient.city || "");
  const [birthDate, setBirthDate] = useState(initialPatient.birthDate || "");
  const [education, setEducation] = useState(initialPatient.education || "");
  const [maritalStatus, setMaritalStatus] = useState(initialPatient.maritalStatus || "");
  const [occupation, setOccupation] = useState(initialPatient.occupation || "");
  const [address, setAddress] = useState(initialPatient.address);
  const [notes, setNotes] = useState(initialPatient.notes ?? "");
  const [heightCm, setHeightCm] = useState(numToStr(initialPatient.heightCm));
  const [goalWeightKg, setGoalWeightKg] = useState(
    numToStr(initialPatient.goalWeightKg)
  );
  const cityOptions = useMemo(
    () => (province ? citiesForProvince(province) : []),
    [province]
  );

  const [sizeSaving, setSizeSaving] = useState(false);
  const [sizeError, setSizeError] = useState("");
  const [sizeOk, setSizeOk] = useState("");
  const [recordedAt, setRecordedAt] = useState(() =>
    jalaliPartsToIsoDate(todayJalaliParts())
  );
  const [weightKg, setWeightKg] = useState("");
  const [sizeNote, setSizeNote] = useState("");
  const emptySize = {
    heightCm: "",
    bmi: "",
    bodyFatPct: "",
    muscleMassKg: "",
    visceralFat: "",
    rmr: "",
    armRightCm: "",
    armLeftCm: "",
    chestCm: "",
    waistCm: "",
    waistBelowCm: "",
    hipCm: "",
    thighRightCm: "",
    thighLeftCm: "",
    kneeRightCm: "",
    kneeLeftCm: "",
    calfRightCm: "",
    calfLeftCm: "",
  };
  const [sizeFields, setSizeFields] = useState(emptySize);
  const [sessionPick, setSessionPick] = useState<string | null>(null);
  const sessionLabels = useMemo(
    () => measurements.map((item) => item.sessionLabel),
    [measurements]
  );
  const nextSession = nextVisitSession(sessionLabels);
  const sessionChoices = visitSessionChoices(nextSession);
  const sessionLabel =
    sessionPick && isVisitSessionAllowed(sessionPick, sessionLabels)
      ? sessionPick
      : visitSessionTitle(nextSession);
  function setSizeField(key: keyof typeof emptySize, value: string) {
    setSizeFields((current) => ({ ...current, [key]: value }));
  }

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
          nationalId: nationalId || null,
          age: age || null,
          gender,
          province: province || null,
          city: city || null,
          birthDate: birthDate || null,
          education,
          maritalStatus,
          occupation,
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
        if (data.error === "invalid_national_id") throw new Error("کد ملی معتبر نیست.");
        if (data.error === "invalid_province") throw new Error("استان معتبر نیست.");
        if (data.error === "invalid_city") throw new Error("شهر با استان هم‌خوان نیست.");
        if (data.error === "invalid_birth_date") throw new Error("تاریخ تولد معتبر نیست.");
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
          sessionLabel,
          ...sizeFields,
          note: sizeNote || undefined,
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
      setSizeFields(emptySize);
      setSessionPick(null);
      setSizeNote("");
      setSizeOk("اندازه‌گیری ثبت شد و در اپ مشتری هم نمایش داده می‌شود.");
      router.refresh();
    } catch {
      setSizeError("ثبت اندازه‌گیری انجام نشد. وزن را وارد کنید.");
    } finally {
      setSizeSaving(false);
    }
  }

  const latest = measurements[measurements.length - 1];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-full bg-[#E8F2EA] ring-2 ring-white shadow-sm">
            <Image
              src={patientAvatarSrc(patient)}
              alt=""
              fill
              className="object-cover"
              sizes="56px"
              unoptimized={avatarImageUnoptimized(patientAvatarSrc(patient))}
            />
          </div>
          <div className="min-w-0">
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
              آخرین اندازه‌گیری: {latest.weightKg} kg
              {latest.waistCm != null ? ` · شکم بالای ناف ${latest.waistCm} cm` : ""}
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
        </div>
        <Link href="/clinic/reception/customers" className="text-sm font-medium text-brand">
          بازگشت به لیست
        </Link>
      </div>

      <RecordPhotosCard patientId={patient.id} initialPhotos={recordPhotos} />

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
            <Label>کد ملی</Label>
            <DigitsInput
              mode="integer"
              className={fieldClass}
              value={nationalId}
              onValueChange={(v) => setNationalId(v.slice(0, 10))}
              placeholder="۱۰ رقم"
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
          <div className="space-y-1.5 sm:col-span-2">
            <div className="flex items-center justify-between gap-2">
              <Label>تاریخ تولد</Label>
              {birthDate ? (
                <button
                  type="button"
                  className="text-xs text-muted-foreground"
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
                className="h-11 w-full rounded-xl border border-dashed border-[#D7E2D9] text-sm text-brand"
                onClick={() => {
                  const t = todayJalaliParts();
                  const iso = jalaliPartsToIsoDate({
                    jy: t.jy - 30,
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
          <div className="space-y-1.5">
            <Label>میزان تحصیلات</Label>
            <Input
              className={fieldClass}
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="مثلاً دیپلم، لیسانس"
            />
          </div>
          <div className="space-y-1.5">
            <Label>وضعیت تأهل</Label>
            <select
              className={selectClass}
              value={maritalStatus}
              onChange={(e) => setMaritalStatus(e.target.value)}
            >
              <option value="">انتخاب نشده</option>
              <option value="مجرد">مجرد</option>
              <option value="متاهل">متاهل</option>
            </select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>شغل</Label>
            <Input
              className={fieldClass}
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>آدرس</Label>
            <Input
              className={fieldClass}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="خیابان، پلاک، ..."
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
          <h2 className="text-sm font-bold text-brand">ثبت اندازه‌گیری</h2>
          <p className="text-[11px] text-muted-foreground">
            همان جدول آنالیز بدن و سایز پرونده کاغذی
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>تاریخ</Label>
            <ShamsiDateInput value={recordedAt} onChange={setRecordedAt} required />
          </div>
          <div className="space-y-1.5">
            <Label>جلسه</Label>
            <select
              className={selectClass}
              value={sessionChoices.includes(sessionLabel) ? sessionLabel : ""}
              onChange={(e) => setSessionPick(e.target.value)}
              required
              disabled={sessionChoices.length === 0}
            >
              {sessionChoices.map((title) => (
                <option key={title} value={title}>
                  {title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs font-bold text-[#2E9B32]">آنالیز بدن</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SizeField label="وزن (kg) *" english="Weight" value={weightKg} onChange={setWeightKg} required />
          <SizeField label="قد (cm)" english="Height" value={sizeFields.heightCm} onChange={(value) => setSizeField("heightCm", value)} />
          <SizeField label="شاخص توده بدنی" english="BMI" value={sizeFields.bmi} onChange={(value) => setSizeField("bmi", value)} />
          <SizeField label="چربی بدن" english="Body Fat" value={sizeFields.bodyFatPct} onChange={(value) => setSizeField("bodyFatPct", value)} />
          <SizeField label="توده عضلانی (kg)" english="Muscle Mass" value={sizeFields.muscleMassKg} onChange={(value) => setSizeField("muscleMassKg", value)} />
          <SizeField label="چربی احشایی" english="Visceral Fat" value={sizeFields.visceralFat} onChange={(value) => setSizeField("visceralFat", value)} />
          <SizeField label="سوخت‌وساز استراحت" english="RMR" value={sizeFields.rmr} onChange={(value) => setSizeField("rmr", value)} />
        </div>
        <p className="text-xs font-bold text-[#2E9B32]">سایز (سانتی‌متر)</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SizeField label="بازو راست" value={sizeFields.armRightCm} onChange={(value) => setSizeField("armRightCm", value)} />
          <SizeField label="بازو چپ" value={sizeFields.armLeftCm} onChange={(value) => setSizeField("armLeftCm", value)} />
          <SizeField label="دور سینه" value={sizeFields.chestCm} onChange={(value) => setSizeField("chestCm", value)} />
          <SizeField label="دور شکم بالای ناف" value={sizeFields.waistCm} onChange={(value) => setSizeField("waistCm", value)} />
          <SizeField label="دور شکم پایین ناف" value={sizeFields.waistBelowCm} onChange={(value) => setSizeField("waistBelowCm", value)} />
          <SizeField label="دور باسن" value={sizeFields.hipCm} onChange={(value) => setSizeField("hipCm", value)} />
          <SizeField label="ران راست" value={sizeFields.thighRightCm} onChange={(value) => setSizeField("thighRightCm", value)} />
          <SizeField label="ران چپ" value={sizeFields.thighLeftCm} onChange={(value) => setSizeField("thighLeftCm", value)} />
          <SizeField label="زانوی راست" value={sizeFields.kneeRightCm} onChange={(value) => setSizeField("kneeRightCm", value)} />
          <SizeField label="زانوی چپ" value={sizeFields.kneeLeftCm} onChange={(value) => setSizeField("kneeLeftCm", value)} />
          <SizeField label="ساق پای راست" value={sizeFields.calfRightCm} onChange={(value) => setSizeField("calfRightCm", value)} />
          <SizeField label="ساق پای چپ" value={sizeFields.calfLeftCm} onChange={(value) => setSizeField("calfLeftCm", value)} />
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-4">
            <Label>یادداشت جلسه</Label>
            <Input
              className={fieldClass}
              value={sizeNote}
              onChange={(e) => setSizeNote(e.target.value)}
              placeholder="مثلاً جلسه دوم رژیم"
            />
          </div>
        </div>
        {sizeError ? (
          <p className="text-sm text-destructive">{sizeError}</p>
        ) : null}
        {sizeOk ? <p className="text-sm text-[#2F6B4F]">{sizeOk}</p> : null}
        <Button type="submit" disabled={sizeSaving} className="rounded-full">
          {sizeSaving ? "در حال ثبت..." : "ثبت اندازه‌گیری در پرونده"}
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
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  {measurementSummary(m)}
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

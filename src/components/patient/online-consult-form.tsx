"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DigitsInput } from "@/components/ui/digits-input";
import { ShamsiDateInput } from "@/components/ui/shamsi-date-input";
import { MeasurementGuide } from "@/components/patient/measurement-guide";
import { jalaliPartsToIsoDate, todayJalaliParts } from "@/lib/jalali";
import type { Gender } from "@/lib/types";

export function OnlineConsultForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [armCm, setArmCm] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [hipCm, setHipCm] = useState("");
  const [thighCm, setThighCm] = useState("");
  const [calfCm, setCalfCm] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [note, setNote] = useState("");

  function resetForm() {
    setName("");
    setPhone("");
    setAge("");
    setGender("");
    setHeightCm("");
    setWeightKg("");
    setArmCm("");
    setWaistCm("");
    setHipCm("");
    setThighCm("");
    setCalfCm("");
    setPreferredDate("");
    setNote("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setState("loading");

    try {
      const res = await fetch("/api/online-consults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          age: age || undefined,
          gender: gender || undefined,
          heightCm: heightCm || undefined,
          weightKg: weightKg || undefined,
          armCm: armCm || undefined,
          waistCm: waistCm || undefined,
          hipCm: hipCm || undefined,
          thighCm: thighCm || undefined,
          calfCm: calfCm || undefined,
          preferredDate: preferredDate || undefined,
          note,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setState("success");
      resetForm();
    } catch {
      setError("ارسال درخواست انجام نشد. دوباره تلاش کنید.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-[28px] bg-white p-7 text-center shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
        <CheckCircle2 className="mx-auto size-12 text-brand" />
        <h3 className="mt-4 text-xl font-bold text-brand">درخواست ثبت شد</h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          درخواست مشاوره آنلاین شما به کلینیک رسید. پس از رزرو وقت، پیامک
          تأیید زمان تماس برایتان ارسال می‌شود.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            className="h-11 rounded-2xl bg-cta text-cta-foreground hover:bg-cta/90"
            onClick={() => setState("idle")}
          >
            ثبت درخواست دیگر
          </Button>
          <Link
            href="/patient"
            className="inline-flex h-11 items-center justify-center rounded-2xl text-sm font-medium text-brand"
          >
            بازگشت به خانه
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5 rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6"
    >
      <div className="flex items-start gap-3 rounded-2xl bg-[#E8F2EA] p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand">
          <Video className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-brand">مشاوره آنلاین تلفنی</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            مشخصات و سایزها را طبق راهنما وارد کنید تا کلینیک وقت تماس رزرو کند.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <p className="text-sm font-bold text-brand">مشخصات شما</p>
        <div className="space-y-2">
          <Label htmlFor="oc-name">نام و نام خانوادگی</Label>
          <Input
            id="oc-name"
            className="h-12 rounded-2xl"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="oc-phone">موبایل</Label>
          <DigitsInput
            id="oc-phone"
            mode="phone"
            className="h-12 rounded-2xl"
            placeholder="0913xxxxxxx"
            value={phone}
            onValueChange={setPhone}
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="oc-age">سن</Label>
            <DigitsInput
              id="oc-age"
              mode="integer"
              className="h-12 rounded-2xl"
              value={age}
              onValueChange={setAge}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oc-gender">جنسیت</Label>
            <select
              id="oc-gender"
              className="h-12 w-full rounded-2xl border border-input bg-transparent px-3 text-sm"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender | "")}
            >
              <option value="">انتخاب</option>
              <option value="female">زن</option>
              <option value="male">مرد</option>
              <option value="other">سایر</option>
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-bold text-brand">قد، وزن و سایز</p>
        <MeasurementGuide />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="oc-height">قد (سانتی‌متر)</Label>
            <DigitsInput
              id="oc-height"
              mode="decimal"
              className="h-12 rounded-2xl"
              value={heightCm}
              onValueChange={setHeightCm}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oc-weight">وزن (کیلوگرم)</Label>
            <DigitsInput
              id="oc-weight"
              mode="decimal"
              className="h-12 rounded-2xl"
              value={weightKg}
              onValueChange={setWeightKg}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oc-arm">۲ · دور بازو</Label>
            <DigitsInput
              id="oc-arm"
              mode="decimal"
              className="h-12 rounded-2xl"
              value={armCm}
              onValueChange={setArmCm}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oc-waist">۳ · دور کمر</Label>
            <DigitsInput
              id="oc-waist"
              mode="decimal"
              className="h-12 rounded-2xl"
              value={waistCm}
              onValueChange={setWaistCm}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oc-hip">۴ · دور باسن</Label>
            <DigitsInput
              id="oc-hip"
              mode="decimal"
              className="h-12 rounded-2xl"
              value={hipCm}
              onValueChange={setHipCm}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="oc-thigh">۵ · دور ران</Label>
            <DigitsInput
              id="oc-thigh"
              mode="decimal"
              className="h-12 rounded-2xl"
              value={thighCm}
              onValueChange={setThighCm}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="oc-calf">۶ · دور ساق</Label>
            <DigitsInput
              id="oc-calf"
              mode="decimal"
              className="h-12 rounded-2xl"
              value={calfCm}
              onValueChange={setCalfCm}
            />
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-bold text-brand">زمان پیشنهادی</p>
        <div className="space-y-2">
          <Label>تاریخ پیشنهادی شمسی (اختیاری)</Label>
          {preferredDate ? (
            <>
              <ShamsiDateInput value={preferredDate} onChange={setPreferredDate} />
              <button
                type="button"
                className="text-xs text-muted-foreground"
                onClick={() => setPreferredDate("")}
              >
                پاک کردن تاریخ
              </button>
            </>
          ) : (
            <button
              type="button"
              className="h-12 w-full rounded-2xl border border-dashed border-[#D7E2D9] text-sm text-brand"
              onClick={() =>
                setPreferredDate(jalaliPartsToIsoDate(todayJalaliParts()))
              }
            >
              انتخاب تاریخ شمسی
            </button>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="oc-note">توضیح یا هدف شما</Label>
          <Textarea
            id="oc-note"
            className="min-h-24 rounded-2xl"
            placeholder="مثلاً هدف کاهش وزن، سابقه رژیم، سوال خاص..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="submit"
        disabled={state === "loading"}
        className="h-12 w-full rounded-2xl bg-cta text-cta-foreground hover:bg-cta/90"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="animate-spin" />
            در حال ارسال...
          </>
        ) : (
          "ارسال درخواست مشاوره آنلاین"
        )}
      </Button>
    </form>
  );
}

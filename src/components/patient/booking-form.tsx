"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShamsiDateInput } from "@/components/ui/shamsi-date-input";
import { DigitsInput } from "@/components/ui/digits-input";
import { isValidIranMobile } from "@/lib/digits";
import { jalaliPartsToIsoDate, todayJalaliParts } from "@/lib/jalali";
import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AppointmentRequest } from "@/lib/types";

const services = ["ویزیت", "مشاوره دستگاه لاغری"];

export const PATIENT_LAST_BOOKING_KEY = "tandis_last_clinic_booking";

export function saveLastClinicBooking(appointment: AppointmentRequest) {
  try {
    localStorage.setItem(PATIENT_LAST_BOOKING_KEY, JSON.stringify(appointment));
  } catch {
    /* ignore */
  }
}

export function readLastClinicBooking(): AppointmentRequest | null {
  try {
    const raw = localStorage.getItem(PATIENT_LAST_BOOKING_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppointmentRequest;
  } catch {
    return null;
  }
}

export function PatientBookingForm() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState(services[0]);
  const [preferredDate, setPreferredDate] = useState("");
  const [note, setNote] = useState("");

  function handlePhoneChange(value: string) {
    setPhone(value);
    if (phoneError) setPhoneError("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setPhoneError("");

    if (!isValidIranMobile(phone)) {
      setPhoneError(
        "شماره موبایل را درست وارد کنید؛ باید ۱۱ رقم و با ۰۹ شروع شود."
      );
      setState("idle");
      return;
    }

    setState("loading");

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          service,
          preferredDate: preferredDate || undefined,
          note,
          channel: "clinic",
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        if (data?.error === "invalid_phone") {
          setPhoneError(
            "شماره موبایل را درست وارد کنید؛ باید ۱۱ رقم و با ۰۹ شروع شود."
          );
          setState("idle");
          return;
        }
        if (data?.error === "invalid_name") {
          setError("نام و نام خانوادگی را کامل وارد کنید.");
          setState("error");
          return;
        }
        throw new Error("failed");
      }
      const data = (await res.json()) as { appointment: AppointmentRequest };
      saveLastClinicBooking(data.appointment);
      setState("success");
      setName("");
      setPhone("");
      setService(services[0]);
      setPreferredDate("");
      setNote("");
    } catch {
      setError("ارسال درخواست انجام نشد. دوباره تلاش کنید.");
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="rounded-[28px] bg-white p-7 text-center shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
        <CheckCircle2 className="mx-auto size-12 text-brand" />
        <h3 className="mt-4 text-xl font-bold text-brand">نوبت حضوری ثبت شد</h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          درخواست مراجعه حضوری شما به کلینیک رسید. همکاران تندیس برای هماهنگی
          زمان با شما تماس می‌گیرند.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            className="h-11 rounded-2xl bg-cta text-cta-foreground hover:bg-cta/90"
            onClick={() => router.push("/patient")}
          >
            مشاهده در صفحه اصلی
          </Button>
          <button
            type="button"
            className="h-11 text-sm font-medium text-brand"
            onClick={() => setState("idle")}
          >
            ثبت نوبت حضوری دیگر
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6"
    >
      <div className="flex items-start gap-3 rounded-2xl bg-[#E8F2EA] p-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-brand">
          <MapPin className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-brand">رزرو نوبت حضوری</p>
          <p className="mt-1 text-xs leading-6 text-muted-foreground">
            برای مراجعه به کلینیک تندیس یزد وقت بگیرید. بعد از تأیید فرم، درخواست
            برای پذیرش ارسال می‌شود.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pname">نام و نام خانوادگی</Label>
        <Input
          id="pname"
          className="h-12 rounded-2xl"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pphone">موبایل</Label>
        <DigitsInput
          id="pphone"
          mode="phone"
          className={cn(
            "h-12 rounded-2xl",
            phoneError && "border-destructive focus-visible:ring-destructive/30"
          )}
          placeholder="0913xxxxxxx"
          value={phone}
          onValueChange={handlePhoneChange}
          aria-invalid={phoneError ? true : undefined}
          aria-describedby={phoneError ? "pphone-error" : undefined}
          required
        />
        {phoneError ? (
          <p id="pphone-error" className="text-sm text-destructive" role="alert">
            {phoneError}
          </p>
        ) : (
          <p className="text-[11px] text-muted-foreground">
            مثال: ۰۹۱۳xxxxxxx — یازده رقم، شروع با ۰۹
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="pservice">خدمت حضوری</Label>
        <select
          id="pservice"
          className="h-12 w-full rounded-2xl border border-input bg-transparent px-3 text-sm"
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          {services.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label>تاریخ پیشنهادی شمسی</Label>
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
        <Label htmlFor="pnote">توضیح</Label>
        <Textarea
          id="pnote"
          className="min-h-24 rounded-2xl"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="submit"
        disabled={state === "loading"}
        className="h-12 w-full rounded-2xl bg-cta text-cta-foreground hover:bg-cta/90"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="animate-spin" />
            در حال تأیید...
          </>
        ) : (
          "تأیید و رزرو نوبت حضوری"
        )}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        برای مشاوره تلفنی از{" "}
        <Link href="/patient/consult" className="font-medium text-brand">
          مشاوره آنلاین
        </Link>{" "}
        استفاده کنید.
      </p>
    </form>
  );
}

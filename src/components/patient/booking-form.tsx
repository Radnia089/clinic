"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShamsiDateInput } from "@/components/ui/shamsi-date-input";
import { DigitsInput } from "@/components/ui/digits-input";
import { jalaliPartsToIsoDate, todayJalaliParts } from "@/lib/jalali";
import { CheckCircle2, Loader2 } from "lucide-react";

const services = [
  "مشاوره اولیه",
  "ویزیت رژیم درمانی",
  "پکیج لاغری",
  "پیگیری هفتگی",
];

export function PatientBookingForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState(services[0]);
  const [preferredDate, setPreferredDate] = useState("");
  const [note, setNote] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
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
        }),
      });
      if (!res.ok) throw new Error("failed");
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
      <div className="rounded-3xl border border-border/80 bg-card/90 p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto size-12 text-brand" />
        <h3 className="mt-4 text-xl font-bold text-brand">درخواست نوبت ثبت شد</h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          همکاران کلینیک تندیس به‌زودی برای هماهنگی زمان با شما تماس می‌گیرند.
        </p>
        <Button className="mt-6 rounded-xl" variant="outline" onClick={() => setState("idle")}>
          ثبت درخواست دیگر
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-3xl border border-border/80 bg-card/90 p-5 shadow-sm sm:p-8"
    >
      <div className="space-y-2">
        <Label htmlFor="pname">نام و نام خانوادگی</Label>
        <Input
          id="pname"
          className="h-11 rounded-xl"
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
          className="h-11 rounded-xl"
          placeholder="0913xxxxxxx"
          value={phone}
          onValueChange={setPhone}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pservice">خدمت مورد نظر</Label>
        <select
          id="pservice"
          className="h-11 w-full rounded-xl border border-input bg-transparent px-3"
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
            className="h-11 w-full rounded-xl border border-dashed border-[#D7E2D9] text-sm text-brand"
            onClick={() => setPreferredDate(jalaliPartsToIsoDate(todayJalaliParts()))}
          >
            انتخاب تاریخ شمسی
          </button>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="pnote">توضیح</Label>
        <Textarea
          id="pnote"
          className="min-h-24 rounded-xl"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button
        type="submit"
        disabled={state === "loading"}
        className="h-12 w-full rounded-xl bg-cta text-cta-foreground hover:bg-cta/90"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="animate-spin" />
            در حال ارسال...
          </>
        ) : (
          "ارسال درخواست نوبت"
        )}
      </Button>
    </form>
  );
}

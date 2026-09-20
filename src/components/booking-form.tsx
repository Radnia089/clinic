"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Loader2 } from "lucide-react";

const serviceOptions = [
  "مشاوره اولیه رایگان",
  "برنامه تخصصی کاهش وزن",
  "تغذیه درمانی",
  "پیگیری هفتگی",
];

type FormState = "idle" | "loading" | "success" | "error";

export function BookingForm() {
  const [state, setState] = useState<FormState>("idle");
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [service, setService] = useState(serviceOptions[0]);
  const [note, setNote] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (name.trim().length < 2) {
      setError("لطفاً نام خود را کامل وارد کنید.");
      setState("error");
      return;
    }

    const normalizedPhone = phone.replace(/\s|-/g, "");
    if (!/^09\d{9}$/.test(normalizedPhone)) {
      setError("شماره موبایل معتبر نیست. مثال: ۰۹۱۳۱۲۳۴۵۶۷");
      setState("error");
      return;
    }

    setState("loading");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: normalizedPhone,
          service,
          note: note.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("request failed");
      }

      setState("success");
      setName("");
      setPhone("");
      setService(serviceOptions[0]);
      setNote("");
    } catch {
      setError("ثبت نوبت انجام نشد. لطفاً دوباره تلاش کنید یا تماس بگیرید.");
      setState("error");
    }
  }

  return (
    <section id="booking" className="yazd-grain scroll-mt-8 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold tracking-tight text-brand sm:text-4xl">
            رزرو نوبت مشاوره
          </h2>
          <p className="mt-3 text-base leading-8 text-muted-foreground sm:text-lg">
            فرم را پر کنید؛ همکاران ما در کوتاه‌ترین زمان برای هماهنگی زمان مراجعه تماس
            می‌گیرند.
          </p>
        </div>

        <Card className="mt-10 max-w-xl border-none bg-card/90 shadow-none ring-1 ring-border">
          <CardHeader>
            <CardTitle className="text-xl">درخواست نوبت</CardTitle>
            <CardDescription>
              اطلاعات شما فقط برای هماهنگی نوبت استفاده می‌شود.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {state === "success" ? (
              <div className="flex flex-col items-start gap-4 py-4" role="status">
                <CheckCircle2 className="size-10 text-primary" aria-hidden />
                <div>
                  <p className="text-lg font-semibold text-foreground">
                    درخواست شما ثبت شد
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted-foreground">
                    به‌زودی از طرف کلینیک تندیس یزد با شما تماس گرفته می‌شود.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-xl"
                  onClick={() => setState("idle")}
                >
                  ثبت درخواست جدید
                </Button>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-5" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="name">نام و نام خانوادگی</Label>
                  <Input
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 rounded-xl text-base"
                    placeholder="مثلاً سارا محمدی"
                    autoComplete="name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">موبایل</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-11 rounded-xl text-left text-base"
                    placeholder="0913xxxxxxx"
                    autoComplete="tel"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">نوع خدمت</Label>
                  <select
                    id="service"
                    name="service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="h-11 w-full rounded-xl border border-input bg-transparent px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    {serviceOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note">توضیح کوتاه (اختیاری)</Label>
                  <Textarea
                    id="note"
                    name="note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-24 rounded-xl text-base"
                    placeholder="هدف یا سوال خود را بنویسید..."
                  />
                </div>

                {error ? (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  disabled={state === "loading"}
                  className="h-12 w-full rounded-xl bg-cta text-base text-cta-foreground hover:bg-cta/90"
                >
                  {state === "loading" ? (
                    <>
                      <Loader2 className="animate-spin" />
                      در حال ثبت...
                    </>
                  ) : (
                    "ارسال درخواست نوبت"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

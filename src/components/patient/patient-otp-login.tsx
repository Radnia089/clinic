"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Smartphone } from "lucide-react";
import { DigitsInput } from "@/components/ui/digits-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PatientOtpLogin() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function requestOtp(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/patient-auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "invalid_phone") throw new Error("شماره موبایل معتبر نیست.");
        throw new Error("ارسال کد انجام نشد. دوباره تلاش کنید.");
      }
      setDevCode(data.devCode);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ارسال کد");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/patient-auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "invalid") throw new Error("کد نادرست است.");
        if (data.error === "expired") throw new Error("کد منقضی شده. دوباره درخواست دهید.");
        throw new Error("ورود انجام نشد.");
      }
      if (data.needsProfile) {
        router.replace("/patient/complete-profile");
      } else {
        router.replace("/patient");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا در ورود");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#14352A] text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(240,180,41,0.35), transparent 50%), radial-gradient(ellipse at 90% 80%, rgba(232,242,234,0.18), transparent 45%)",
        }}
      />
      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[430px] flex-col px-5 pb-10 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-white/70 transition hover:text-white"
        >
          <ArrowLeft className="size-4" />
          بازگشت به سایت
        </Link>

        <div className="mt-10 flex flex-col items-center text-center">
          <div className="rounded-2xl bg-white px-3 py-2 shadow-lg">
            <Image
              src="/tandis-logo.png"
              alt="تندیس"
              width={140}
              height={58}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
          <p className="mt-5 text-sm font-semibold tracking-wide text-[#F0B429]">
            اپ مشتری تندیس
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">ورود با موبایل</h1>
          <p className="mt-3 max-w-xs text-sm leading-7 text-white/75">
            اگر پرونده حضوری دارید یا تازه اپ را نصب کرده‌اید، با همان شماره موبایل وارد شوید.
          </p>
        </div>

        <div className="mt-10 rounded-[1.75rem] bg-white p-5 text-[#1A2E26] shadow-2xl">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold text-[#14352A]">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#E8F2EA]">
              <Smartphone className="size-4 text-[#14352A]" />
            </span>
            {step === "phone" ? "۱ · شماره موبایل" : "۲ · کد تأیید"}
          </div>

          {step === "phone" ? (
            <form onSubmit={requestOtp} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  موبایل
                </label>
                <DigitsInput
                  mode="phone"
                  value={phone}
                  onValueChange={setPhone}
                  placeholder="0912*******"
                  className="h-12 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6]"
                  required
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button
                type="submit"
                disabled={loading || phone.length < 11}
                className="h-12 w-full rounded-full bg-[#14352A] text-sm font-extrabold text-white hover:bg-[#1f4a3a]"
              >
                {loading ? "در حال ارسال..." : "دریافت کد ورود"}
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyOtp} className="space-y-4">
              <p className="text-sm leading-7 text-muted-foreground">
                کد ۵ رقمی به{" "}
                <span className="font-bold text-[#14352A]" dir="ltr">
                  {phone}
                </span>{" "}
                ارسال شد.
              </p>
              <DigitsInput
                mode="integer"
                value={code}
                onValueChange={(v) => setCode(v.slice(0, 5))}
                placeholder="•••••"
                className="h-14 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6] text-center text-2xl tracking-[0.4em]"
                required
              />
              {devCode ? (
                <p className="rounded-xl bg-[#FFF8E8] px-3 py-2 text-xs text-[#9A6B10]">
                  حالت تست: کد شما <span dir="ltr" className="font-bold">{devCode}</span>
                </p>
              ) : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button
                type="submit"
                disabled={loading || code.length < 5}
                className="h-12 w-full rounded-full bg-[#F0B429] text-sm font-extrabold text-[#14352A] hover:bg-[#e0a61f]"
              >
                {loading ? "در حال بررسی..." : "ورود به اپ"}
              </Button>
              <button
                type="button"
                className={cn("w-full text-center text-xs font-medium text-muted-foreground")}
                onClick={() => {
                  setStep("phone");
                  setCode("");
                  setError("");
                  setDevCode(undefined);
                }}
              >
                تغییر شماره موبایل
              </button>
            </form>
          )}
        </div>

        <div className="mt-8 grid gap-3 text-center text-[11px] leading-6 text-white/60">
          <p>مراجع حضوری: بعد از تشکیل پرونده، لینک اپ با پیامک برایتان ارسال می‌شود.</p>
          <p>نصب مستقیم: همین‌جا ثبت‌نام کنید؛ اطلاعات تکمیلی در مرحله بعد گرفته می‌شود.</p>
        </div>
      </div>
    </div>
  );
}

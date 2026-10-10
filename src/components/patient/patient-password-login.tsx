"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, KeyRound, Smartphone } from "lucide-react";
import { DigitsInput } from "@/components/ui/digits-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Step = "phone" | "setup" | "login" | "forgot_code" | "forgot_reset";

export function PatientPasswordLogin() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | undefined>();
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function goAfterAuth(needsProfile: boolean) {
    router.replace(needsProfile ? "/patient/complete-profile" : "/patient");
    router.refresh();
  }

  async function checkPhone(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/patient-auth/check-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "invalid_phone") {
          throw new Error("شماره موبایل معتبر نیست.");
        }
        throw new Error("بررسی شماره انجام نشد.");
      }
      setAlreadyRegistered(Boolean(data.alreadyRegistered));
      setPassword("");
      setConfirm("");
      setCode("");
      setDevCode(undefined);
      setStep(data.hasPassword ? "login" : "setup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (password !== confirm) {
        throw new Error("تکرار رمز یکسان نیست.");
      }
      const res = await fetch("/api/patient-auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "invalid_length") {
          throw new Error("رمز باید ۴ تا ۸ کاراکتر باشد.");
        }
        if (data.error === "password_exists") {
          throw new Error("برای این شماره قبلاً رمز ثبت شده. وارد شوید.");
        }
        throw new Error("ذخیره رمز انجام نشد.");
      }
      goAfterAuth(Boolean(data.needsProfile));
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  async function loginWithPassword(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/patient-auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "invalid_credentials") {
          throw new Error("رمز نادرست است.");
        }
        if (data.error === "no_password") {
          setStep("setup");
          throw new Error("هنوز رمزی ندارید؛ یک رمز کوتاه بسازید.");
        }
        if (data.error === "not_found") {
          setStep("setup");
          throw new Error("حساب پیدا نشد؛ رمز جدید بسازید.");
        }
        throw new Error("ورود انجام نشد.");
      }
      goAfterAuth(Boolean(data.needsProfile));
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  async function requestResetOtp(event?: FormEvent) {
    event?.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/patient-auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "reset" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "not_found") {
          throw new Error("برای این شماره رمزی ثبت نشده است.");
        }
        throw new Error("ارسال کد بازیابی انجام نشد.");
      }
      setDevCode(data.devCode);
      setCode("");
      setStep("forgot_code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  async function continueToResetPassword(event: FormEvent) {
    event.preventDefault();
    if (code.length < 5) {
      setError("کد ۵ رقمی را وارد کنید.");
      return;
    }
    setError("");
    setPassword("");
    setConfirm("");
    setStep("forgot_reset");
  }

  async function resetPassword(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (password !== confirm) {
        throw new Error("تکرار رمز یکسان نیست.");
      }
      const res = await fetch("/api/patient-auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "invalid") throw new Error("کد نادرست است.");
        if (data.error === "expired") {
          throw new Error("کد منقضی شده. دوباره درخواست دهید.");
        }
        if (data.error === "invalid_length") {
          throw new Error("رمز باید ۴ تا ۸ کاراکتر باشد.");
        }
        throw new Error("بازنشانی رمز انجام نشد.");
      }
      goAfterAuth(Boolean(data.needsProfile));
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  function backToPhone() {
    setStep("phone");
    setPassword("");
    setConfirm("");
    setCode("");
    setDevCode(undefined);
    setError("");
  }

  const stepTitle =
    step === "phone"
      ? "۱ · شماره موبایل"
      : step === "setup"
        ? "۲ · ساخت رمز"
        : step === "login"
          ? "۲ · ورود با رمز"
          : step === "forgot_code"
            ? "بازیابی · کد پیامک"
            : "بازیابی · رمز جدید";

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
          <h1 className="mt-2 text-3xl font-extrabold">ورود با رمز</h1>
          <p className="mt-3 max-w-xs text-sm leading-7 text-white/75">
            بدون پیامک روزانه؛ یک‌بار رمز کوتاه بسازید و بعد با همان وارد شوید.
          </p>
        </div>

        <div className="mt-10 rounded-[1.75rem] bg-white p-5 text-[#1A2E26] shadow-2xl">
          <div className="mb-5 flex items-center gap-2 text-sm font-bold text-[#14352A]">
            <span className="flex size-9 items-center justify-center rounded-full bg-[#E8F2EA]">
              {step === "phone" ? (
                <Smartphone className="size-4 text-[#14352A]" />
              ) : (
                <KeyRound className="size-4 text-[#14352A]" />
              )}
            </span>
            {stepTitle}
          </div>

          {step === "phone" ? (
            <form onSubmit={checkPhone} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  موبایل
                </label>
                <DigitsInput
                  mode="phone"
                  name="username"
                  autoComplete="username"
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
                {loading ? "در حال بررسی..." : "ادامه"}
              </Button>
            </form>
          ) : null}

          {step === "setup" ? (
            <form onSubmit={savePassword} className="space-y-4" autoComplete="on">
              <p className="rounded-xl bg-[#F7F8F6] px-3 py-2 text-sm leading-7 text-muted-foreground">
                {alreadyRegistered
                  ? "اولین ورود به اپ است؛ یک رمز کوتاه ۴ تا ۸ کاراکتری بسازید."
                  : "خوش آمدید؛ یک رمز کوتاه بسازید تا بعداً بدون پیامک وارد شوید."}
              </p>
              <p className="text-sm text-muted-foreground" dir="ltr">
                {phone}
              </p>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  رمز کوتاه
                </label>
                <Input
                  type="password"
                  name="new-password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.slice(0, 8))}
                  placeholder="مثلاً ۱۲۳۴"
                  className="h-12 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6]"
                  required
                  minLength={4}
                  maxLength={8}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  تکرار رمز
                </label>
                <Input
                  type="password"
                  name="confirm-password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value.slice(0, 8))}
                  placeholder="تکرار رمز"
                  className="h-12 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6]"
                  required
                  minLength={4}
                  maxLength={8}
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button
                type="submit"
                disabled={loading || password.length < 4}
                className="h-12 w-full rounded-full bg-[#F0B429] text-sm font-extrabold text-[#14352A] hover:bg-[#e0a61f]"
              >
                {loading ? "در حال ذخیره..." : "ذخیره رمز"}
              </Button>
              <button
                type="button"
                className="w-full text-center text-xs font-medium text-muted-foreground"
                onClick={backToPhone}
              >
                تغییر شماره موبایل
              </button>
            </form>
          ) : null}

          {step === "login" ? (
            <form onSubmit={loginWithPassword} className="space-y-4" autoComplete="on">
              <p className="text-sm leading-7 text-muted-foreground">
                رمز ذخیره‌شده برای{" "}
                <span className="font-bold text-[#14352A]" dir="ltr">
                  {phone}
                </span>{" "}
                را وارد کنید.
              </p>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  رمز
                </label>
                <Input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.slice(0, 8))}
                  placeholder="رمز کوتاه"
                  className="h-12 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6]"
                  required
                  minLength={4}
                  maxLength={8}
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button
                type="submit"
                disabled={loading || password.length < 4}
                className="h-12 w-full rounded-full bg-[#14352A] text-sm font-extrabold text-white hover:bg-[#1f4a3a]"
              >
                {loading ? "در حال ورود..." : "ورود به اپ"}
              </Button>
              <button
                type="button"
                disabled={loading}
                className={cn(
                  "w-full text-center text-sm font-bold text-[#C48A12]"
                )}
                onClick={() => {
                  setError("");
                  void requestResetOtp();
                }}
              >
                فراموشی رمز
              </button>
              <button
                type="button"
                className="w-full text-center text-xs font-medium text-muted-foreground"
                onClick={backToPhone}
              >
                تغییر شماره موبایل
              </button>
            </form>
          ) : null}

          {step === "forgot_code" ? (
            <form onSubmit={continueToResetPassword} className="space-y-4">
              <p className="rounded-xl bg-[#FFF8E8] px-3 py-2 text-sm leading-7 text-[#9A6B10]">
                فقط برای بازیابی رمز، یک پیامک ارسال می‌شود.
              </p>
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
                  حالت تست: کد شما{" "}
                  <span dir="ltr" className="font-bold">
                    {devCode}
                  </span>
                </p>
              ) : null}
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button
                type="submit"
                disabled={loading || code.length < 5}
                className="h-12 w-full rounded-full bg-[#14352A] text-sm font-extrabold text-white hover:bg-[#1f4a3a]"
              >
                ادامه
              </Button>
              <button
                type="button"
                className="w-full text-center text-xs font-medium text-muted-foreground"
                onClick={() => {
                  setStep("login");
                  setError("");
                }}
              >
                بازگشت به ورود با رمز
              </button>
            </form>
          ) : null}

          {step === "forgot_reset" ? (
            <form onSubmit={resetPassword} className="space-y-4" autoComplete="on">
              <p className="text-sm leading-7 text-muted-foreground">
                رمز کوتاه جدید بسازید و ذخیره کنید.
              </p>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  رمز جدید
                </label>
                <Input
                  type="password"
                  name="new-password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.slice(0, 8))}
                  className="h-12 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6]"
                  required
                  minLength={4}
                  maxLength={8}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  تکرار رمز
                </label>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value.slice(0, 8))}
                  className="h-12 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6]"
                  required
                  minLength={4}
                  maxLength={8}
                />
              </div>
              {error ? <p className="text-sm text-destructive">{error}</p> : null}
              <Button
                type="submit"
                disabled={loading || password.length < 4}
                className="h-12 w-full rounded-full bg-[#F0B429] text-sm font-extrabold text-[#14352A] hover:bg-[#e0a61f]"
              >
                {loading ? "در حال ذخیره..." : "ذخیره رمز جدید"}
              </Button>
            </form>
          ) : null}
        </div>

        <div className="mt-8 grid gap-3 text-center text-[11px] leading-6 text-white/60">
          <p>ورود روزانه با رمز است؛ پیامک فقط اگر رمز را فراموش کنید.</p>
          <p>رمز را می‌توانید در مرورگر یا گوشی هم ذخیره کنید.</p>
        </div>
      </div>
    </div>
  );
}

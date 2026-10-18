"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { ClinicLogo } from "@/components/brand/clinic-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/clinic/reception";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        setError("نام کاربری یا رمز عبور اشتباه است.");
        setLoading(false);
        return;
      }

      router.replace(nextPath.startsWith("/") ? nextPath : "/clinic/reception");
      router.refresh();
    } catch {
      setError("ورود انجام نشد. دوباره تلاش کنید.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[100svh] w-full max-w-[430px] flex-col justify-center bg-[#F7F8F6] px-4 py-10">
      <div className="mb-8 flex flex-col items-center text-center">
        <ClinicLogo />
        <h1 className="mt-5 text-2xl font-extrabold text-brand">ورود به اپ کلینیک</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          برای دسترسی به پذیرش و مدیریت، وارد حساب کاربری شوید.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6"
      >
        <div className="space-y-2">
          <Label htmlFor="username">نام کاربری</Label>
          <Input
            id="username"
            className="h-12 rounded-2xl bg-[#F7F8F6]"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">رمز عبور</Label>
          <Input
            id="password"
            type="password"
            className="h-12 rounded-2xl bg-[#F7F8F6]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="h-12 w-full rounded-2xl bg-[#D86B5C] text-base font-semibold text-white hover:bg-[#D86B5C]/90"
        >
          {loading ? "در حال ورود..." : "ورود"}
        </Button>
      </form>

      <Link href="/" className="mt-6 text-center text-sm text-muted-foreground hover:text-brand">
        بازگشت به صفحه اصلی
      </Link>
    </div>
  );
}

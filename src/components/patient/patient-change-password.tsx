"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DigitsInput } from "@/components/ui/digits-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearRememberedPatientLogin,
  readRememberedPatientLogin,
  writeRememberedPatientLogin,
} from "@/lib/patient-remember";

const fieldClass =
  "h-12 rounded-2xl border-[#D7E2D9] bg-white focus-visible:border-brand focus-visible:ring-brand/20";

export function PatientChangePassword({
  phone,
  needsNationalId,
}: {
  phone: string;
  needsNationalId: boolean;
}) {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setOk("");
    try {
      if (newPassword !== confirm) {
        throw new Error("تکرار رمز جدید یکسان نیست.");
      }
      if (needsNationalId && nationalId.length < 10) {
        throw new Error("کد ملی را وارد کنید.");
      }
      const res = await fetch("/api/patient-auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          ...(needsNationalId ? { nationalId } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "invalid_current") {
          throw new Error("رمز فعلی نادرست است.");
        }
        if (data.error === "invalid_length") {
          throw new Error("رمز باید ۴ تا ۸ کاراکتر باشد.");
        }
        if (data.error === "same_password") {
          throw new Error("رمز جدید باید با رمز فعلی فرق داشته باشد.");
        }
        if (data.error === "invalid_national_id") {
          throw new Error("کد ملی معتبر نیست.");
        }
        throw new Error("تغییر رمز انجام نشد.");
      }

      const remembered = readRememberedPatientLogin();
      if (remembered && remembered.phone === phone) {
        writeRememberedPatientLogin(phone, newPassword);
      }

      setOk(
        data.nationalIdSaved
          ? "رمز و کد ملی با موفقیت ذخیره شد."
          : "رمز با موفقیت تغییر کرد."
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setTimeout(() => router.replace("/patient"), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطا");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[100svh] bg-[#F6F8F5]">
      <div className="mx-auto w-full max-w-[430px] px-4 pb-16 pt-6">
        <Link
          href="/patient"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#14352A]/70"
        >
          <ArrowRight className="size-4" />
          بازگشت
        </Link>

        <div className="mt-6 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-[#E8F2EA] text-brand">
            <KeyRound className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-brand">تغییر رمز</h1>
            <p className="mt-0.5 text-sm text-muted-foreground" dir="ltr">
              {phone}
            </p>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="mt-6 space-y-4 rounded-[1.75rem] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)]"
        >
          {needsNationalId ? (
            <div className="space-y-1.5">
              <Label>کد ملی</Label>
              <DigitsInput
                mode="integer"
                value={nationalId}
                onValueChange={(v) => setNationalId(v.slice(0, 10))}
                placeholder="۱۰ رقم"
                className={fieldClass}
                required
              />
              <p className="text-[11px] leading-5 text-muted-foreground">
                کد ملی هنوز در پرونده نیست؛ با ذخیره رمز ثبت می‌شود.
              </p>
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label>رمز فعلی</Label>
            <Input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value.slice(0, 8))}
              className={fieldClass}
              required
              minLength={4}
              maxLength={8}
            />
          </div>
          <div className="space-y-1.5">
            <Label>رمز جدید</Label>
            <Input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value.slice(0, 8))}
              className={fieldClass}
              required
              minLength={4}
              maxLength={8}
            />
          </div>
          <div className="space-y-1.5">
            <Label>تکرار رمز جدید</Label>
            <Input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.slice(0, 8))}
              className={fieldClass}
              required
              minLength={4}
              maxLength={8}
            />
          </div>
          {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          {ok ? <p className="text-sm text-[#2F6B4F]">{ok}</p> : null}
          <Button
            type="submit"
            disabled={
              loading ||
              currentPassword.length < 4 ||
              newPassword.length < 4 ||
              (needsNationalId && nationalId.length < 10)
            }
            className="h-12 w-full rounded-full bg-[#14352A] text-white hover:bg-[#1f4a3a]"
          >
            {loading ? "در حال ذخیره..." : "ذخیره رمز جدید"}
          </Button>
          <button
            type="button"
            className="w-full text-center text-xs font-medium text-muted-foreground"
            onClick={() => {
              clearRememberedPatientLogin();
              setOk("ذخیره خودکار رمز روی این دستگاه پاک شد.");
            }}
          >
            پاک کردن رمز ذخیره‌شده روی این دستگاه
          </button>
        </form>
      </div>
    </div>
  );
}

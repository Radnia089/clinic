"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  PersonStanding,
  Ruler,
  Scale,
  UserRound,
} from "lucide-react";
import { DigitsInput } from "@/components/ui/digits-input";
import { parseNormalizedNumber } from "@/lib/digits";
import {
  buildBmiResult,
  categoryTone,
  type BmiGender,
  type BmiResult,
} from "@/lib/bmi";
import { cn } from "@/lib/utils";

function formatFa(n: number, digits = 1) {
  return new Intl.NumberFormat("fa-IR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits === 0 ? 0 : undefined,
  }).format(n);
}

function FieldRow({
  id,
  label,
  unit,
  icon,
  iconClass,
  value,
  onValueChange,
  mode = "decimal",
  required = true,
}: {
  id: string;
  label: string;
  unit: string;
  icon: ReactNode;
  iconClass: string;
  value: string;
  onValueChange: (v: string) => void;
  mode?: "decimal" | "integer";
  required?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#F4F7F4] px-3 py-2.5">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          iconClass
        )}
      >
        {icon}
      </span>
      <label htmlFor={id} className="shrink-0 text-sm font-bold text-[#14352A]">
        {label}
      </label>
      <DigitsInput
        id={id}
        mode={mode}
        value={value}
        onValueChange={onValueChange}
        className="h-10 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
        placeholder="—"
        required={required}
      />
      <span className="shrink-0 text-xs text-[#1A2E26]/45">{unit}</span>
    </div>
  );
}

function ResultPanel({
  result,
  compact,
}: {
  result: BmiResult;
  compact?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, ((result.bmi - 15) / 25) * 100));

  return (
    <div
      className={cn(
        "animate-rise space-y-4 rounded-[1.5rem] border border-[#14352A]/08 bg-gradient-to-br from-[#E8F2EA] to-white p-5",
        compact && "p-4"
      )}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-[#1A2E26]/55">شاخص BMI شما</p>
          <p
            className="mt-1 font-extrabold tracking-tight text-[#14352A]"
            dir="ltr"
            style={{ fontSize: compact ? "2.4rem" : "3rem", lineHeight: 1 }}
          >
            {formatFa(result.bmi, 1)}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-bold",
            categoryTone(result.categoryId)
          )}
        >
          {result.categoryLabel}
        </span>
      </div>

      <div className="relative h-2.5 overflow-hidden rounded-full bg-white">
        <div
          className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-[#14352A] via-[#3C8A6E] to-[#F0B429] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-sm leading-7 text-[#1A2E26]/70">{result.advice}</p>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-white/80 px-3 py-2.5">
          <p className="text-[11px] text-[#1A2E26]/50">بازه وزن ایده‌آل</p>
          <p className="mt-1 text-sm font-bold text-[#14352A]" dir="ltr">
            {formatFa(result.idealMinKg, 1)} – {formatFa(result.idealMaxKg, 1)}{" "}
            <span className="text-xs font-medium">kg</span>
          </p>
        </div>
        <div className="rounded-2xl bg-white/80 px-3 py-2.5">
          <p className="text-[11px] text-[#1A2E26]/50">استخوان‌بندی</p>
          <p className="mt-1 text-sm font-bold text-[#14352A]">
            {result.frameLabel ?? "—"}
          </p>
        </div>
      </div>

      {!compact ? (
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href="/patient/book"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#14352A] px-5 text-sm font-bold text-white transition hover:bg-[#1f4a3a]"
          >
            رزرو نوبت حضوری
            <ArrowLeft className="size-4" />
          </Link>
          <Link
            href="/patient/consult"
            className="inline-flex h-11 items-center rounded-full border border-[#14352A]/15 bg-white px-5 text-sm font-bold text-[#14352A]"
          >
            مشاوره آنلاین
          </Link>
        </div>
      ) : (
        <Link
          href="/patient/book"
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#14352A] px-5 text-sm font-bold text-white"
        >
          گرفتن برنامه از مشاور
          <ArrowLeft className="size-4" />
        </Link>
      )}
    </div>
  );
}

function CalculatorForm({
  compact,
  onResult,
}: {
  compact?: boolean;
  onResult: (result: BmiResult | null) => void;
}) {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [wrist, setWrist] = useState("");
  const [gender, setGender] = useState<BmiGender>("female");
  const [error, setError] = useState("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    const weightKg = parseNormalizedNumber(weight);
    const heightCm = parseNormalizedNumber(height);
    const wristCm = wrist ? parseNormalizedNumber(wrist) : undefined;
    const ageN = age ? parseNormalizedNumber(age) : undefined;

    if (!Number.isFinite(weightKg) || weightKg < 30 || weightKg > 250) {
      setError("وزن را بین ۳۰ تا ۲۵۰ کیلوگرم وارد کنید.");
      onResult(null);
      return;
    }
    if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 230) {
      setError("قد را بین ۱۰۰ تا ۲۳۰ سانتی‌متر وارد کنید.");
      onResult(null);
      return;
    }
    if (ageN !== undefined && (!Number.isFinite(ageN) || ageN < 10 || ageN > 100)) {
      setError("سن را بین ۱۰ تا ۱۰۰ سال وارد کنید.");
      onResult(null);
      return;
    }
    if (
      wristCm !== undefined &&
      (!Number.isFinite(wristCm) || wristCm < 10 || wristCm > 30)
    ) {
      setError("دور مچ را بین ۱۰ تا ۳۰ سانتی‌متر وارد کنید.");
      onResult(null);
      return;
    }

    const result = buildBmiResult({
      weightKg,
      heightCm,
      wristCm,
      gender,
    });
    if (!result) {
      setError("محاسبه انجام نشد. مقادیر را بررسی کنید.");
      onResult(null);
      return;
    }
    onResult(result);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "relative z-10 space-y-3 rounded-[1.75rem] bg-white p-5 shadow-[0_20px_60px_rgba(20,53,42,0.10)]",
        compact ? "p-4" : "sm:p-7"
      )}
    >
      <h3
        className={cn(
          "text-center font-extrabold text-[#14352A]",
          compact ? "text-base" : "text-lg sm:text-xl"
        )}
      >
        محاسبه پیشرفته BMI
      </h3>

      <FieldRow
        id="bmi-weight"
        label="وزن"
        unit="کیلوگرم"
        icon={<Scale className="size-4" />}
        iconClass="bg-[#E8F2EA] text-[#2F6B4F]"
        value={weight}
        onValueChange={setWeight}
      />
      <FieldRow
        id="bmi-height"
        label="قد"
        unit="سانتی‌متر"
        icon={<Ruler className="size-4" />}
        iconClass="bg-[#FFF4D6] text-[#C48A12]"
        value={height}
        onValueChange={setHeight}
      />
      <FieldRow
        id="bmi-age"
        label="سن"
        unit="سال"
        icon={<UserRound className="size-4" />}
        iconClass="bg-[#E8F0F8] text-[#3A6FA0]"
        value={age}
        onValueChange={setAge}
        mode="integer"
      />
      <FieldRow
        id="bmi-wrist"
        label="دور مچ"
        unit="سانتی‌متر"
        icon={<PersonStanding className="size-4" />}
        iconClass="bg-[#FBEFE8] text-[#D86B5C]"
        value={wrist}
        onValueChange={setWrist}
        required={false}
      />

      <div className="grid grid-cols-2 gap-2 pt-1">
        {(
          [
            { id: "female", label: "زن" },
            { id: "male", label: "مرد" },
          ] as const
        ).map((item) => {
          const active = gender === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setGender(item.id)}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-bold transition",
                active
                  ? "border-[#14352A] bg-[#E8F2EA] text-[#14352A]"
                  : "border-transparent bg-[#F4F7F4] text-[#1A2E26]/55 hover:bg-[#EAF1EB]"
              )}
            >
              <span
                className={cn(
                  "size-3.5 rounded-full border-2",
                  active
                    ? "border-[#14352A] bg-[#14352A]"
                    : "border-[#C9D8CE] bg-white"
                )}
              />
              {item.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        className="mt-1 h-12 w-full rounded-2xl bg-[#14352A] text-sm font-extrabold text-white transition hover:bg-[#1f4a3a] active:scale-[0.99]"
      >
        محاسبه کن
      </button>
    </form>
  );
}

export function BmiCalculator({
  variant = "landing",
}: {
  variant?: "landing" | "patient";
}) {
  const [result, setResult] = useState<BmiResult | null>(null);
  const compact = variant === "patient";

  if (compact) {
    return (
      <div className="space-y-4">
        <div>
          <p className="text-xs font-bold tracking-wide text-[#C48A12]">
            ابزار سلامت
          </p>
          <h2 className="mt-1 text-xl font-extrabold text-[#14352A]">
            محاسبه شاخص توده بدنی
          </h2>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            با وزن، قد و دور مچ، BMI و استخوان‌بندی خود را ببینید.
          </p>
        </div>
        <CalculatorForm compact onResult={setResult} />
        {result ? <ResultPanel result={result} compact /> : null}
      </div>
    );
  }

  return (
    <section id="bmi" className="relative overflow-hidden bg-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-10 size-[420px] rounded-full bg-[#CFE5D4]/55 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 bottom-0 size-[320px] rounded-full bg-[#F0B429]/15 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[0.95fr_1.05fr] lg:gap-14">
        <div className="order-2 lg:order-1">
          <CalculatorForm onResult={setResult} />
          {result ? (
            <div className="mt-5">
              <ResultPanel result={result} />
            </div>
          ) : null}
        </div>

        <div className="order-1 lg:order-2">
          <p className="text-sm font-bold tracking-wide text-[#C48A12]">
            محاسبه BMI
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-extrabold leading-tight text-[#14352A] sm:text-4xl lg:text-[2.75rem]">
            شاخص توده بدنی خود را به‌سادگی محاسبه کنید
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-8 text-[#1A2E26]/70 sm:text-base">
            با اندازه‌گیری BMI می‌توانید وضعیت تناسب اندام و سلامت خود را سریع
            بسنجید و مسیر رژیم مناسب را انتخاب کنید. دور مچ هم برای تخمین
            استخوان‌بندی اضافه شده است.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-[#1A2E26]/75">
            {[
              "محاسبه استاندارد شاخص توده بدنی",
              "بازه وزن ایده‌آل بر اساس قد شما",
              "تخمین استخوان‌بندی با دور مچ",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="size-2 shrink-0 rounded-full bg-[#F0B429]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { buildBmiResult, categoryTone, type BmiGender, type BmiResult } from "@/lib/bmi";
import { parseNormalizedNumber } from "@/lib/digits";

const bands = [
  { label: "کمبود", className: "bg-[#7EB6E0]", width: "14%" },
  { label: "طبیعی", className: "bg-[#3caf2d]", width: "26%" },
  { label: "اضافه", className: "bg-[#F2B544]", width: "20%" },
  { label: "چاقی", className: "bg-[#E15B5B]", width: "40%" },
];

function faNum(value: number) {
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(value);
}

function markerPercent(bmi: number) {
  return Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100));
}

export function SampleBmi() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState<BmiGender | "">("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<BmiResult | null>(null);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const heightCm = parseNormalizedNumber(height);
    const weightKg = parseNormalizedNumber(weight);
    if (gender !== "female" && gender !== "male") {
      setResult(null);
      setError("جنسیت را انتخاب کنید.");
      return;
    }
    if (!Number.isFinite(heightCm) || heightCm < 120 || heightCm > 220 || !Number.isFinite(weightKg) || weightKg < 30 || weightKg > 250) {
      setResult(null);
      setError("قد را بین ۱۲۰ تا ۲۲۰ و وزن را بین ۳۰ تا ۲۵۰ وارد کنید.");
      return;
    }
    const next = buildBmiResult({ weightKg, heightCm, gender });
    if (!next) {
      setResult(null);
      setError("محاسبه انجام نشد. قد و وزن را دوباره وارد کنید.");
      return;
    }
    setError("");
    setResult(next);
  }

  const genderLabel = gender === "male" ? "آقایان" : "خانم‌ها";

  return (
    <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_50px_rgba(46,155,50,0.10)] ring-1 ring-black/5">
      <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
        <form onSubmit={onSubmit} className="p-5 sm:p-8">
          <p className="text-sm font-bold text-[#2E9B32]">شاخص توده بدنی</p>
          <h2 className="mt-1 text-2xl font-extrabold text-[#1A1A1A] sm:text-3xl">وضعیت وزن را دقیق ببینید</h2>
          <p className="mt-2 text-sm leading-7 text-[#666]">قد، وزن و جنسیت را وارد کنید تا محدودهٔ وزن و وضعیت بدنی‌تان مشخص شود.</p>

          <div className="mt-6">
            <p className="text-xs font-bold text-[#555]">جنسیت</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {([
                ["female", "زن"],
                ["male", "مرد"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setGender(value)}
                  className={`h-12 rounded-2xl text-sm font-extrabold transition ${
                    gender === value
                      ? "bg-[#3caf2d] text-white shadow-[0_8px_20px_rgba(60,175,45,0.28)]"
                      : "bg-[#F7F7F7] text-[#444]"
                  }`}
                  aria-pressed={gender === value}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold text-[#555]">قد (سانتی‌متر)</span>
              <input
                value={height}
                onChange={(event) => setHeight(event.target.value)}
                inputMode="decimal"
                dir="ltr"
                placeholder="۱۶۵"
                className="mt-1 h-12 w-full rounded-2xl border border-[#E6E6E6] bg-[#FAFAFA] px-4 text-left text-sm outline-none focus:border-[#3caf2d]"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-[#555]">وزن (کیلوگرم)</span>
              <input
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                inputMode="decimal"
                dir="ltr"
                placeholder="۷۰"
                className="mt-1 h-12 w-full rounded-2xl border border-[#E6E6E6] bg-[#FAFAFA] px-4 text-left text-sm outline-none focus:border-[#3caf2d]"
              />
            </label>
          </div>

          {error ? <p className="mt-3 text-sm font-bold text-[#C4473A]">{error}</p> : null}

          <button type="submit" className="mt-5 h-12 w-full rounded-full bg-[#3caf2d] text-sm font-extrabold text-white shadow-[0_10px_24px_rgba(60,175,45,0.28)]">
            محاسبه شاخص
          </button>
        </form>

        <div className="flex flex-col justify-between bg-[#F6FBF6] p-5 sm:p-8">
          {result && gender ? (
            <div>
              <p className="text-xs font-bold text-[#2E9B32]">نتیجه برای {genderLabel}</p>
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-5xl font-extrabold tracking-tight text-[#1A1A1A]" dir="ltr">
                  {faNum(result.bmi)}
                </p>
                <span className={`rounded-full px-3 py-1.5 text-xs font-extrabold ${categoryTone(result.categoryId)}`}>
                  {result.categoryLabel}
                </span>
              </div>
              <div className="relative mt-6">
                <div className="flex overflow-hidden rounded-full">
                  {bands.map((band) => (
                    <span key={band.label} className={`h-2.5 ${band.className}`} style={{ width: band.width }} />
                  ))}
                </div>
                <span
                  className="absolute top-1/2 size-4 -translate-y-1/2 rounded-full border-2 border-white bg-[#1A1A1A] shadow"
                  style={{ right: `calc(${markerPercent(result.bmi)}% - 8px)` }}
                />
                <div className="mt-2 flex text-center text-[10px] font-bold text-[#777]">
                  {bands.map((band) => (
                    <span key={band.label} style={{ width: band.width }}>{band.label}</span>
                  ))}
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-white px-4 py-3">
                <p className="text-xs text-[#777]">بازه وزن مناسب برای این قد</p>
                <p className="mt-1 text-sm font-extrabold text-[#1A1A1A]" dir="ltr">
                  {faNum(result.idealMinKg)} – {faNum(result.idealMaxKg)} kg
                </p>
              </div>
              <p className="mt-4 text-sm leading-7 text-[#444]">{result.advice}</p>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-[#2E9B32]">نتیجه</p>
              <p className="mt-3 text-lg font-extrabold text-[#1A1A1A]">بعد از محاسبه، وضعیت این‌جا می‌آید</p>
              <div className="mt-6 flex overflow-hidden rounded-full opacity-70">
                {bands.map((band) => (
                  <span key={band.label} className={`h-2.5 ${band.className}`} style={{ width: band.width }} />
                ))}
              </div>
              <div className="mt-2 flex text-center text-[10px] font-bold text-[#777]">
                {bands.map((band) => (
                  <span key={band.label} style={{ width: band.width }}>{band.label}</span>
                ))}
              </div>
              <p className="mt-5 text-sm leading-7 text-[#666]">شاخص، دستهٔ وزنی و بازهٔ وزن مناسب با توجه به جنسیت انتخاب‌شده نشان داده می‌شود.</p>
            </div>
          )}
          <Link href="/patient/book" className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-extrabold text-[#2E9B32] ring-1 ring-[#3caf2d]/30">
            برنامه مناسب را بگیرم
          </Link>
        </div>
      </div>
    </div>
  );
}

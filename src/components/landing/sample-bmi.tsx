"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { calculateBmi, categorizeBmi, categoryTone } from "@/lib/bmi";
import { parseNormalizedNumber } from "@/lib/digits";

export function SampleBmi() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ value: string; label: string; tone: string } | null>(null);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const heightCm = parseNormalizedNumber(height);
    const weightKg = parseNormalizedNumber(weight);
    const bmi = calculateBmi(weightKg, heightCm);
    if (!Number.isFinite(bmi) || heightCm < 120 || heightCm > 220 || weightKg < 30 || weightKg > 250) {
      setResult(null);
      setError("قد را بین ۱۲۰ تا ۲۲۰ و وزن را بین ۳۰ تا ۲۵۰ وارد کنید.");
      return;
    }
    const category = categorizeBmi(bmi);
    setError("");
    setResult({
      value: new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(bmi),
      label: category.categoryLabel,
      tone: categoryTone(category.categoryId),
    });
  }

  return (
    <form onSubmit={onSubmit} className="rounded-[1.8rem] bg-white p-5 shadow-[0_10px_30px_rgba(47,158,50,0.08)] sm:p-6">
      <p className="text-sm font-bold text-[#2E9B32]">شاخص توده بدنی</p>
      <h2 className="mt-1 text-2xl font-extrabold text-[#1A1A1A]">وضعیت وزن‌تان را همین‌جا ببینید</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <label className="block">
          <span className="text-xs text-[#666]">قد (سانتی‌متر)</span>
          <input
            value={height}
            onChange={(event) => setHeight(event.target.value)}
            inputMode="decimal"
            dir="ltr"
            placeholder="170"
            className="mt-1 h-12 w-full rounded-2xl border border-[#E6E6E6] bg-[#FAFAFA] px-4 text-left text-sm outline-none focus:border-[#3caf2d]"
          />
        </label>
        <label className="block">
          <span className="text-xs text-[#666]">وزن (کیلوگرم)</span>
          <input
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            inputMode="decimal"
            dir="ltr"
            placeholder="70"
            className="mt-1 h-12 w-full rounded-2xl border border-[#E6E6E6] bg-[#FAFAFA] px-4 text-left text-sm outline-none focus:border-[#3caf2d]"
          />
        </label>
        <button type="submit" className="h-12 self-end rounded-full bg-[#3caf2d] px-6 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(60,175,45,0.28)]">
          محاسبه
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-[#C4473A]">{error}</p> : null}
      {result ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F6FBF6] px-4 py-3">
          <p className="text-sm text-[#333]">
            شاخص شما <span className="text-lg font-extrabold text-[#1A1A1A]">{result.value}</span>
            <span className={`mr-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${result.tone}`}>{result.label}</span>
          </p>
          <Link href="/patient/book" className="text-sm font-extrabold text-[#2E9B32]">
            برنامه مناسب را بگیرم
          </Link>
        </div>
      ) : null}
    </form>
  );
}

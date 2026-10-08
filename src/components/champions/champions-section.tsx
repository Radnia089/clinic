"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { champions, lostKg, type Champion } from "@/lib/champions";
import { cn } from "@/lib/utils";

function faNum(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}

function ChampionCard({
  champion,
  compact,
}: {
  champion: Champion;
  compact?: boolean;
}) {
  const lost = lostKg(champion);

  return (
    <article
      className={cn(
        "shrink-0 overflow-hidden rounded-[1.5rem] bg-white shadow-[0_12px_36px_rgba(20,53,42,0.08)]",
        compact ? "w-[270px]" : "w-[300px] sm:w-[320px]"
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden">
        <div className="absolute inset-0 grid grid-cols-2">
          <div className="relative">
            <Image
              src={champion.beforeImage}
              alt={`${champion.name} — قبل`}
              fill
              className="object-cover object-top grayscale-[35%]"
              sizes="160px"
            />
            <span className="absolute bottom-3 right-2 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
              قبل
            </span>
          </div>
          <div className="relative border-r border-white/40">
            <Image
              src={champion.afterImage}
              alt={`${champion.name} — بعد`}
              fill
              className="object-cover object-top"
              sizes="160px"
            />
            <span className="absolute bottom-3 left-2 rounded-full bg-[#14352A]/80 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
              بعد
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/45 to-transparent" />

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-center gap-1.5">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#14352A] shadow-sm">
            شروع {faNum(champion.startKg)} kg
          </span>
          <span className="rounded-full bg-[#14352A] px-3 py-1.5 text-[11px] font-extrabold text-white shadow-md">
            {faNum(lost)} kg کاهش وزن
          </span>
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#14352A] shadow-sm">
            پایان {faNum(champion.endKg)} kg
          </span>
        </div>
      </div>

      <div className={cn("space-y-1.5", compact ? "p-3.5" : "p-4")}>
        <h3 className="text-sm font-extrabold text-[#14352A] sm:text-base">
          {champion.name}
        </h3>
        <p className="line-clamp-2 text-xs leading-6 text-[#1A2E26]/65">
          {champion.quote}
        </p>
      </div>
    </article>
  );
}

export function ChampionsSection({
  variant = "landing",
}: {
  variant?: "landing" | "patient";
}) {
  const compact = variant === "patient";

  if (compact) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 px-0.5">
          <h2 className="text-sm font-bold text-brand">قهرمانان تندیس</h2>
          <Link
            href="/patient/champions"
            className="text-xs font-medium text-brand"
          >
            مشاهده همه
          </Link>
        </div>
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {champions.map((item) => (
            <ChampionCard key={item.id} champion={item} compact />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="champions" className="relative overflow-hidden bg-[#F6F8F5]">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-16 size-[360px] rounded-full bg-[#CFE5D4]/45 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 bottom-10 size-[280px] rounded-full bg-[#F0B429]/12 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-wide text-[#C48A12]">
              رکورداران
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-[#14352A] sm:text-4xl">
              قهرمانان تندیس
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-8 text-[#1A2E26]/70 sm:text-base">
              نتیجه واقعی مسیر رژیم و پیگیری — قبل و بعد مراجعه‌کنندگان تندیس.
            </p>
          </div>
          <Link
            href="/patient/book"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#14352A] px-5 text-sm font-bold text-white transition hover:bg-[#1f4a3a]"
          >
            من هم شروع می‌کنم
            <ArrowLeft className="size-4" />
          </Link>
        </div>

        <div className="mt-10 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-3 md:overflow-visible">
          {champions.map((item) => (
            <ChampionCard key={item.id} champion={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

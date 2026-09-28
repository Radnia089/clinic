"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";

const POINTS = [
  { n: 1, title: "شانه", hint: "برجسته‌ترین نقطه شانه" },
  { n: 2, title: "دور بازو", hint: "وسط بازو، بین شانه و آرنج" },
  { n: 3, title: "دور کمر", hint: "باریک‌ترین قسمت کمر / روی ناف" },
  { n: 4, title: "دور باسن", hint: "پهن‌ترین قسمت باسن" },
  { n: 5, title: "دور ران", hint: "ضخیم‌ترین قسمت ران" },
  { n: 6, title: "دور ساق", hint: "بین زانو و قوزک" },
] as const;

export function MeasurementGuide({ className }: { className?: string }) {
  const [open, setOpen] = useState(true);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-[#D7E2D9] bg-[#F7F8F6]",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right"
      >
        <span className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-white text-brand shadow-sm">
            <Ruler className="size-4" />
          </span>
          <span>
            <span className="block text-sm font-bold text-brand">
              راهنمای اندازه‌گیری سایز
            </span>
            <span className="block text-[11px] text-muted-foreground">
              با متر پارچه‌ای، بدون فشار زیاد اندازه بگیرید
            </span>
          </span>
        </span>
        <ChevronDown
          className={cn(
            "size-5 text-muted-foreground transition",
            open && "rotate-180"
          )}
        />
      </button>

      {open ? (
        <div className="space-y-3 border-t border-[#D7E2D9] px-3 pb-4 pt-3">
          <div className="overflow-hidden rounded-2xl bg-white">
            <Image
              src="/images/measurement-guide.png"
              alt="نقاط اندازه‌گیری سایز بدن"
              width={864}
              height={1152}
              className="h-auto w-full object-contain"
              priority={false}
            />
          </div>

          <ol className="grid grid-cols-2 gap-2">
            {POINTS.map((point) => (
              <li
                key={point.n}
                className="flex items-start gap-2 rounded-xl bg-white px-2.5 py-2"
              >
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                  {new Intl.NumberFormat("fa-IR").format(point.n)}
                </span>
                <span>
                  <span className="block text-xs font-bold text-foreground">
                    {point.title}
                  </span>
                  <span className="block text-[10px] leading-4 text-muted-foreground">
                    {point.hint}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          <p className="px-1 text-[11px] leading-5 text-muted-foreground">
            متر را صاف و افقی نگه دارید. لباس نازک کافی است؛ عدد را به سانتی‌متر
            وارد کنید.
          </p>
        </div>
      ) : null}
    </div>
  );
}

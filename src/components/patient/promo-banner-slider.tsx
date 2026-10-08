"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PromoBanner } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PromoBannerSlider({
  items,
  variant = "patient",
}: {
  items: PromoBanner[];
  variant?: "patient" | "landing";
}) {
  const [index, setIndex] = useState(0);
  const touch = useRef<{ x: number; moved: boolean } | null>(null);
  const landing = variant === "landing";

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[index] ?? items[0];

  function go(delta: number) {
    setIndex((prev) => (prev + delta + items.length) % items.length);
  }

  const content = (
    <div
      className={cn(
        "relative overflow-hidden",
        landing
          ? "aspect-[21/9] min-h-[220px] rounded-[1.75rem] sm:min-h-[280px] sm:rounded-[2rem]"
          : "aspect-[16/9] rounded-[1.5rem]"
      )}
    >
      <Image
        src={current.image}
        alt={current.title}
        fill
        className="object-cover transition duration-700"
        sizes={landing ? "(max-width:768px) 100vw, 1152px" : "430px"}
        priority={index === 0}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F241C]/85 via-[#14352A]/25 to-transparent" />
      <div
        className={cn(
          "absolute inset-x-0 bottom-0",
          landing ? "p-5 sm:p-8" : "p-4"
        )}
      >
        <p
          className={cn(
            "font-extrabold text-white",
            landing ? "text-xl sm:text-3xl" : "text-base"
          )}
        >
          {current.title}
        </p>
        {current.subtitle ? (
          <p
            className={cn(
              "mt-1 text-white/85",
              landing ? "max-w-2xl text-sm leading-7 sm:text-base" : "text-xs leading-5"
            )}
          >
            {current.subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );

  const slider = (
    <div
      className="relative"
      onTouchStart={(e) => {
        touch.current = { x: e.touches[0]?.clientX ?? 0, moved: false };
      }}
      onTouchMove={(e) => {
        if (!touch.current) return;
        const dx = (e.touches[0]?.clientX ?? 0) - touch.current.x;
        if (Math.abs(dx) > 24) touch.current.moved = true;
      }}
      onTouchEnd={(e) => {
        if (!touch.current?.moved) {
          touch.current = null;
          return;
        }
        const dx =
          (e.changedTouches[0]?.clientX ?? 0) - (touch.current?.x ?? 0);
        if (dx > 40) go(-1);
        else if (dx < -40) go(1);
        touch.current = null;
      }}
    >
      {current.href ? (
        <Link href={current.href} className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );

  const dots =
    items.length > 1 ? (
      <div className="flex items-center justify-center gap-1.5">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            aria-label={`بنر ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === index
                ? landing
                  ? "w-6 bg-[#14352A]"
                  : "w-5 bg-brand"
                : "w-1.5 bg-[#C9D8CE]"
            )}
          />
        ))}
      </div>
    ) : null;

  if (landing) {
    return (
      <section id="offers" className="bg-[#F6F8F5]">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-bold tracking-wide text-[#C48A12]">
                پیشنهادهای ویژه
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-[#14352A] sm:text-3xl">
                جشنواره‌ها و پیشنهادها
              </h2>
            </div>
            {items.length > 1 ? (
              <p className="text-xs text-muted-foreground" dir="ltr">
                {index + 1}/{items.length}
              </p>
            ) : null}
          </div>
          {slider}
          <div className="mt-4">{dots}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-sm font-bold text-brand">جشنواره‌ها و پیشنهادها</h2>
        {items.length > 1 ? (
          <p className="text-[11px] text-muted-foreground" dir="ltr">
            {index + 1}/{items.length}
          </p>
        ) : null}
      </div>
      {slider}
      {dots}
    </section>
  );
}

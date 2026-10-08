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
    }, 5000);
    return () => window.clearInterval(timer);
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[index] ?? items[0];

  function go(delta: number) {
    setIndex((prev) => (prev + delta + items.length) % items.length);
  }

  function onTouchStart(e: React.TouchEvent) {
    touch.current = { x: e.touches[0]?.clientX ?? 0, moved: false };
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!touch.current) return;
    const dx = (e.touches[0]?.clientX ?? 0) - touch.current.x;
    if (Math.abs(dx) > 24) touch.current.moved = true;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!touch.current?.moved) {
      touch.current = null;
      return;
    }
    const dx = (e.changedTouches[0]?.clientX ?? 0) - (touch.current?.x ?? 0);
    if (dx > 40) go(-1);
    else if (dx < -40) go(1);
    touch.current = null;
  }

  const frame = (
    <div
      className={cn(
        "relative overflow-hidden",
        landing ? "aspect-[21/9] min-h-[180px] rounded-2xl" : "aspect-[16/9] rounded-[1.5rem]"
      )}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Image
        src={current.image}
        alt={current.title}
        fill
        className="object-cover"
        sizes={landing ? "1024px" : "430px"}
        priority={index === 0}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F241C]/80 via-[#14352A]/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
        <p className="text-base font-extrabold text-white sm:text-lg">
          {current.title}
        </p>
        {current.subtitle ? (
          <p className="mt-1 text-xs leading-5 text-white/85 sm:text-sm">
            {current.subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );

  return (
    <section id={landing ? "offers" : undefined} className="space-y-2.5">
      <div className="flex items-center justify-between px-0.5">
        <h2
          className={cn(
            "text-sm font-bold",
            landing ? "text-[#14352A]" : "text-brand"
          )}
        >
          پیشنهادها
        </h2>
        {items.length > 1 ? (
          <p className="text-[11px] text-muted-foreground" dir="ltr">
            {index + 1}/{items.length}
          </p>
        ) : null}
      </div>
      {current.href ? (
        <Link href={current.href} className="block">
          {frame}
        </Link>
      ) : (
        frame
      )}
      {items.length > 1 ? (
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
                  ? "w-5 bg-[#14352A]"
                  : "w-1.5 bg-[#C9D8CE]"
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

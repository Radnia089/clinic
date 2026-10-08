"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
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

  function go(delta: number) {
    if (items.length === 0) return;
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

  if (landing) {
    if (items.length === 0) {
      return (
        <section className="relative isolate min-h-[78svh] w-full overflow-hidden bg-[#14352A] sm:min-h-[85svh]">
          <div className="relative z-10 mx-auto flex min-h-[78svh] w-full max-w-6xl flex-col justify-end px-4 pb-16 pt-12 sm:min-h-[85svh] sm:px-6 sm:pb-20">
            <p className="text-sm font-semibold tracking-wide text-[#F0B429] sm:text-base">
              کلینیک تخصصی لاغری و رژیم درمانی
            </p>
            <h1 className="mt-3 text-5xl font-extrabold text-white sm:text-6xl md:text-7xl">
              تندیس
            </h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/patient/book"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#F0B429] px-6 text-sm font-extrabold text-[#14352A]"
              >
                رزرو نوبت
                <ArrowLeft className="size-4" />
              </Link>
              <Link
                href="/patient/consult"
                className="inline-flex h-12 items-center rounded-xl border border-white/40 bg-white/10 px-6 text-sm font-bold text-white"
              >
                مشاوره آنلاین
              </Link>
            </div>
          </div>
        </section>
      );
    }

    const current = items[index] ?? items[0];

    return (
      <section
        id="offers"
        className="relative isolate min-h-[78svh] w-full overflow-hidden sm:min-h-[85svh]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <Image
          src={current.image}
          alt={current.title}
          fill
          priority={index === 0}
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F241C]/92 via-[#14352A]/40 to-[#14352A]/15" />
        <div className="relative z-10 mx-auto flex min-h-[78svh] w-full max-w-6xl flex-col justify-end px-4 pb-16 pt-12 sm:min-h-[85svh] sm:px-6 sm:pb-20">
          <p className="text-sm font-semibold tracking-wide text-[#F0B429] sm:text-base">
            پیشنهاد ویژه
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
            {current.title}
          </h1>
          {current.subtitle ? (
            <p className="mt-4 max-w-2xl text-sm leading-8 text-white/85 sm:text-base">
              {current.subtitle}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={current.href || "/patient/book"}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#F0B429] px-6 text-sm font-extrabold text-[#14352A] transition hover:bg-[#e0a61f]"
            >
              {current.href ? "مشاهده پیشنهاد" : "رزرو نوبت"}
              <ArrowLeft className="size-4" />
            </Link>
            <Link
              href="/patient/consult"
              className="inline-flex h-12 items-center rounded-xl border border-white/40 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              مشاوره آنلاین
            </Link>
          </div>
          {items.length > 1 ? (
            <div className="mt-10 flex items-center gap-2">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`بنر ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-8 bg-[#F0B429]" : "w-2.5 bg-white/45"
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  const current = items[index] ?? items[0];

  const frame = (
    <div
      className="relative aspect-[16/9] overflow-hidden rounded-[1.5rem]"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <Image
        src={current.image}
        alt={current.title}
        fill
        className="object-cover"
        sizes="430px"
        priority={index === 0}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0F241C]/80 via-[#14352A]/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <p className="text-base font-extrabold text-white">{current.title}</p>
        {current.subtitle ? (
          <p className="mt-1 text-xs leading-5 text-white/85">{current.subtitle}</p>
        ) : null}
      </div>
    </div>
  );

  return (
    <section className="space-y-2.5">
      <div className="flex items-center justify-between px-0.5">
        <h2 className="text-sm font-bold text-brand">پیشنهادها</h2>
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
                i === index ? "w-5 bg-brand" : "w-1.5 bg-[#C9D8CE]"
              )}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

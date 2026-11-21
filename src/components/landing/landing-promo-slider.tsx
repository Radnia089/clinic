"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PromoBanner } from "@/lib/types";

export function LandingPromoSlider({ items }: { items: PromoBanner[] }) {
  const [index, setIndex] = useState(0);
  const count = items.length;

  useEffect(() => {
    if (count <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [count]);

  if (count === 0) {
    return (
      <div className="relative mx-auto h-[240px] max-w-4xl overflow-hidden rounded-[2.2rem] bg-[#F7F7F7] sm:h-[360px]">
        <Image
          src="/images/landing-food-fresh.jpg"
          alt="یک وعده غذایی متعادل"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 900px) 100vw, 900px"
        />
      </div>
    );
  }

  const current = items[index] ?? items[0];

  function go(delta: number) {
    setIndex((prev) => (prev + delta + count) % count);
  }

  const frame = (
    <>
      <Image
        src={current.image}
        alt={current.title}
        fill
        priority={index === 0}
        className="object-cover"
        sizes="(max-width: 900px) 100vw, 900px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
      <div className={`absolute inset-x-0 bottom-0 px-5 text-right sm:px-8 ${count > 1 ? "pb-8" : "pb-5 sm:pb-6"}`}>
        <p className="text-lg font-extrabold text-white sm:text-2xl">{current.title}</p>
        {current.subtitle ? (
          <p className="mt-1 text-sm leading-6 text-white/90">{current.subtitle}</p>
        ) : null}
      </div>
    </>
  );

  return (
    <div className="relative mx-auto h-[240px] max-w-4xl overflow-hidden rounded-[2.2rem] bg-[#F7F7F7] sm:h-[360px]">
      {current.href ? (
        <Link href={current.href} className="absolute inset-0 block">
          {frame}
        </Link>
      ) : (
        frame
      )}
      {count > 1 ? (
        <>
          <button
            type="button"
            aria-label="بنر قبلی"
            onClick={() => go(-1)}
            className="absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#2E9B32] shadow"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            type="button"
            aria-label="بنر بعدی"
            onClick={() => go(1)}
            className="absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#2E9B32] shadow"
          >
            <ChevronLeft className="size-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                aria-label={`بنر ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/60"}`}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

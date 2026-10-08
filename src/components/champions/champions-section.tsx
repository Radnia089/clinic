"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
  type WheelEvent,
} from "react";
import { ArrowLeft } from "lucide-react";
import { lostKg, type Champion } from "@/lib/champions";
import { cn } from "@/lib/utils";

function faNum(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}

function DragScroll({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    active: boolean;
    startX: number;
    scrollLeft: number;
    moved: boolean;
  }>({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const [grabbing, setGrabbing] = useState(false);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    drag.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: el.scrollLeft,
      moved: false,
    };
    setGrabbing(true);
    el.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || !drag.current.active) return;
    const dx = event.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    el.scrollLeft = drag.current.scrollLeft - dx;
  }

  function endDrag(event: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    drag.current.active = false;
    setGrabbing(false);
    try {
      el.releasePointerCapture(event.pointerId);
    } catch {
      /* ignore */
    }
  }

  function onWheel(event: WheelEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      el.scrollLeft += event.deltaY;
      event.preventDefault();
    }
  }

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (event: globalThis.WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      el.scrollLeft += event.deltaY;
      event.preventDefault();
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onWheel={onWheel}
      onClickCapture={(event) => {
        if (drag.current.moved) {
          event.preventDefault();
          event.stopPropagation();
          drag.current.moved = false;
        }
      }}
      className={cn(
        "flex cursor-grab gap-3 overflow-x-auto pb-1 select-none [scrollbar-width:thin] active:cursor-grabbing",
        grabbing && "cursor-grabbing",
        className
      )}
    >
      {children}
    </div>
  );
}

function ChampionCard({
  champion,
  size = "md",
}: {
  champion: Champion;
  size?: "sm" | "md";
}) {
  const lost = lostKg(champion);
  const compact = size === "sm";

  return (
    <article
      className={cn(
        "shrink-0 overflow-hidden rounded-[1.25rem] bg-white shadow-[0_8px_24px_rgba(20,53,42,0.08)]",
        compact ? "w-[188px]" : "w-[280px] sm:w-[300px]"
      )}
    >
      <div className={cn("relative overflow-hidden", compact ? "aspect-[5/6]" : "aspect-[4/5]")}>
        <div className="absolute inset-0 grid grid-cols-2">
          <div className="relative">
            <Image
              src={champion.beforeImage}
              alt={`${champion.name} — قبل`}
              fill
              className="pointer-events-none object-cover object-top grayscale-[35%]"
              sizes={compact ? "94px" : "150px"}
              draggable={false}
            />
            <span
              className={cn(
                "absolute right-1.5 rounded-full bg-black/45 font-bold text-white backdrop-blur-sm",
                compact
                  ? "bottom-1.5 px-1.5 py-0.5 text-[8px]"
                  : "bottom-3 right-2 px-2.5 py-1 text-[10px]"
              )}
            >
              قبل
            </span>
          </div>
          <div className="relative border-r border-white/40">
            <Image
              src={champion.afterImage}
              alt={`${champion.name} — بعد`}
              fill
              className="pointer-events-none object-cover object-top"
              sizes={compact ? "94px" : "150px"}
              draggable={false}
            />
            <span
              className={cn(
                "absolute left-1.5 rounded-full bg-[#14352A]/80 font-bold text-white backdrop-blur-sm",
                compact
                  ? "bottom-1.5 px-1.5 py-0.5 text-[8px]"
                  : "bottom-3 left-2 px-2.5 py-1 text-[10px]"
              )}
            >
              بعد
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />

        <div
          className={cn(
            "absolute inset-x-1.5 flex flex-wrap items-end justify-center gap-1",
            compact ? "bottom-1.5" : "inset-x-3 bottom-3 gap-1.5"
          )}
        >
          {!compact ? (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#14352A] shadow-sm">
              شروع {faNum(champion.startKg)} kg
            </span>
          ) : null}
          <span
            className={cn(
              "rounded-full bg-[#14352A] font-extrabold text-white shadow-md",
              compact ? "px-2 py-1 text-[9px]" : "px-3 py-1.5 text-[11px]"
            )}
          >
            {faNum(lost)} kg کاهش
          </span>
          {!compact ? (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-[#14352A] shadow-sm">
              پایان {faNum(champion.endKg)} kg
            </span>
          ) : null}
        </div>
      </div>

      <div className={cn(compact ? "space-y-0.5 p-2.5" : "space-y-1.5 p-4")}>
        <h3
          className={cn(
            "font-extrabold text-[#14352A]",
            compact ? "text-xs" : "text-sm sm:text-base"
          )}
        >
          {champion.name}
        </h3>
        <p
          className={cn(
            "text-[#1A2E26]/65",
            compact ? "line-clamp-2 text-[10px] leading-4" : "line-clamp-2 text-xs leading-6"
          )}
        >
          {champion.quote}
        </p>
        {compact ? (
          <p className="pt-0.5 text-[10px] font-semibold text-[#14352A]/70">
            {faNum(champion.startKg)} → {faNum(champion.endKg)} kg
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function ChampionsSection({
  items,
  variant = "landing",
}: {
  items: Champion[];
  variant?: "landing" | "patient";
}) {
  if (items.length === 0) return null;

  if (variant === "patient") {
    return (
      <section className="space-y-2.5">
        <div className="flex items-center justify-between gap-3 px-0.5">
          <h2 className="text-sm font-bold text-brand">قهرمانان تندیس</h2>
          <Link
            href="/patient/champions"
            className="text-xs font-medium text-brand"
          >
            مشاهده همه
          </Link>
        </div>
        <DragScroll className="-mx-4 px-4">
          {items.map((item) => (
            <ChampionCard key={item.id} champion={item} size="sm" />
          ))}
        </DragScroll>
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

        <DragScroll className="mt-10">
          {items.map((item) => (
            <ChampionCard key={item.id} champion={item} size="md" />
          ))}
        </DragScroll>
        <p className="mt-3 text-xs text-[#1A2E26]/45">
          برای دیدن بقیه، بکشید یا با چرخ موس افقی اسکرول کنید.
        </p>
      </div>
    </section>
  );
}

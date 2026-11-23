"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef } from "react";
import type { MagazineArticle } from "@/lib/types";

type MagazineCard = Pick<MagazineArticle, "slug" | "title" | "excerpt" | "category" | "coverImage">;

const SPEED_PX_PER_SEC = 42;

export function LandingMagazineRow({ articles }: { articles: MagazineCard[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const motion = useRef({
    offset: 0,
    span: 0,
    step: 0,
    nudge: 0,
    paused: false,
    dragging: false,
    startX: 0,
    startOffset: 0,
    moved: false,
    reduce: false,
    holdUntil: 0,
  });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const card = track.querySelector<HTMLElement>("[data-card]");
      if (!card || articles.length < 2) {
        motion.current.span = 0;
        motion.current.step = 0;
        return;
      }
      const gap = Number.parseFloat(getComputedStyle(track).columnGap || "0") || 0;
      const step = card.offsetWidth + gap;
      motion.current.step = step;
      motion.current.span = step * articles.length;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [articles.length]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () => {
      motion.current.reduce = media.matches;
    };
    applyMotion();
    media.addEventListener("change", applyMotion);
    let last = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;
      const state = motion.current;
      const track = trackRef.current;
      if (track && state.span > 0) {
        const held = state.paused || state.dragging || now < state.holdUntil || document.hidden;
        if (!held && !state.reduce) state.offset += (SPEED_PX_PER_SEC * dt) / 1000;
        if (state.nudge !== 0) {
          const bite = Math.sign(state.nudge) * Math.min(Math.abs(state.nudge), (1100 * dt) / 1000);
          state.nudge -= bite;
          state.offset += bite;
        }
        state.offset = ((state.offset % state.span) + state.span) % state.span;
        track.style.transform = `translate3d(${state.offset}px,0,0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", applyMotion);
    };
  }, []);

  function nudge(direction: 1 | -1) {
    const step = motion.current.step || 320;
    motion.current.nudge += direction * step;
    motion.current.holdUntil = performance.now() + 5000;
  }

  const loops = articles.length > 1;
  const cards = loops ? [...articles, ...articles] : articles;

  return (
    <div
      className="relative mt-6"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") motion.current.paused = true;
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") motion.current.paused = false;
      }}
    >
      <div
        className="cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
        onPointerDown={(event) => {
          if (event.button !== 0 || !loops) return;
          const state = motion.current;
          state.dragging = true;
          state.moved = false;
          state.startX = event.clientX;
          state.startOffset = state.offset;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          const state = motion.current;
          if (!state.dragging) return;
          const dx = event.clientX - state.startX;
          if (Math.abs(dx) > 6) state.moved = true;
          state.offset = state.startOffset + dx;
        }}
        onPointerUp={() => {
          motion.current.dragging = false;
          motion.current.holdUntil = performance.now() + 5000;
        }}
        onPointerCancel={() => {
          motion.current.dragging = false;
        }}
        onClickCapture={(event) => {
          if (!motion.current.moved) return;
          event.preventDefault();
          event.stopPropagation();
          motion.current.moved = false;
        }}
      >
        <div ref={trackRef} className="flex w-max gap-4" dir="rtl">
          {cards.map((article, index) => {
            const copy = index >= articles.length;
            return (
              <Link
                key={`${article.slug}-${index}`}
                href={`/magazine/${article.slug}`}
                data-card=""
                draggable={false}
                tabIndex={copy ? -1 : undefined}
                aria-hidden={copy ? true : undefined}
                className="w-[min(82vw,340px)] shrink-0 overflow-hidden rounded-[1.6rem] bg-white text-right shadow-[0_8px_24px_rgba(0,0,0,0.05)] ring-1 ring-black/5 sm:w-[340px]"
              >
                <div className="relative aspect-[16/10]">
                  <Image
                    src={article.coverImage}
                    alt={copy ? "" : article.title}
                    fill
                    draggable={false}
                    className="object-cover"
                    sizes="340px"
                  />
                </div>
                <div className="space-y-2 p-4">
                  <p className="text-xs font-bold text-[#2E9B32]">{article.category}</p>
                  <h3 className="text-base font-extrabold leading-7">{article.title}</h3>
                  <p className="line-clamp-2 text-sm leading-7 text-[#555]">{article.excerpt}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      {loops ? (
        <>
          <button
            type="button"
            aria-label="مقاله‌های قبلی"
            onClick={() => nudge(-1)}
            className="absolute right-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#2E9B32] shadow"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            type="button"
            aria-label="مقاله‌های بعدی"
            onClick={() => nudge(1)}
            className="absolute left-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-[#2E9B32] shadow"
          >
            <ChevronLeft className="size-5" />
          </button>
        </>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Home,
  ClipboardList,
  BarChart3,
  BookOpen,
  Scale,
  Video,
  Gift,
  Star,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ClinicLogo } from "@/components/brand/clinic-logo";
import { ChampionsSection } from "@/components/champions/champions-section";
import { PatientProgressScreen } from "@/components/patient/patient-progress";
import { PromoBannerSlider } from "@/components/patient/promo-banner-slider";
import type { Champion, PromoBanner } from "@/lib/types";

const quickActions = [
  {
    label: "محاسبه BMI",
    icon: Scale,
    tone: "coral",
    href: "/patient/bmi" as string | undefined,
  },
  {
    label: "نوبت حضوری",
    icon: MapPin,
    tone: "mint",
    href: "/patient/book",
  },
  {
    label: "مشاوره آنلاین",
    icon: Video,
    tone: "peach",
    href: "/patient/consult",
  },
  {
    label: "پیشرفت",
    icon: BarChart3,
    tone: "green",
    href: undefined as string | undefined,
  },
];

function ProgressRing({ value }: { value: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative size-[108px] shrink-0">
      <svg viewBox="0 0 108 108" className="size-full -rotate-90">
        <circle
          cx="54"
          cy="54"
          r={radius}
          fill="none"
          stroke="oklch(0.9 0.03 155)"
          strokeWidth="10"
        />
        <circle
          cx="54"
          cy="54"
          r={radius}
          fill="none"
          stroke="oklch(0.42 0.08 155)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-extrabold text-brand">
          {new Intl.NumberFormat("fa-IR").format(value)}٪
        </span>
      </div>
    </div>
  );
}

export function PatientHomeScreen({
  champions = [],
  promoBanners = [],
}: {
  champions?: Champion[];
  promoBanners?: PromoBanner[];
}) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState("home");

  useEffect(() => {
    const initial = searchParams.get("tab");
    if (
      initial === "progress" ||
      initial === "plan" ||
      initial === "more" ||
      initial === "home"
    ) {
      setTab(initial);
    }
  }, [searchParams]);

  return (
    <div className="mx-auto flex min-h-[100svh] w-full max-w-[430px] flex-col bg-[#F7F8F6] text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
      {tab === "progress" ? (
        <PatientProgressScreen />
      ) : (
        <div className="flex-1 space-y-4 px-4 pb-28 pt-5">
          <header className="flex items-start justify-between gap-3">
            <div>
              <ClinicLogo compact />
              <p className="mt-1 text-[11px] text-muted-foreground">
                کلینیک تخصصی لاغری و رژیم درمانی تندیس
              </p>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-brand">سلام سارا 🍃</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                امروز یک قدم به هدف نزدیک‌تری
              </p>
            </div>
          </header>

          <section className="rounded-[28px] bg-[#E8F2EA] p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground">وزن فعلی</p>
                  <p className="text-xl font-extrabold text-brand">
                    ۷۱٫۲ <span className="text-sm font-semibold">kg</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">هدف</p>
                  <p className="text-xl font-extrabold text-brand">
                    ۶۵ <span className="text-sm font-semibold">kg</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <ProgressRing value={62} />
                <p className="text-[11px] text-muted-foreground">
                  در مسیر بهتر شدن
                </p>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-4 gap-2.5">
            {quickActions.map((action) => {
              const Icon = action.icon;
              const className =
                "flex flex-col items-center gap-2 rounded-2xl bg-white px-1 py-3 shadow-[0_6px_18px_rgba(35,70,55,0.06)] transition active:scale-[0.98]";
              const content = (
                <>
                  <span
                    className={cn(
                      "flex size-11 items-center justify-center rounded-2xl",
                      action.tone === "green" && "bg-[#E7F3EA] text-[#2F6B4F]",
                      action.tone === "coral" && "bg-[#F8E8E4] text-[#D86B5C]",
                      action.tone === "mint" && "bg-[#E9F6F1] text-[#3C8A6E]",
                      action.tone === "peach" && "bg-[#FBEFE8] text-[#E0896A]"
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                  <span className="text-[11px] font-medium text-foreground/80">
                    {action.label}
                  </span>
                </>
              );
              if (action.href) {
                return (
                  <Link key={action.label} href={action.href} className={className}>
                    {content}
                  </Link>
                );
              }
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => {
                    if (action.label === "پیشرفت") setTab("progress");
                  }}
                  className={className}
                >
                  {content}
                </button>
              );
            })}
          </section>

          <PromoBannerSlider items={promoBanners} />

          <ChampionsSection variant="patient" items={champions} />

          <section className="flex items-center justify-between gap-3 rounded-[28px] bg-[#F6E6E1] px-4 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-white/80 text-[#D86B5C]">
                <Gift className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-[#9A4E42]">باشگاه تندیس</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-[#9A4E42]/80">
                  <Star className="size-3.5 fill-[#E0A24A] text-[#E0A24A]" />
                  ۱۸۰ امتیاز
                </p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-full bg-[#D86B5C] px-4 py-2 text-xs font-semibold text-white"
            >
              مشاهده جوایز
            </button>
          </section>

          <div className="pt-1 text-center">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-brand"
            >
              تغییر اپ
            </Link>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[430px] border-t border-black/5 bg-white/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        <ul className="grid grid-cols-4">
          {[
            { id: "home", label: "خانه", icon: Home, href: undefined as string | undefined },
            { id: "plan", label: "برنامه من", icon: ClipboardList, href: undefined },
            { id: "progress", label: "پیشرفت", icon: BarChart3, href: undefined },
            { id: "magazine", label: "مجله", icon: BookOpen, href: "/patient/magazine" },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            const className = cn(
              "flex w-full flex-col items-center gap-1 rounded-2xl py-2 text-[11px]",
              active ? "text-brand" : "text-muted-foreground"
            );
            if (item.href) {
              return (
                <li key={item.id}>
                  <Link href={item.href} className={className}>
                    <Icon className="size-5" />
                    {item.label}
                  </Link>
                </li>
              );
            }
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={className}
                >
                  <Icon className={cn("size-5", active && "stroke-[2.25]")} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Home,
  ClipboardList,
  BarChart3,
  MoreHorizontal,
  CalendarDays,
  Scale,
  Clock3,
  MessageCircle,
  ChevronLeft,
  UtensilsCrossed,
  Gift,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ClinicLogo } from "@/components/brand/clinic-logo";
import { PatientProgressScreen } from "@/components/patient/patient-progress";

const meals = [
  {
    id: "breakfast",
    title: "صبحانه",
    desc: "نان سبوس‌دار، تخم‌مرغ آب‌پز، خیار و گوجه",
    image: "/images/meals/breakfast.jpg",
  },
  {
    id: "lunch",
    title: "ناهار",
    desc: "سینه مرغ کبابی، برنج قهوه‌ای، سالاد فصل",
    image: "/images/meals/lunch.jpg",
  },
  {
    id: "dinner",
    title: "شام",
    desc: "سوپ سبزیجات، ماست کم‌چرب، سالاد سبز",
    image: "/images/meals/dinner.jpg",
  },
];

const quickActions = [
  { label: "برنامه امروز", icon: CalendarDays, tone: "green" },
  { label: "ثبت وزن", icon: Scale, tone: "coral" },
  { label: "جلسه بعد", icon: Clock3, tone: "mint" },
  { label: "پیام به مشاور", icon: MessageCircle, tone: "peach" },
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

export function PatientHomeScreen() {
  const searchParams = useSearchParams();
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState("home");

  useEffect(() => {
    const initial = searchParams.get("tab");
    if (initial === "progress" || initial === "plan" || initial === "more" || initial === "home") {
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
            <p className="mt-1 text-[11px] text-muted-foreground">کلینیک لاغری تندیس یزد</p>
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
                  ۷۱٫۲ <span className="text-sm font-semibold">کیلوگرم</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">هدف</p>
                <p className="text-xl font-extrabold text-brand">
                  ۶۵ <span className="text-sm font-semibold">کیلوگرم</span>
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ProgressRing value={62} />
              <p className="text-[11px] text-muted-foreground">در مسیر بهتر شدن</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-4 gap-2.5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  if (action.label === "ثبت وزن" || action.label === "جلسه بعد") {
                    setTab("progress");
                  }
                }}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white px-1 py-3 shadow-[0_6px_18px_rgba(35,70,55,0.06)] transition active:scale-[0.98]"
              >
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
                <span className="text-[11px] font-medium text-foreground/80">{action.label}</span>
              </button>
            );
          })}
        </section>

        <section className="flex items-center gap-3 rounded-[24px] bg-white px-4 py-3.5 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#E8F2EA] text-brand">
            <CalendarDays className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-brand">جلسه بعدی</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              سه‌شنبه، ۲۸ شهریور • ساعت ۱۷:۳۰
            </p>
          </div>
          <ChevronLeft className="size-5 text-muted-foreground" />
        </section>

        <section className="rounded-[28px] bg-white p-4 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="size-4 text-brand" />
              <h2 className="text-sm font-bold text-brand">برنامه امروز</h2>
            </div>
            <button type="button" className="flex items-center gap-1 text-xs text-brand">
              مشاهده جزئیات
              <ChevronLeft className="size-3.5" />
            </button>
          </div>

          <ul className="space-y-3">
            {meals.map((meal) => {
              const checked = !!done[meal.id];
              return (
                <li key={meal.id} className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label={`علامت‌گذاری ${meal.title}`}
                    onClick={() =>
                      setDone((prev) => ({ ...prev, [meal.id]: !prev[meal.id] }))
                    }
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition",
                      checked
                        ? "border-brand bg-brand text-white"
                        : "border-[#C9D8CE] bg-transparent"
                    )}
                  >
                    {checked ? (
                      <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden>
                        <path
                          d="M3.5 8.2 6.4 11l6-6.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{meal.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{meal.desc}</p>
                  </div>
                  <div className="relative size-12 overflow-hidden rounded-full">
                    <Image src={meal.image} alt={meal.title} fill className="object-cover" />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

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
          <Link href="/patient/book" className="text-xs font-medium text-brand underline-offset-2 hover:underline">
            رزرو نوبت جدید
          </Link>
          <span className="mx-2 text-muted-foreground">·</span>
          <Link href="/" className="text-xs text-muted-foreground hover:text-brand">
            تغییر اپ
          </Link>
        </div>
      </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[430px] border-t border-black/5 bg-white/95 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
        <ul className="grid grid-cols-4">
          {[
            { id: "home", label: "خانه", icon: Home },
            { id: "plan", label: "برنامه من", icon: ClipboardList },
            { id: "progress", label: "پیشرفت", icon: BarChart3 },
            { id: "more", label: "بیشتر", icon: MoreHorizontal },
          ].map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "flex w-full flex-col items-center gap-1 rounded-2xl py-2 text-[11px]",
                    active ? "text-brand" : "text-muted-foreground"
                  )}
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

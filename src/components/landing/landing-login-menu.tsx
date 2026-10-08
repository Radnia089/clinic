"use client";

import Link from "next/link";
import { ArrowLeft, UserRound, Users, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const entries = [
  {
    label: "مشتری",
    href: "/patient/login",
    hint: "ورود با کد یکبارمصرف",
    icon: UserRound,
  },
  {
    label: "کارکنان",
    href: "/login?next=/clinic/reception",
    hint: "پذیرش و میز کار",
    icon: Users,
  },
  {
    label: "مدیریت",
    href: "/login?next=/clinic",
    hint: "پنل مدیر",
    icon: Building2,
  },
] as const;

export function LandingLoginMenu({
  variant = "solid",
  className,
}: {
  variant?: "solid" | "outline" | "footer";
  className?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          "inline-flex h-10 shrink-0 items-center justify-center rounded-full px-4 text-sm font-bold transition sm:px-5",
          variant === "solid" &&
            "bg-[#14352A] text-white hover:bg-[#1f4a3a]",
          variant === "outline" &&
            "border border-[#14352A]/15 bg-white text-[#14352A] hover:bg-[#F0F4F1]",
          variant === "footer" &&
            "h-auto rounded-none bg-transparent p-0 px-0 font-normal text-white/75 hover:bg-transparent hover:text-white",
          className
        )}
      >
        ورود
      </DialogTrigger>
      <DialogContent
        className="w-[min(100%,20rem)] gap-3 rounded-2xl border-0 bg-[#F6F8F5] p-4 text-[#1A2E26] shadow-xl ring-1 ring-[#1A2E26]/10 sm:max-w-xs"
        dir="rtl"
      >
        <DialogHeader className="gap-1 pe-6 text-right">
          <DialogTitle className="text-base font-extrabold text-[#14352A]">
            ورود به پنل
          </DialogTitle>
          <DialogDescription className="text-xs text-[#1A2E26]/65">
            نقش خود را انتخاب کنید
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {entries.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-xl bg-white px-3 py-3 ring-1 ring-[#1A2E26]/08 transition hover:bg-[#E8F2EA] hover:ring-[#14352A]/15"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#14352A]/08 text-[#14352A]">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1 text-right">
                  <span className="block text-sm font-extrabold text-[#14352A]">
                    {item.label}
                  </span>
                  <span className="block text-[11px] text-[#1A2E26]/55">
                    {item.hint}
                  </span>
                </span>
                <ArrowLeft className="size-4 shrink-0 text-[#14352A]/40 transition group-hover:-translate-x-0.5 group-hover:text-[#14352A]" />
              </Link>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

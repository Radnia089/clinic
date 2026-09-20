"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  LayoutDashboard,
  Users,
  UserPlus,
  Wallet,
  CalendarCheck,
  Stethoscope,
  LineChart,
  Leaf,
} from "lucide-react";

const receptionLinks = [
  { href: "/clinic/reception", label: "میز پذیرش", icon: Stethoscope, short: "پذیرش" },
  { href: "/clinic/reception/new", label: "ثبت جدید", icon: UserPlus, short: "ثبت" },
  { href: "/clinic/reception/visitors", label: "مراجعه‌کنندگان", icon: Users, short: "صف" },
  { href: "/clinic/reception/admitted", label: "پذیرش‌شده‌ها", icon: ClipboardList, short: "پرونده" },
  { href: "/clinic/progress", label: "وزن و سایز", icon: LineChart, short: "اندازه" },
];

const managementLinks = [
  { href: "/clinic", label: "داشبورد", icon: LayoutDashboard, short: "مدیریت" },
  { href: "/clinic/finance", label: "مالی", icon: Wallet, short: "مالی" },
  { href: "/clinic/appointments", label: "نوبت‌ها", icon: CalendarCheck, short: "نوبت" },
];

function isActive(pathname: string, href: string) {
  if (href === "/clinic/reception") {
    return pathname === "/clinic/reception";
  }
  if (href === "/clinic") {
    return pathname === "/clinic";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function ClinicShell({
  children,
  version,
}: {
  children: React.ReactNode;
  version: string;
}) {
  const pathname = usePathname();
  const isReceptionArea =
    pathname.startsWith("/clinic/reception") || pathname.startsWith("/clinic/progress");

  return (
    <div className="min-h-screen bg-[#EEF1EE] text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1200px]">
        <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-l border-black/5 bg-[#F7F8F6] p-5 md:flex">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#E8F2EA] text-brand">
              <Leaf className="size-6" />
            </div>
            <div>
              <p className="text-[15px] font-extrabold text-brand">کلینیک تندیس یزد</p>
              <p className="text-xs text-muted-foreground">اپ کلینیک · v{version}</p>
            </div>
          </div>

          <div className="mt-6 rounded-[24px] bg-[#E8F2EA] p-4">
            <p className="text-sm font-bold text-brand">سلام منشی 👋</p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              امروز مراجعه‌ها را سریع ثبت و پذیرش کن.
            </p>
          </div>

          <nav className="mt-6 flex-1 space-y-5 overflow-y-auto">
            <div>
              <p className="mb-2 px-2 text-[11px] font-semibold tracking-wide text-muted-foreground">
                پذیرش
              </p>
              <ul className="space-y-1.5">
                {receptionLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(pathname, link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm transition",
                          active
                            ? "bg-brand text-white shadow-sm"
                            : "text-foreground/80 hover:bg-white"
                        )}
                      >
                        <Icon className="size-4" />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div>
              <p className="mb-2 px-2 text-[11px] font-semibold tracking-wide text-muted-foreground">
                مدیریت
              </p>
              <ul className="space-y-1.5">
                {managementLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(pathname, link.href);
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm transition",
                          active
                            ? "bg-brand text-white shadow-sm"
                            : "text-foreground/80 hover:bg-white"
                        )}
                      >
                        <Icon className="size-4" />
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          <Link
            href="/"
            className="mt-4 rounded-2xl bg-white px-3 py-2.5 text-sm text-muted-foreground transition hover:text-brand"
          >
            بازگشت به انتخاب اپ
          </Link>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-black/5 bg-[#F7F8F6]/90 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 md:hidden">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-[#E8F2EA] text-brand">
                  <Leaf className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-brand">تندیس</p>
                  <p className="text-[11px] text-muted-foreground">
                    {isReceptionArea ? "بخش پذیرش" : "پنل کلینیک"}
                  </p>
                </div>
              </div>
              <div className="hidden md:block">
                <p className="text-xs text-muted-foreground">
                  {isReceptionArea ? "میز کار منشی" : "مدیریت کلینیک"}
                </p>
                <h1 className="text-lg font-extrabold text-brand">کلینیک رژیم درمانی تندیس</h1>
              </div>
              <span className="rounded-full bg-[#E8F2EA] px-3 py-1 text-xs font-medium text-brand">
                نسخه {version}
              </span>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
              {[...receptionLinks, ...managementLinks].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium",
                    isActive(pathname, link.href)
                      ? "bg-brand text-white"
                      : "bg-white text-muted-foreground"
                  )}
                >
                  {link.short ?? link.label}
                </Link>
              ))}
            </div>
          </header>

          <main className="flex-1 px-4 py-5 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

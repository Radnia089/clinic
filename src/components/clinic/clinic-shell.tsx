"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClinicLogo } from "@/components/brand/clinic-logo";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  LayoutDashboard,
  Users,
  UserPlus,
  Wallet,
  CalendarCheck,
  Stethoscope,
} from "lucide-react";

const receptionLinks = [
  { href: "/clinic/reception", label: "میز پذیرش", icon: Stethoscope },
  { href: "/clinic/reception/new", label: "ثبت مراجعه‌کننده", icon: UserPlus },
  { href: "/clinic/reception/visitors", label: "لیست مراجعه‌کنندگان", icon: Users },
  { href: "/clinic/reception/admitted", label: "پذیرش‌شده‌ها", icon: ClipboardList },
];

const managementLinks = [
  { href: "/clinic", label: "داشبورد مدیریت", icon: LayoutDashboard },
  { href: "/clinic/finance", label: "مالی و پرداخت‌ها", icon: Wallet },
  { href: "/clinic/appointments", label: "نوبت‌های آنلاین", icon: CalendarCheck },
];

export function ClinicShell({
  children,
  version,
}: {
  children: React.ReactNode;
  version: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen yazd-grain">
      <div className="yazd-pattern pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="hidden w-72 shrink-0 border-l border-border/70 bg-card/80 p-5 backdrop-blur md:block">
          <ClinicLogo />
          <p className="mt-4 text-xs text-muted-foreground">اپ کلینیک · نسخه {version}</p>

          <nav className="mt-8 space-y-6">
            <div>
              <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">منشی / پذیرش</p>
              <ul className="space-y-1">
                {receptionLinks.map((link) => {
                  const Icon = link.icon;
                  const active =
                    pathname === link.href ||
                    (link.href !== "/clinic/reception" && pathname.startsWith(link.href));
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors",
                          active
                            ? "bg-brand text-primary-foreground"
                            : "text-foreground hover:bg-brand-soft"
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
              <p className="mb-2 px-2 text-xs font-semibold text-muted-foreground">مدیریت</p>
              <ul className="space-y-1">
                {managementLinks.map((link) => {
                  const Icon = link.icon;
                  const active = pathname === link.href;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors",
                          active
                            ? "bg-brand text-primary-foreground"
                            : "text-foreground hover:bg-brand-soft"
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
            className="mt-10 block rounded-xl px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            بازگشت به انتخاب اپ
          </Link>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex items-center justify-between gap-3 md:hidden">
              <ClinicLogo compact />
              <span className="text-xs text-muted-foreground">v{version}</span>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
              {[...receptionLinks, ...managementLinks].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-1.5 text-xs",
                    pathname === link.href
                      ? "bg-brand text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="hidden items-center justify-between md:flex">
              <div>
                <h1 className="text-lg font-bold text-brand">کلینیک رژیم درمانی تندیس</h1>
                <p className="text-sm text-muted-foreground">پنل عملیاتی پذیرش و مدیریت</p>
              </div>
              <span className="rounded-full bg-brand-soft px-3 py-1 text-xs font-medium text-brand">
                نسخه {version}
              </span>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

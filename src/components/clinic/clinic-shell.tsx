"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ClinicLogo } from "@/components/brand/clinic-logo";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Wallet,
  CalendarCheck,
  Stethoscope,
  LogOut,
  MessageSquare,
  BookOpen,
  Video,
  Trophy,
  ImageIcon,
  BookMarked,
} from "lucide-react";

const receptionLinks = [
  { href: "/clinic/reception", label: "میز پذیرش", icon: Stethoscope, short: "پذیرش" },
  { href: "/clinic/reception/new", label: "ثبت جدید", icon: UserPlus, short: "ثبت" },
  { href: "/clinic/reception/customers", label: "لیست مشتریان", icon: Users, short: "مشتریان" },
];

const managementLinks = [
  { href: "/clinic", label: "داشبورد", icon: LayoutDashboard, short: "مدیریت" },
  { href: "/clinic/reminders", label: "پیامک و تبلیغات", icon: MessageSquare, short: "پیامک" },
  { href: "/clinic/finance", label: "مالی کلینیک", icon: Wallet, short: "مالی" },
  {
    href: "/clinic/personal-accounting",
    label: "حسابداری شخصی",
    icon: BookOpen,
    short: "حساب شخصی",
    managerOnly: true,
  },
  {
    href: "/clinic/champions",
    label: "قهرمانان",
    icon: Trophy,
    short: "قهرمانان",
    managerOnly: true,
  },
  {
    href: "/clinic/banners",
    label: "بنرهای تبلیغاتی",
    icon: ImageIcon,
    short: "بنرها",
    managerOnly: true,
  },
  {
    href: "/clinic/magazine",
    label: "مجله",
    icon: BookMarked,
    short: "مجله",
    managerOnly: true,
  },
  { href: "/clinic/appointments", label: "نوبت‌ها", icon: CalendarCheck, short: "نوبت" },
  {
    href: "/clinic/online-consults",
    label: "مشاوره آنلاین",
    icon: Video,
    short: "آنلاین",
  },
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
  userName,
  userRole,
}: {
  children: React.ReactNode;
  version: string;
  userName?: string;
  userRole?: "reception" | "management";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isReceptionArea =
    pathname.startsWith("/clinic/reception") || pathname.startsWith("/clinic/progress");
  const isManager = userRole === "management";
  const visibleManagementLinks = managementLinks.filter(
    (link) => !("managerOnly" in link && link.managerOnly) || isManager
  );

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#EEF1EE] text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1200px]">
        <aside className="sticky top-0 hidden h-screen w-[280px] shrink-0 flex-col border-l border-black/5 bg-[#F7F8F6] p-5 md:flex">
          <div>
            <ClinicLogo />
            <p className="mt-1.5 text-xs text-muted-foreground">اپ کلینیک · یزد · v{version}</p>
          </div>

          <div className="mt-6 rounded-[24px] bg-[#E8F2EA] p-4">
            <p className="text-sm font-bold text-brand">سلام {userName || "کاربر"} 👋</p>
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
                {visibleManagementLinks.map((link) => {
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

          <button
            type="button"
            onClick={logout}
            className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-3 py-2.5 text-sm text-muted-foreground transition hover:text-brand"
          >
            <LogOut className="size-4" />
            خروج از حساب
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-black/5 bg-[#F7F8F6]/90 px-4 py-3 backdrop-blur md:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="md:hidden">
                <ClinicLogo compact />
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {userName || (isReceptionArea ? "بخش پذیرش" : "پنل کلینیک")}
                </p>
              </div>
              <div className="hidden md:block">
                <p className="text-xs text-muted-foreground">
                  {isReceptionArea ? "میز کار منشی" : "مدیریت کلینیک"}
                </p>
                <h1 className="text-lg font-extrabold text-brand">کلینیک رژیم درمانی تندیس</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#E8F2EA] px-3 py-1 text-xs font-medium text-brand">
                  نسخه {version}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-muted-foreground md:hidden"
                >
                  خروج
                </button>
              </div>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 md:hidden">
              {[...receptionLinks, ...visibleManagementLinks].map((link) => (
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

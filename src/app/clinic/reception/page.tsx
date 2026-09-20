import Link from "next/link";
import {
  UserPlus,
  Users,
  ClipboardList,
  LineChart,
  ChevronLeft,
  CalendarDays,
} from "lucide-react";
import { PageHeader, SoftCard } from "@/components/clinic/page-header";
import { getDashboardStats, listVisits } from "@/lib/store";
import { formatDateFa } from "@/lib/types";

export default async function ReceptionHomePage() {
  const [stats, visits] = await Promise.all([getDashboardStats(), listVisits()]);
  const recent = visits.slice(0, 4);

  const actions = [
    {
      href: "/clinic/reception/new",
      title: "ثبت مراجعه‌کننده",
      desc: "اطلاعات عمومی + نوع مراجعه",
      icon: UserPlus,
      tone: "bg-[#E8F2EA] text-[#2F6B4F]",
    },
    {
      href: "/clinic/reception/visitors",
      title: "صف مراجعه‌کنندگان",
      desc: `${stats.visitors} نفر منتظر پذیرش`,
      icon: Users,
      tone: "bg-[#F8E8E4] text-[#D86B5C]",
    },
    {
      href: "/clinic/reception/admitted",
      title: "پذیرش‌شده‌ها",
      desc: `${stats.admitted} پرونده فعال`,
      icon: ClipboardList,
      tone: "bg-[#E9F6F1] text-[#3C8A6E]",
    },
    {
      href: "/clinic/progress",
      title: "ثبت وزن و سایز",
      desc: "به‌روزرسانی نمودار پیشرفت",
      icon: LineChart,
      tone: "bg-[#FBEFE8] text-[#E0896A]",
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="میز کار منشی"
        title="پذیرش امروز"
        description="ثبت ورود، تکمیل فرم پذیرش و پیگیری صف — با همان حس اپ تندیس."
        action={
          <Link
            href="/clinic/reception/new"
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#D86B5C] px-5 text-sm font-semibold text-white shadow-sm"
          >
            <UserPlus className="size-4" />
            ثبت جدید
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "مشتریان", value: stats.patients, tone: "bg-[#E8F2EA]" },
          { label: "در صف", value: stats.visitors, tone: "bg-[#F8E8E4]" },
          { label: "پذیرش‌شده", value: stats.admitted, tone: "bg-[#E9F6F1]" },
          { label: "نوبت آنلاین", value: stats.pendingAppointments, tone: "bg-[#FBEFE8]" },
        ].map((item) => (
          <div key={item.label} className={`rounded-[24px] ${item.tone} p-4`}>
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="mt-2 text-2xl font-extrabold text-brand">
              {new Intl.NumberFormat("fa-IR").format(item.value)}
            </p>
          </div>
        ))}
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="flex items-center gap-3 rounded-[24px] bg-white p-4 shadow-[0_6px_18px_rgba(35,70,55,0.06)] transition hover:-translate-y-0.5"
            >
              <span className={`flex size-12 items-center justify-center rounded-2xl ${action.tone}`}>
                <Icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-brand">{action.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{action.desc}</p>
              </div>
              <ChevronLeft className="size-5 text-muted-foreground" />
            </Link>
          );
        })}
      </section>

      <SoftCard>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="size-4 text-brand" />
            <h3 className="text-sm font-bold text-brand">آخرین مراجعات</h3>
          </div>
          <Link href="/clinic/reception/visitors" className="text-xs font-medium text-brand">
            مشاهده همه
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            هنوز مراجعه‌ای ثبت نشده است.
          </p>
        ) : (
          <ul className="space-y-3">
            {recent.map((visit) => (
              <li
                key={visit.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-[#F7F8F6] px-3 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {visit.visitType === "package" ? "پکیج لاغری" : "ویزیت"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateFa(visit.visitDate)}
                  </p>
                </div>
                <Link
                  href={`/clinic/reception/admission/${visit.id}`}
                  className="text-xs font-medium text-brand"
                >
                  فرم پذیرش
                </Link>
              </li>
            ))}
          </ul>
        )}
      </SoftCard>
    </div>
  );
}

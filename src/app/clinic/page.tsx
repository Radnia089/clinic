import Link from "next/link";
import { PageHeader } from "@/components/clinic/page-header";
import { getDashboardStats, listAppointments, listVisits } from "@/lib/store";
import { formatDateFa, formatMoney } from "@/lib/types";

export default async function ClinicDashboardPage() {
  const [stats, visits, appointments] = await Promise.all([
    getDashboardStats(),
    listVisits(),
    listAppointments(),
  ]);

  const cards = [
    { label: "مشتریان ثبت‌شده", value: stats.patients },
    { label: "مراجعه‌کنندگان امروز/باز", value: stats.visitors },
    { label: "پذیرش‌شده‌ها", value: stats.admitted },
    { label: "نوبت‌های جدید آنلاین", value: stats.pendingAppointments },
    { label: "دریافتی‌ها", value: formatMoney(stats.revenue) },
    { label: "مانده طلب", value: formatMoney(stats.outstanding) },
  ];

  return (
    <div>
      <PageHeader
        title="داشبورد مدیریت"
        description="نمای کلی وضعیت کلینیک رژیم درمانی تندیس برای تصمیم‌گیری سریع."
        action={
          <Link
            href="/clinic/reception/new"
            className="inline-flex h-11 items-center rounded-xl bg-cta px-5 text-sm font-medium text-cta-foreground hover:bg-cta/90"
          >
            ثبت مراجعه‌کننده جدید
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm"
          >
            <p className="text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-3 text-2xl font-bold text-brand">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-border/70 bg-card/90 p-5">
          <h3 className="font-semibold text-brand">آخرین مراجعات</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {visits.slice(0, 5).map((visit) => (
              <li key={visit.id} className="flex justify-between gap-3 border-b border-border/50 pb-2">
                <span>{visit.visitType === "package" ? "پکیج" : "ویزیت"}</span>
                <span className="text-muted-foreground">{formatDateFa(visit.visitDate)}</span>
              </li>
            ))}
            {visits.length === 0 ? (
              <li className="text-muted-foreground">هنوز مراجعه‌ای ثبت نشده است.</li>
            ) : null}
          </ul>
        </div>
        <div className="rounded-3xl border border-border/70 bg-card/90 p-5">
          <h3 className="font-semibold text-brand">درخواست نوبت آنلاین</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {appointments.slice(0, 5).map((item) => (
              <li key={item.id} className="flex justify-between gap-3 border-b border-border/50 pb-2">
                <span>{item.name}</span>
                <span className="text-muted-foreground">{item.service}</span>
              </li>
            ))}
            {appointments.length === 0 ? (
              <li className="text-muted-foreground">نوبت آنلاینی در صف نیست.</li>
            ) : null}
          </ul>
          <Link href="/clinic/appointments" className="mt-4 inline-block text-sm text-brand hover:underline">
            مدیریت نوبت‌ها
          </Link>
        </div>
      </div>
    </div>
  );
}

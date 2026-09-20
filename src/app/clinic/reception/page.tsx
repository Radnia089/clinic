import Link from "next/link";
import { PageHeader } from "@/components/clinic/page-header";
import { getDashboardStats } from "@/lib/store";

export default async function ReceptionHomePage() {
  const stats = await getDashboardStats();

  const actions = [
    {
      href: "/clinic/reception/new",
      title: "ثبت مراجعه‌کننده جدید",
      desc: "اطلاعات عمومی + تاریخ مراجعه + نوع ویزیت یا پکیج",
    },
    {
      href: "/clinic/reception/visitors",
      title: "لیست مراجعه‌کنندگان",
      desc: `${stats.visitors} نفر در صف پذیرش`,
    },
    {
      href: "/clinic/reception/admitted",
      title: "پذیرش‌شده‌ها",
      desc: `${stats.admitted} پرونده تکمیل‌شده`,
    },
  ];

  return (
    <div>
      <PageHeader
        title="میز پذیرش"
        description="جریان کار منشی: ثبت ورود مشتری، تکمیل فرم پذیرش تخصصی، و پیگیری لیست‌ها در جدول."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group rounded-3xl border border-border/70 bg-card/90 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
          >
            <h3 className="text-lg font-bold text-brand group-hover:underline">{action.title}</h3>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

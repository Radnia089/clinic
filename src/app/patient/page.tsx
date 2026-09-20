import Link from "next/link";
import { ClinicLogo } from "@/components/brand/clinic-logo";
import { PatientBookingForm } from "@/components/patient/booking-form";
import { getAppData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PatientAppPage() {
  const { clinic } = await getAppData();

  return (
    <div className="min-h-screen yazd-grain">
      <div className="yazd-pattern pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <ClinicLogo />
          <div className="text-left text-xs text-muted-foreground" dir="ltr">
            v{clinic.version}
          </div>
        </div>

        <section className="overflow-hidden rounded-[2rem] bg-brand p-6 text-primary-foreground sm:p-10">
          <p className="text-sm text-white/80">اپ مشتری</p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">{clinic.fullName}</h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-white/90">{clinic.tagline}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#booking"
              className="inline-flex h-11 items-center rounded-xl bg-cta px-5 text-sm font-medium text-cta-foreground"
            >
              رزرو نوبت
            </a>
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-xl border border-white/30 px-5 text-sm"
            >
              تغییر اپ
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-border/70 bg-card/90 p-5">
            <h2 className="font-bold text-brand">آدرس</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{clinic.address}</p>
          </div>
          <div className="rounded-3xl border border-border/70 bg-card/90 p-5">
            <h2 className="font-bold text-brand">تماس و ساعات</h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground" dir="ltr">
              {clinic.phone}
            </p>
            <p className="text-sm leading-7 text-muted-foreground">{clinic.hours}</p>
          </div>
        </section>

        <section className="mt-8 rounded-3xl border border-border/70 bg-card/90 p-5 sm:p-6">
          <h2 className="text-xl font-bold text-brand">خدمات کلینیک</h2>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-muted-foreground">
            <li>مشاوره و ویزیت رژیم درمانی</li>
            <li>پکیج‌های تخصصی لاغری با پیگیری منظم</li>
            <li>ثبت اطلاعات سلامتی و برنامه تغذیه شخصی</li>
            <li>هماهنگی نوبت حضوری از طریق اپ</li>
          </ul>
        </section>

        <section id="booking" className="mt-10 scroll-mt-8">
          <h2 className="mb-4 text-2xl font-bold text-brand">رزرو نوبت</h2>
          <PatientBookingForm />
        </section>
      </div>
    </div>
  );
}

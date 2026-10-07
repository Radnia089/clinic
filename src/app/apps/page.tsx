import Link from "next/link";
import { ClinicLogo } from "@/components/brand/clinic-logo";
import { getAppData } from "@/lib/store";

export const dynamic = "force-dynamic";

/** درگاه ورود به اپ مشتری و اپ کلینیک */
export default async function AppsPortalPage() {
  const { clinic } = await getAppData();

  return (
    <div className="relative min-h-screen overflow-hidden yazd-grain">
      <div className="yazd-pattern pointer-events-none absolute inset-0 opacity-50" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-4 py-16 sm:px-6">
        <div className="animate-rise mb-10 flex items-center justify-between gap-4">
          <ClinicLogo />
          <Link href="/" className="text-sm font-medium text-brand hover:underline">
            بازگشت به سایت
          </Link>
        </div>

        <h1 className="animate-rise-delay-1 max-w-3xl text-3xl font-extrabold leading-tight text-brand sm:text-4xl">
          ورود به اپلیکیشن‌های تندیس
        </h1>
        <p className="animate-rise-delay-2 mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
          نسخه {clinic.version} — اپ مشتری برای مراجعه‌کننده و اپ کلینیک برای پذیرش و
          مدیریت.
        </p>

        <div className="animate-rise-delay-3 mt-12 grid gap-5 md:grid-cols-2">
          <Link
            href="/patient"
            className="group rounded-[2rem] border border-border/80 bg-card/90 p-7 shadow-sm transition hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg"
          >
            <p className="text-sm font-medium text-cta">اپ مشتری</p>
            <h2 className="mt-3 text-2xl font-bold text-brand">مراجعه‌کننده</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              برنامه روزانه، پیشرفت، نوبت حضوری و مشاوره آنلاین.
            </p>
            <span className="mt-6 inline-flex text-sm font-semibold text-brand group-hover:underline">
              ورود به اپ مشتری
            </span>
          </Link>

          <Link
            href="/login?next=/clinic/reception"
            className="group rounded-[2rem] bg-brand p-7 text-primary-foreground shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <p className="text-sm font-medium text-white/75">اپ کلینیک</p>
            <h2 className="mt-3 text-2xl font-bold">منشی و مدیریت</h2>
            <p className="mt-3 text-sm leading-7 text-white/85">
              پذیرش، نوبت‌ها، مشاوره آنلاین، مالی و حسابداری شخصی.
            </p>
            <span className="mt-6 inline-flex text-sm font-semibold text-white group-hover:underline">
              ورود با نام کاربری
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

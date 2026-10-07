import Image from "next/image";
import Link from "next/link";
import { ClinicLogo } from "@/components/brand/clinic-logo";

const services = [
  {
    title: "رژیم شخصی‌سازی‌شده",
    text: "برنامه غذایی متناسب با هدف، سبک زندگی و اندازه‌های شما در یزد.",
  },
  {
    title: "نوبت حضوری",
    text: "مراجعه به کلینیک برای ویزیت، اندازه‌گیری و پیگیری مسیر کاهش وزن.",
  },
  {
    title: "مشاوره آنلاین",
    text: "ثبت سایزها از خانه، رزرو وقت تماس و دریافت راهنمایی تلفنی از تیم تندیس.",
  },
];

const steps = [
  { n: "۱", title: "درخواست بدهید", text: "نوبت حضوری یا مشاوره آنلاین را از سایت ثبت کنید." },
  { n: "۲", title: "هماهنگی کلینیک", text: "پذیرش وقت را تأیید می‌کند و در صورت نیاز پیامک می‌فرستد." },
  { n: "۳", title: "شروع مسیر", text: "با برنامه غذایی و پیگیری منظم به سمت هدفتان پیش بروید." },
];

export function ClinicLanding({
  phone,
  address,
  hours,
}: {
  phone: string;
  address: string;
  hours: string;
}) {
  return (
    <div className="min-h-screen bg-[#F3F6F3] text-foreground">
      {/* Hero — one composition: brand, headline, sentence, CTAs, full-bleed image */}
      <header className="relative min-h-[100svh] overflow-hidden">
        <Image
          src="/images/tandis-landing-hero.jpg"
          alt="فضای کلینیک لاغری تندیس"
          fill
          priority
          className="object-cover animate-ken"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#163528]/88 via-[#1a3d30]/55 to-[#F3F6F3]/35" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-[#163528]/35" />

        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-6xl flex-col px-5 pb-12 pt-6 sm:px-8 sm:pt-8">
          <nav className="animate-rise flex items-center justify-between gap-4">
            <div className="rounded-2xl bg-white/95 px-3 py-2 shadow-sm backdrop-blur-sm">
              <ClinicLogo compact />
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/patient/book"
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/10 sm:inline-flex"
              >
                نوبت حضوری
              </Link>
              <Link
                href="/patient/consult"
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-[#1a3d30] transition hover:bg-[#E8F2EA]"
              >
                مشاوره آنلاین
              </Link>
            </div>
          </nav>

          <div className="mt-auto max-w-2xl pb-4 pt-24 sm:pb-10 sm:pt-16">
            <p className="animate-rise text-sm font-semibold tracking-wide text-[#C8E6D0] sm:text-base">
              کلینیک لاغری تندیس یزد
            </p>
            <h1 className="animate-rise-delay-1 mt-3 text-4xl font-extrabold leading-[1.15] text-white sm:text-5xl md:text-6xl lg:text-7xl">
              تندیس
            </h1>
            <span className="animate-underline-draw mt-3 block h-1 w-24 origin-right rounded-full bg-[#7CB88A]" />
            <p className="animate-rise-delay-2 mt-6 max-w-lg text-base leading-8 text-white/88 sm:text-lg">
              مسیر کاهش وزن با رژیم علمی، پیگیری منظم و همراهی مشاور — حضوری در
              کلینیک یا آنلاین از خانه.
            </p>
            <div className="animate-rise-delay-3 mt-8 flex flex-wrap gap-3">
              <Link
                href="/patient/book"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#D86B5C] px-6 text-sm font-bold text-white transition hover:bg-[#c85a4c]"
              >
                رزرو نوبت حضوری
              </Link>
              <Link
                href="/patient/consult"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/35 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                درخواست مشاوره آنلاین
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Services — one job */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="text-sm font-semibold text-brand">خدمات تندیس</p>
        <h2 className="mt-2 max-w-xl text-3xl font-extrabold text-brand sm:text-4xl">
          هر قدم مسیر لاغری، یک همراهی مشخص
        </h2>
        <ul className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {services.map((item) => (
            <li key={item.title} className="border-t border-brand/15 pt-6">
              <h3 className="text-xl font-bold text-brand">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Visual band */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-0 md:grid-cols-2">
          <div className="relative min-h-[280px] md:min-h-[420px]">
            <Image
              src="/images/clinic-care.jpg"
              alt="مراقبت و پیگیری در کلینیک تندیس"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="bg-[#1a3d30] px-6 py-14 text-white sm:px-12 sm:py-20">
            <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
              پیگیری واقعی، نه فقط یک رژیم کاغذی
            </h2>
            <p className="mt-5 max-w-md text-sm leading-8 text-white/80 sm:text-base">
              وزن، سایز و هدف شما در هر مرحله ثبت می‌شود تا مشاور تندیس برنامه را
              دقیق‌تر تنظیم کند — چه در کلینیک باشید، چه از راه دور.
            </p>
            <Link
              href="/patient"
              className="mt-8 inline-flex text-sm font-bold text-[#C8E6D0] underline-offset-4 hover:underline"
            >
              ورود به اپ مشتری
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="text-sm font-semibold text-brand">مسیر شروع</p>
        <h2 className="mt-2 text-3xl font-extrabold text-brand sm:text-4xl">
          سه قدم تا اولین جلسه
        </h2>
        <ol className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <li key={step.n}>
              <span className="text-4xl font-extrabold text-[#7CB88A]">{step.n}</span>
              <h3 className="mt-3 text-lg font-bold text-brand">{step.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Online consult CTA band */}
      <section className="border-y border-brand/10 bg-[#E8F2EA]">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-20">
          <div className="max-w-xl">
            <h2 className="text-2xl font-extrabold text-brand sm:text-3xl">
              از خانه سایز بگیرید، آنلاین مشاوره شوید
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
              با راهنمای تصویری اندازه‌گیری، مشخصات را بفرستید تا وقت تماس برایتان
              رزرو شود.
            </p>
          </div>
          <Link
            href="/patient/consult"
            className="inline-flex h-12 shrink-0 items-center justify-center rounded-2xl bg-brand px-6 text-sm font-bold text-white transition hover:bg-brand/90"
          >
            شروع مشاوره آنلاین
          </Link>
        </div>
      </section>

      {/* Contact */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="text-sm font-semibold text-brand">ارتباط با کلینیک</p>
        <h2 className="mt-2 text-3xl font-extrabold text-brand sm:text-4xl">
          تندیس در یزد
        </h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold text-muted-foreground">آدرس</p>
            <p className="mt-2 text-sm leading-7 text-foreground">{address}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">تلفن</p>
            <a
              href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
              className="mt-2 inline-block text-sm font-bold text-brand dir-ltr"
              dir="ltr"
            >
              {phone}
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">ساعات کاری</p>
            <p className="mt-2 text-sm leading-7 text-foreground">{hours}</p>
          </div>
        </div>
        <div className="mt-12 flex flex-wrap gap-3">
          <Link
            href="/patient/book"
            className="inline-flex h-12 items-center rounded-2xl bg-[#D86B5C] px-6 text-sm font-bold text-white"
          >
            رزرو نوبت حضوری
          </Link>
          <a
            href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
            className="inline-flex h-12 items-center rounded-2xl border border-brand/20 bg-white px-6 text-sm font-bold text-brand"
          >
            تماس با کلینیک
          </a>
        </div>
      </section>

      <footer className="border-t border-brand/10 bg-[#1a3d30] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <div className="inline-block rounded-2xl bg-white px-3 py-2">
              <ClinicLogo compact />
            </div>
            <p className="mt-3 text-xs text-white/65">
              کلینیک لاغری و رژیم درمانی تندیس · یزد
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/patient" className="text-white/80 hover:text-white">
              اپ مشتری
            </Link>
            <Link href="/apps" className="text-white/80 hover:text-white">
              ورود کارکنان
            </Link>
            <Link href="/patient/consult" className="text-white/80 hover:text-white">
              مشاوره آنلاین
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

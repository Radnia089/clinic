import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BmiCalculator } from "@/components/bmi/bmi-calculator";
import { ChampionsSection } from "@/components/champions/champions-section";

const services = [
  {
    title: "رژیم شخصی",
    text: "برنامه غذایی دقیق بر اساس هدف، عادت‌ها و اندازه‌های شما.",
    image: "/images/landing-food-fresh.jpg",
    href: "/patient/book",
  },
  {
    title: "نوبت حضوری",
    text: "ویزیت در کلینیک یزد با اندازه‌گیری و تنظیم مسیر لاغری.",
    image: "/images/clinic-care.jpg",
    href: "/patient/book",
  },
  {
    title: "مشاوره آنلاین",
    text: "ثبت سایز از خانه، رزرو وقت تماس و راهنمایی تلفنی مشاور.",
    image: "/images/landing-consult-desk.jpg",
    href: "/patient/consult",
  },
];

const devices = [
  {
    name: "آر‌اف (RF)",
    full: "رادیوفرکوئنسی",
    image: "/images/device-rf.jpg",
    text: "امواج رادیویی گرمای کنترل‌شده به لایه‌های پوست و بافت زیرین می‌رسانند. این روش به سفت‌شدن پوست، تحریک کلاژن و کمک به فرم‌دهی موضعی کمک می‌کند — به‌ویژه وقتی با رژیم و پیگیری همراه باشد.",
  },
  {
    name: "کویتیشن",
    full: "اولتراسوند کاویتاسیون",
    image: "/images/device-cavitation.jpg",
    text: "امواج اولتراسوند حباب‌های میکروسکوپی در بافت چربی ایجاد می‌کنند و به شکستن سلول‌های چربی موضعی کمک می‌کنند. معمولاً برای نواحی مقاوم مثل شکم، پهلو و ران پیشنهاد می‌شود.",
  },
  {
    name: "ایندرمولوژی",
    full: "اندومولوژی / LPG",
    image: "/images/device-endermologie.jpg",
    text: "ماساژ مکانیکی با مکش و غلتک که گردش لنفاوی را بهتر می‌کند، ظاهر سلولیت را کاهش می‌دهد و پوست را نرم‌تر و یکدست‌تر نشان می‌دهد. مکمل خوبی برای مسیر لاغری و فرم‌دهی بدن است.",
  },
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
  const tel = phone.replace(/[^0-9+]/g, "");

  return (
    <div className="min-h-screen bg-[#F6F8F5] text-[#1A2E26]">
      {/* Top bar */}
      <div className="border-b border-[#1A2E26]/08 bg-[#14352A] text-[#E8F2EA]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2 text-xs sm:px-6">
          <p>کلینیک لاغری تندیس · یزد</p>
          <a href={`tel:${tel}`} className="font-semibold tracking-wide" dir="ltr">
            {phone}
          </a>
        </div>
      </div>

      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-[#1A2E26]/06 bg-[#F6F8F5]/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[4.5rem] sm:px-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/tandis-logo.png"
              alt="کلینیک تندیس"
              width={160}
              height={67}
              className="h-10 w-auto object-contain sm:h-12"
              priority
            />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-[#1A2E26]/75 md:flex">
            <a href="#services" className="hover:text-[#14352A]">
              خدمات
            </a>
            <a href="#devices" className="hover:text-[#14352A]">
              دستگاه‌ها
            </a>
            <a href="#bmi" className="hover:text-[#14352A]">
              محاسبه BMI
            </a>
            <a href="#champions" className="hover:text-[#14352A]">
              قهرمانان
            </a>
            <a href="#path" className="hover:text-[#14352A]">
              مسیر درمان
            </a>
            <a href="#portal" className="hover:text-[#14352A]">
              ورود
            </a>
            <a href="#contact" className="hover:text-[#14352A]">
              تماس
            </a>
          </nav>
          <a
            href="#portal"
            className="inline-flex h-10 items-center rounded-full bg-[#14352A] px-4 text-sm font-bold text-white transition hover:bg-[#1f4a3a] sm:px-5"
          >
            ورود به پنل‌ها
          </a>
        </div>
      </header>

      {/* Hero — brand first, full-bleed image */}
      <section className="relative isolate min-h-[88svh] overflow-hidden sm:min-h-[92svh]">
        <Image
          src="/images/landing-hero-oasis.jpg"
          alt="فضای کلینیک لاغری تندیس"
          fill
          priority
          className="object-cover animate-ken"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F241C]/90 via-[#14352A]/45 to-[#14352A]/20" />

        <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-6xl flex-col justify-end px-4 pb-14 pt-28 sm:min-h-[92svh] sm:px-6 sm:pb-20">
          <p className="animate-rise text-sm font-semibold tracking-wide text-[#F0B429] sm:text-base">
            کلینیک لاغری · رژیم درمانی · یزد
          </p>
          <h1 className="animate-rise-delay-1 mt-3 max-w-3xl text-5xl font-extrabold leading-[1.05] text-white sm:text-6xl md:text-7xl lg:text-8xl">
            تندیس
          </h1>
          <p className="animate-rise-delay-2 mt-5 max-w-xl text-base leading-8 text-white/90 sm:text-lg">
            لاغری پایدار با رژیم شخصی، دستگاه‌های کمک لاغری و همراهی مشاور —
            حضوری در کلینیک یا آنلاین از خانه.
          </p>
          <div className="animate-rise-delay-3 mt-8 flex flex-wrap gap-3">
            <Link
              href="/patient/book"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#F0B429] px-6 text-sm font-extrabold text-[#14352A] transition hover:bg-[#e0a61f]"
            >
              رزرو نوبت حضوری
              <ArrowLeft className="size-4" />
            </Link>
            <Link
              href="/patient/consult"
              className="inline-flex h-12 items-center rounded-full border border-white/40 bg-white/10 px-6 text-sm font-bold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              مشاوره آنلاین
            </Link>
          </div>
        </div>
      </section>

      {/* Services — image-forward strips, not heavy cards */}
      <section id="services" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="text-sm font-bold tracking-wide text-[#C48A12]">خدمات</p>
        <h2 className="mt-2 max-w-lg text-3xl font-extrabold text-[#14352A] sm:text-4xl">
          سه راه برای شروع مسیر لاغری
        </h2>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {services.map((item, index) => (
            <Link
              key={item.title}
              href={item.href}
              className="group relative block min-h-[360px] overflow-hidden rounded-[1.75rem]"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0F241C]/92 via-[#0F241C]/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <span className="text-xs font-bold text-[#F0B429]">
                  {new Intl.NumberFormat("fa-IR").format(index + 1)}
                </span>
                <h3 className="mt-2 text-2xl font-extrabold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-white/85">{item.text}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-[#F0B429]">
                  ادامه
                  <ArrowLeft className="size-4 transition group-hover:-translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <BmiCalculator variant="landing" />

      <ChampionsSection variant="landing" />

      {/* Devices — کمک لاغری */}
      <section id="devices" className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/clinic-care.jpg"
            alt=""
            fill
            className="object-cover opacity-[0.12]"
            sizes="100vw"
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#F6F8F5] via-[#F6F8F5]/92 to-[#E8F0EA]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm font-bold tracking-wide text-[#C48A12]">
            دستگاه‌های کمک لاغری
          </p>
          <h2 className="mt-2 max-w-2xl text-3xl font-extrabold text-[#14352A] sm:text-4xl">
            آر‌اف، کویتیشن و ایندرمولوژی در کنار رژیم
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-[#1A2E26]/70 sm:text-base">
            در کلینیک تندیس، علاوه بر رژیم شخصی، از دستگاه‌های کمک لاغری برای
            فرم‌دهی موضعی، سفتی پوست و کاهش ظاهر سلولیت استفاده می‌شود. انتخاب
            روش مناسب بعد از ویزیت و اندازه‌گیری انجام می‌گیرد.
          </p>

          <div className="mt-14 grid gap-8 md:grid-cols-3 md:gap-6">
            {devices.map((device, index) => (
              <article key={device.name} className="group">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem]">
                  <Image
                    src={device.image}
                    alt={device.name}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F241C]/35 to-transparent" />
                  <span className="absolute bottom-4 right-4 font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#F0B429]">
                    {new Intl.NumberFormat("fa-IR").format(index + 1)}
                  </span>
                </div>
                <h3 className="mt-5 text-2xl font-extrabold text-[#14352A]">
                  {device.name}
                </h3>
                <p className="mt-1 text-xs font-semibold tracking-wide text-[#C48A12]">
                  {device.full}
                </p>
                <p className="mt-3 text-sm leading-8 text-[#1A2E26]/70">
                  {device.text}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="/patient/book"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[#14352A] px-6 text-sm font-bold text-white transition hover:bg-[#1f4a3a]"
            >
              رزرو برای مشاوره دستگاه
              <ArrowLeft className="size-4" />
            </Link>
            <p className="text-sm text-[#1A2E26]/55">
              دستگاه‌ها جایگزین رژیم نیستند؛ مکمل مسیر لاغری‌اند.
            </p>
          </div>
        </div>
      </section>

      {/* Split story */}
      <section className="overflow-hidden bg-[#14352A] text-white">
        <div className="mx-auto grid max-w-6xl md:grid-cols-2">
          <div className="relative min-h-[320px] md:min-h-[480px]">
            <Image
              src="/images/landing-food-fresh.jpg"
              alt="غذای سالم برنامه رژیم"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-14 sm:px-12 sm:py-20">
            <p className="text-sm font-bold text-[#F0B429]">فلسفه تندیس</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
              رژیم کاغذی نیست؛ مسیر قابل اندازه‌گیری است
            </h2>
            <p className="mt-5 text-sm leading-8 text-white/80 sm:text-base">
              وزن، سایز و هدف شما ثبت می‌شود تا مشاور برنامه را مرحله‌به‌مرحله
              تنظیم کند — از رژیم تا جلسات دستگاه‌های کمک لاغری. همین دقت، تفاوت
              مسیر پایدار با رژیم‌های کوتاه‌مدت است.
            </p>
            <Link
              href="/patient"
              className="mt-8 inline-flex w-fit items-center gap-2 text-sm font-bold text-[#F0B429]"
            >
              مشاهده اپ مشتری
              <ArrowLeft className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Path */}
      <section id="path" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="text-sm font-bold tracking-wide text-[#C48A12]">مسیر درمان</p>
        <h2 className="mt-2 text-3xl font-extrabold text-[#14352A] sm:text-4xl">
          از اولین درخواست تا پیگیری
        </h2>
        <ol className="mt-12 grid gap-6 sm:grid-cols-3">
          {[
            {
              n: "۰۱",
              t: "درخواست",
              d: "نوبت حضوری یا مشاوره آنلاین را از سایت ثبت کنید.",
            },
            {
              n: "۰۲",
              t: "هماهنگی",
              d: "کلینیک وقت را تأیید می‌کند و در صورت نیاز پیامک می‌فرستد.",
            },
            {
              n: "۰۳",
              t: "شروع",
              d: "با برنامه غذایی و پیگیری منظم به سمت هدف حرکت کنید.",
            },
          ].map((step) => (
            <li
              key={step.n}
              className="rounded-[1.75rem] bg-white p-6 shadow-[0_12px_40px_rgba(20,53,42,0.06)]"
            >
              <span className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-[#F0B429]">
                {step.n}
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-[#14352A]">
                {step.t}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#1A2E26]/65">{step.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Online CTA with image */}
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="grid overflow-hidden rounded-[2rem] bg-[#E8F0EA] md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16">
            <h2 className="text-3xl font-extrabold text-[#14352A] sm:text-4xl">
              از خانه سایز بگیرید
            </h2>
            <p className="mt-4 max-w-md text-sm leading-8 text-[#1A2E26]/70">
              راهنمای تصویری اندازه‌گیری را ببینید، مشخصات را بفرستید و وقت تماس
              مشاوره آنلاین بگیرید.
            </p>
            <Link
              href="/patient/consult"
              className="mt-8 inline-flex h-12 w-fit items-center rounded-full bg-[#14352A] px-6 text-sm font-bold text-white"
            >
              شروع مشاوره آنلاین
            </Link>
          </div>
          <div className="relative min-h-[280px]">
            <Image
              src="/images/landing-consult-desk.jpg"
              alt="میز مشاوره رژیم"
              fill
              className="object-cover"
              sizes="40vw"
            />
          </div>
        </div>
      </section>

      {/* Portal — درگاه ورود همه پنل‌ها */}
      <section id="portal" className="bg-[#0F241C] text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm font-bold tracking-wide text-[#F0B429]">درگاه ورود</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-extrabold sm:text-4xl">
            ورود به همه پنل‌های تندیس از همین صفحه
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/70 sm:text-base">
            مشتری، پذیرش و مدیریت — هر نقش از اینجا وارد پنل خودش می‌شود.
          </p>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <Link
              href="/patient"
              className="group flex flex-col justify-between rounded-[1.75rem] bg-white/5 p-6 transition hover:bg-white/10 sm:p-7"
            >
              <div>
                <p className="text-xs font-bold tracking-wide text-[#F0B429]">
                  مراجعه‌کننده
                </p>
                <h3 className="mt-3 text-2xl font-extrabold">اپ مشتری</h3>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  برنامه غذایی، پیشرفت، نوبت حضوری و مشاوره آنلاین.
                </p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#F0B429]">
                ورود به اپ مشتری
                <ArrowLeft className="size-4 transition group-hover:-translate-x-1" />
              </span>
            </Link>

            <Link
              href="/login?next=/clinic/reception"
              className="group flex flex-col justify-between rounded-[1.75rem] bg-[#F0B429] p-6 text-[#14352A] transition hover:bg-[#e0a61f] sm:p-7"
            >
              <div>
                <p className="text-xs font-bold tracking-wide text-[#14352A]/70">
                  کارکنان
                </p>
                <h3 className="mt-3 text-2xl font-extrabold">پذیرش</h3>
                <p className="mt-3 text-sm leading-7 text-[#14352A]/75">
                  میز پذیرش، ثبت مراجعه، مشتریان، نوبت‌ها و مشاوره آنلاین.
                </p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold">
                ورود پذیرش
                <ArrowLeft className="size-4 transition group-hover:-translate-x-1" />
              </span>
            </Link>

            <Link
              href="/login?next=/clinic"
              className="group flex flex-col justify-between rounded-[1.75rem] border border-white/15 bg-[#14352A] p-6 transition hover:border-white/30 hover:bg-[#1a4033] sm:p-7"
            >
              <div>
                <p className="text-xs font-bold tracking-wide text-[#F0B429]">
                  مدیریت
                </p>
                <h3 className="mt-3 text-2xl font-extrabold">پنل مدیر</h3>
                <p className="mt-3 text-sm leading-7 text-white/70">
                  داشبورد، مالی کلینیک، پیامک و حسابداری شخصی.
                </p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#F0B429]">
                ورود مدیریت
                <ArrowLeft className="size-4 transition group-hover:-translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-10 md:grid-cols-[1fr_1.1fr] md:items-end">
          <div>
            <p className="text-sm font-bold tracking-wide text-[#C48A12]">تماس</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[#14352A] sm:text-4xl">
              تندیس در یزد
            </h2>
            <p className="mt-4 text-sm leading-8 text-[#1A2E26]/70">{address}</p>
            <a
              href={`tel:${tel}`}
              className="mt-3 inline-block text-2xl font-extrabold text-[#14352A]"
              dir="ltr"
            >
              {phone}
            </a>
            <p className="mt-2 text-sm text-[#1A2E26]/60">{hours}</p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              href="/patient/book"
              className="inline-flex h-12 items-center rounded-full bg-[#F0B429] px-6 text-sm font-extrabold text-[#14352A]"
            >
              رزرو نوبت حضوری
            </Link>
            <Link
              href="/patient/consult"
              className="inline-flex h-12 items-center rounded-full bg-[#14352A] px-6 text-sm font-bold text-white"
            >
              مشاوره آنلاین
            </Link>
            <a
              href="#portal"
              className="inline-flex h-12 items-center rounded-full border border-[#14352A]/15 bg-white px-6 text-sm font-bold text-[#14352A]"
            >
              ورود به پنل‌ها
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#1A2E26]/08 bg-[#0F241C] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white px-2.5 py-1.5">
              <Image
                src="/tandis-logo.png"
                alt="تندیس"
                width={120}
                height={50}
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-xs text-white/65">کلینیک لاغری تندیس یزد</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-white/75">
            <a href="#portal" className="hover:text-white">
              ورود به پنل‌ها
            </a>
            <a href="#bmi" className="hover:text-white">
              محاسبه BMI
            </a>
            <a href="#champions" className="hover:text-white">
              قهرمانان
            </a>
            <Link href="/patient" className="hover:text-white">
              اپ مشتری
            </Link>
            <Link href="/patient/consult" className="hover:text-white">
              مشاوره آنلاین
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

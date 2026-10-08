import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BmiCalculator } from "@/components/bmi/bmi-calculator";
import { ChampionsSection } from "@/components/champions/champions-section";
import { LandingLoginMenu } from "@/components/landing/landing-login-menu";
import { MagazineLandingSection } from "@/components/magazine/magazine-landing-section";
import { PromoBannerSlider } from "@/components/patient/promo-banner-slider";
import type { Champion, MagazineArticle, PromoBanner } from "@/lib/types";

const services = [
  {
    title: "رژیم شخصی",
    text: "برنامه غذایی دقیق بر اساس هدف و اندازه‌های شما.",
    href: "/patient/book",
  },
  {
    title: "نوبت حضوری",
    text: "ویزیت در کلینیک یزد با اندازه‌گیری و تنظیم مسیر.",
    href: "/patient/book",
  },
  {
    title: "مشاوره آنلاین",
    text: "ثبت سایز از خانه و رزرو وقت تماس با مشاور.",
    href: "/patient/consult",
  },
];

const devices = [
  {
    name: "آر‌اف (RF)",
    text: "سفتی پوست و فرم‌دهی موضعی با رادیوفرکوئنسی.",
    image: "/images/device-rf.jpg",
  },
  {
    name: "کویتیشن",
    text: "کمک به کاهش چربی موضعی در نواحی مقاوم.",
    image: "/images/device-cavitation.jpg",
  },
  {
    name: "ایندرمولوژی",
    text: "ماساژ مکانیکی برای گردش لنفاوی و پوست یکدست‌تر.",
    image: "/images/device-endermologie.jpg",
  },
];

export function ClinicLanding({
  phone,
  address,
  hours,
  champions = [],
  articles = [],
  promoBanners = [],
}: {
  phone: string;
  address: string;
  hours: string;
  champions?: Champion[];
  articles?: MagazineArticle[];
  promoBanners?: PromoBanner[];
}) {
  const tel = phone.replace(/[^0-9+]/g, "");

  return (
    <div className="min-h-screen bg-[#F7F8F6] text-[#1A2E26]">
      <header className="sticky top-0 z-40 border-b border-[#14352A]/08 bg-[#F7F8F6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="min-w-0">
            <Image
              src="/tandis-logo.png"
              alt="کلینیک تندیس"
              width={140}
              height={58}
              className="h-8 w-auto object-contain sm:h-9"
              priority
            />
            <p className="mt-0.5 text-[10px] font-medium text-[#14352A]/65 sm:text-[11px]">
              کلینیک تخصصی لاغری و رژیم درمانی · یزد
            </p>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="hidden items-center gap-4 text-sm text-[#14352A]/75 md:flex">
              <a href="#services" className="hover:text-[#14352A]">
                خدمات
              </a>
              <a href="#devices" className="hover:text-[#14352A]">
                دستگاه‌ها
              </a>
              <a href="#bmi" className="hover:text-[#14352A]">
                BMI
              </a>
              <a href="#contact" className="hover:text-[#14352A]">
                تماس
              </a>
            </nav>
            <LandingLoginMenu />
          </div>
        </div>
      </header>

      {/* Hero — simple */}
      <section className="border-b border-[#14352A]/06 bg-[#E8F2EA]">
        <div className="mx-auto grid max-w-5xl items-center gap-8 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2 md:gap-12">
          <div>
            <p className="text-sm font-bold text-[#14352A]">تندیس</p>
            <h1 className="mt-3 text-3xl font-extrabold leading-snug text-[#14352A] sm:text-4xl">
              مسیر لاغری با پیگیری منظم
            </h1>
            <p className="mt-4 max-w-md text-sm leading-8 text-[#1A2E26]/70">
              رژیم شخصی، دستگاه‌های کمک لاغری و مشاوره حضوری یا آنلاین در یزد.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/patient/book"
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#14352A] px-5 text-sm font-bold text-white hover:bg-[#1f4a3a]"
              >
                رزرو نوبت
                <ArrowLeft className="size-4" />
              </Link>
              <Link
                href="/patient/consult"
                className="inline-flex h-11 items-center rounded-xl border border-[#14352A]/20 bg-white px-5 text-sm font-bold text-[#14352A] hover:bg-[#F7F8F6]"
              >
                مشاوره آنلاین
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl md:aspect-[5/4]">
            <Image
              src="/images/clinic-care.jpg"
              alt="کلینیک تندیس"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 480px"
            />
          </div>
        </div>
      </section>

      {promoBanners.length > 0 ? (
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <PromoBannerSlider variant="landing" items={promoBanners} />
        </div>
      ) : null}

      {/* Services */}
      <section id="services" className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="text-2xl font-extrabold text-[#14352A]">خدمات</h2>
        <p className="mt-2 text-sm text-[#1A2E26]/65">
          هر طور راحت‌ترید شروع کنید.
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {services.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className="group block border-t border-[#14352A]/12 pt-4"
            >
              <h3 className="text-lg font-extrabold text-[#14352A] group-hover:text-[#1f4a3a]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#1A2E26]/65">
                {item.text}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#14352A]">
                ادامه
                <ArrowLeft className="size-3.5 transition group-hover:-translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <BmiCalculator variant="landing" />

      <ChampionsSection variant="landing" items={champions} />

      <MagazineLandingSection items={articles} />

      {/* Devices */}
      <section id="devices" className="border-y border-[#14352A]/06 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <h2 className="text-2xl font-extrabold text-[#14352A]">
            دستگاه‌های کمک لاغری
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-7 text-[#1A2E26]/65">
            آر‌اف، کویتیشن و ایندرمولوژی به‌عنوان مکمل رژیم — بعد از ویزیت انتخاب
            می‌شوند.
          </p>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {devices.map((device) => (
              <article key={device.name}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  <Image
                    src={device.image}
                    alt={device.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 30vw"
                  />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-[#14352A]">
                  {device.name}
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#1A2E26]/65">
                  {device.text}
                </p>
              </article>
            ))}
          </div>
          <Link
            href="/patient/book"
            className="mt-10 inline-flex h-11 items-center gap-2 rounded-xl bg-[#14352A] px-5 text-sm font-bold text-white"
          >
            رزرو مشاوره
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </section>

      {/* Path */}
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
        <h2 className="text-2xl font-extrabold text-[#14352A]">مسیر درمان</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            { n: "۱", t: "درخواست", d: "نوبت حضوری یا مشاوره آنلاین ثبت کنید." },
            { n: "۲", t: "هماهنگی", d: "کلینیک وقت را تأیید می‌کند." },
            { n: "۳", t: "شروع", d: "با برنامه و پیگیری به سمت هدف می‌روید." },
          ].map((step) => (
            <li key={step.n}>
              <span className="text-sm font-bold text-[#B8860B]">{step.n}</span>
              <h3 className="mt-1 text-lg font-extrabold text-[#14352A]">
                {step.t}
              </h3>
              <p className="mt-1 text-sm leading-7 text-[#1A2E26]/65">{step.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-[#E8F2EA]">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-14 sm:flex-row sm:items-end sm:justify-between sm:px-6 sm:py-16">
          <div>
            <h2 className="text-2xl font-extrabold text-[#14352A]">تماس</h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-[#1A2E26]/70">
              {address}
            </p>
            <a
              href={`tel:${tel}`}
              className="mt-3 inline-block text-xl font-extrabold text-[#14352A]"
              dir="ltr"
            >
              {phone}
            </a>
            <p className="mt-1 text-sm text-[#1A2E26]/55">{hours}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/patient/book"
              className="inline-flex h-11 items-center rounded-xl bg-[#F0B429] px-5 text-sm font-extrabold text-[#14352A]"
            >
              رزرو نوبت
            </Link>
            <Link
              href="/patient/consult"
              className="inline-flex h-11 items-center rounded-xl bg-[#14352A] px-5 text-sm font-bold text-white"
            >
              مشاوره آنلاین
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#14352A]/08 bg-[#F7F8F6]">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-[#1A2E26]/60 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>کلینیک لاغری تندیس یزد</p>
          <div className="flex flex-wrap gap-4">
            <LandingLoginMenu variant="footer" className="text-[#1A2E26]/60 hover:text-[#14352A]" />
            <Link href="/magazine" className="hover:text-[#14352A]">
              مجله
            </Link>
            <Link href="/patient" className="hover:text-[#14352A]">
              اپ مشتری
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

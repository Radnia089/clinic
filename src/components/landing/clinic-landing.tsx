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
    image: "/images/landing-food-fresh.jpg",
    href: "/patient/book",
  },
  {
    title: "نوبت حضوری",
    text: "ویزیت در کلینیک یزد با اندازه‌گیری و تنظیم مسیر.",
    image: "/images/clinic-care.jpg",
    href: "/patient/book",
  },
  {
    title: "مشاوره آنلاین",
    text: "ثبت سایز از خانه و رزرو وقت تماس با مشاور.",
    image: "/images/landing-consult-desk.jpg",
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
              کلینیک تخصصی لاغری و رژیم درمانی تندیس
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
              <a href="#android-app" className="hover:text-[#14352A]">
                دانلود اپ
              </a>
              <a href="#contact" className="hover:text-[#14352A]">
                تماس
              </a>
            </nav>
            <LandingLoginMenu />
          </div>
        </div>
      </header>

      <PromoBannerSlider variant="landing" items={promoBanners} />

      <section id="android-app" className="bg-[#14352A] text-white">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:grid-cols-[1.3fr_auto] sm:items-center sm:px-6 sm:py-14">
          <div>
            <p className="text-xs font-bold tracking-wide text-[#F0B429]">
              گوشی اندروید
            </p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
              نصب اپ مشتری
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-8 text-white/80">
              نسخه اندروید را دانلود کنید و روی گوشی نصب کنید. بعد از نصب، آیکون
              تندیس را باز کنید؛ دیگر لازم نیست از مرورگر وارد شوید.
            </p>
            <ol className="mt-5 space-y-2 text-sm leading-7 text-white/75">
              <li>۱. فایل را دانلود کنید.</li>
              <li>
                ۲. فایل را باز کنید. اگر گوشی اجازه خواست، نصب از این منبع را
                فعال کنید.
              </li>
              <li>۳. آیکون تندیس را باز کنید و با شماره موبایل وارد شوید.</li>
            </ol>
          </div>
          <a
            href="/downloads/tandis-patient.apk"
            download="tandis-patient.apk"
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#F0B429] px-6 text-sm font-extrabold text-[#14352A] shadow-sm"
          >
            دانلود نسخه اندروید
          </a>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-[#F0F4F1]">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold tracking-wide text-[#B8860B]">
                شروع مسیر
              </p>
              <h2 className="mt-1 text-2xl font-extrabold text-[#14352A] sm:text-3xl">
                خدمات
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-7 text-[#1A2E26]/60">
              هر طور راحت‌ترید شروع کنید.
            </p>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3 sm:gap-5">
            {services.map((item, index) => (
              <Link
                key={item.title}
                href={item.href}
                className="group relative block min-h-[280px] overflow-hidden rounded-2xl sm:min-h-[340px]"
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F241C]/92 via-[#0F241C]/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <span className="text-xs font-bold text-[#F0B429]">
                    {new Intl.NumberFormat("fa-IR").format(index + 1)}
                  </span>
                  <h3 className="mt-1.5 text-xl font-extrabold text-white sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-white/80">
                    {item.text}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#F0B429]">
                    ادامه
                    <ArrowLeft className="size-3.5 transition group-hover:-translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
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

      <footer id="contact" className="border-t border-[#14352A]/08 bg-[#0F241C] text-white">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-[1.2fr_auto] sm:items-start sm:px-6 sm:py-12">
          <div>
            <p className="text-sm font-extrabold text-[#F0B429]">تندیس</p>
            <p className="mt-2 text-sm leading-7 text-white/75">{address}</p>
            <a
              href={`tel:${tel}`}
              className="mt-3 inline-block text-lg font-extrabold text-white"
              dir="ltr"
            >
              {phone}
            </a>
            <p className="mt-1 text-sm text-white/55">{hours}</p>
          </div>
          <div className="flex flex-col gap-3 sm:items-end">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/patient/book"
                className="inline-flex h-10 items-center rounded-xl bg-[#F0B429] px-4 text-sm font-extrabold text-[#14352A]"
              >
                رزرو نوبت
              </Link>
              <Link
                href="/patient/consult"
                className="inline-flex h-10 items-center rounded-xl bg-white/10 px-4 text-sm font-bold text-white ring-1 ring-white/20"
              >
                مشاوره آنلاین
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-white/65">
              <LandingLoginMenu variant="footer" />
              <Link href="/magazine" className="hover:text-white">
                مجله
              </Link>
              <Link href="/patient" className="hover:text-white">
                اپ مشتری
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

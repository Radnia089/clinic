import Image from "next/image";
import Link from "next/link";
import {
  CalendarCheck2,
  Clock3,
  Headset,
  MapPin,
  Phone,
  Salad,
  UtensilsCrossed,
} from "lucide-react";
import { LandingPromoSlider } from "@/components/landing/landing-promo-slider";
import { SampleBmi } from "@/components/landing/sample-bmi";
import { LandingLoginMenu } from "@/components/landing/landing-login-menu";
import { lostKg, lostSizeCm } from "@/lib/champions";
import { TANDIS_INSTAGRAM_HANDLE, TANDIS_INSTAGRAM_URL } from "@/lib/social-links";
import type { Champion, ClinicProfile, PromoBanner } from "@/lib/types";

const navLinks = [
  { href: "#start", label: "خانه" },
  { href: "#bmi", label: "ماشین حساب" },
  { href: "#devices", label: "دستگاه‌ها" },
  { href: "#champions", label: "قهرمانان" },
  { href: "#visit", label: "نوبت" },
];

const features = [
  { icon: UtensilsCrossed, title: "رژیم غذایی اختصاصی", text: "بر اساس ویژگی‌ها و شرایط خاص شما" },
  { icon: Salad, title: "برنامه بر اساس سفره خانوار", text: "منطبق با ذائقه و عادت غذایی شما" },
  { icon: Headset, title: "پشتیبانی در طول رژیم", text: "تلفنی، تا وقتی به برنامه عادت کنید" },
  { icon: CalendarCheck2, title: "پیگیری تا نتیجه", text: "وزن و دورها ثبت می‌شود و مسیر گم نمی‌شود" },
];

const devices = [
  {
    name: "کویتیشن لیپولکس",
    text: "شکم و پهلویی که با رژیم تکان نمی‌خورد، جای لیپولکس است. بدون جراحی روی همان نقطه می‌نشیند تا سایز پایین بیاید. اگر از آن ناحیه خسته شده‌اید، همین هفته وقتش را بگیرید.",
    image: "/images/device-lipolex.jpg",
    contain: true,
  },
  {
    name: "آر‌اف رافوس",
    text: "پوست شل بعد از کم کردن وزن، یا چربی ضخیم شکم و پهلو، با رافوس جمع‌تر دیده می‌شود. گرما کنترل می‌شود و فقط همان ناحیه‌ای که خودتان نشان می‌دهید کار می‌شود.",
    image: "/images/device-rafos.jpg",
    contain: true,
  },
  {
    name: "ایندرمولوژی",
    text: "پوست پرتقالی و ناهمواری را همین‌طور رها نکنید. ایندرمولوژی ماساژی است که گردش را راه می‌اندازد و پوست را یکدست‌تر می‌کند. جلسه‌اش راحت است و کنار رژیم، نتیجه را خوش‌فرم‌تر نشان می‌دهد.",
    image: "/images/device-endermologie.jpg",
    contain: false,
  },
];

function InstagramMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function faNum(value: number) {
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(value);
}

export function NutrishaLanding({
  clinic,
  champions,
  banners,
}: {
  clinic: ClinicProfile;
  champions: Champion[];
  banners: PromoBanner[];
}) {
  const tel = clinic.phone.replace(/[^0-9+]/g, "");
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      <header className="sticky top-0 z-40 border-b border-[#E5F0E6] bg-white/92 shadow-[0_8px_24px_rgba(20,53,42,0.04)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image
              src="/tandis-logo.png"
              alt="تندیس"
              width={132}
              height={52}
              className="h-11 w-auto"
              priority
            />
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-sm font-extrabold text-[#14352A]">کلینیک تندیس</span>
              <span className="block text-[11px] text-[#66756c]">رژیم درمانی · یزد</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-bold text-[#3d4f45] transition hover:bg-[#F3FAF3] hover:text-[#2E9B32]"
              >
                {item.label}
              </a>
            ))}
            <a
              href={`tel:${tel}`}
              className="rounded-full px-3 py-2 text-sm font-bold text-[#3d4f45] transition hover:bg-[#F3FAF3] hover:text-[#2E9B32]"
            >
              تماس
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <a
              href="/api/app-download"
              className="hidden h-10 items-center rounded-full border border-[#3caf2d]/35 px-4 text-sm font-extrabold text-[#2E9B32] transition hover:bg-[#F3FAF3] sm:inline-flex"
            >
              دانلود اپ
            </a>
            <LandingLoginMenu variant="fresh" />
          </div>
        </div>
        <nav className="flex flex-wrap gap-2 px-4 pb-3 lg:hidden">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full bg-[#F4F8F4] px-3.5 py-1.5 text-xs font-bold text-[#244033]"
            >
              {item.label}
            </a>
          ))}
          <a href={`tel:${tel}`} className="shrink-0 rounded-full bg-[#F4F8F4] px-3.5 py-1.5 text-xs font-bold text-[#244033]">
            تماس
          </a>
          <a href="/api/app-download" className="shrink-0 rounded-full bg-[#E8F6E8] px-3.5 py-1.5 text-xs font-extrabold text-[#2E9B32]">
            دانلود اپ
          </a>
        </nav>
      </header>

      <section id="start" className="mx-auto max-w-5xl px-5 pb-6 pt-8 text-center sm:px-8">
        <LandingPromoSlider items={banners} />
        <h1 className="mt-8 text-3xl font-extrabold text-[#2E9B32] sm:text-5xl">کلینیک تخصصی تغذیه تندیس</h1>
        <p className="mt-3 text-xl font-bold text-[#3caf2d] sm:text-3xl">تندیس، دوست سلامتی تو</p>
        <Link
          href="/patient/book"
          className="mt-7 inline-flex h-14 items-center rounded-full bg-[#3caf2d] px-10 text-base font-extrabold text-white shadow-[0_12px_28px_rgba(60,175,45,0.35)]"
        >
          دریافت رژیم غذایی
        </Link>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {features.map((item) => (
          <article key={item.title} className="text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl text-[#3caf2d]">
              <item.icon className="size-8" strokeWidth={1.6} />
            </span>
            <h2 className="mt-3 text-base font-extrabold">{item.title}</h2>
            <p className="mt-1 text-sm leading-7 text-[#2E9B32]">{item.text}</p>
          </article>
        ))}
      </section>

      <section id="bmi" className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <SampleBmi />
      </section>

      <section id="devices" className="bg-[#F7FBF7]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <h2 className="border-r-4 border-[#3caf2d] pr-3 text-sm font-extrabold text-[#2E9B32]">دستگاه‌های کمک لاغری</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#555]">
            جایی که رژیم دیرتر جواب می‌دهد، دستگاه وارد می‌شود. شکم، پهلو، ران یا پوستی که شل شده؛ یک وقت بگیرید تا همان ناحیه را شروع کنیم.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {devices.map((device) => (
              <article key={device.name} className="overflow-hidden rounded-[1.6rem] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.05)] ring-1 ring-black/5">
                <div className={`relative aspect-[4/3] ${device.contain ? "bg-[#F3F3F3]" : ""}`}>
                  <div className={device.contain ? "absolute inset-3" : "absolute inset-0"}>
                    <Image
                      src={device.image}
                      alt={device.name}
                      fill
                      className={device.contain ? "object-contain" : "object-cover"}
                      sizes="(max-width: 640px) 100vw, 360px"
                    />
                  </div>
                </div>
                <div className="space-y-2 p-4 text-right">
                  <h3 className="text-base font-extrabold">{device.name}</h3>
                  <p className="text-sm leading-7 text-[#555]">{device.text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-6 text-center sm:text-right">
            <Link href="/patient/book" className="inline-flex h-11 items-center rounded-full bg-[#3caf2d] px-6 text-sm font-extrabold text-white">
              وقت دستگاه را بگیر
            </Link>
          </div>
        </div>
      </section>

      <section id="champions" className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <h2 className="border-r-4 border-[#3caf2d] pr-3 text-sm font-extrabold text-[#2E9B32]">قهرمانان تندیس</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[#555]">
          کسانی که به مجموعه آمدند و از رژیم غذایی و دستگاه‌ها استفاده کردند. عکس قبل و بعدشان اینجاست و بعضی از آن‌ها وزن کم کرده‌اند.
        </p>
        {champions.length === 0 ? (
          <p className="mt-6 rounded-[1.4rem] bg-[#F7FBF7] px-4 py-6 text-sm text-[#666]">
            نتیجه‌های قبل و بعد به‌زودی اینجا قرار می‌گیرد.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {champions.map((champion) => {
              const lost = lostKg(champion);
              const sizeLost = lostSizeCm(champion);
              return (
                <article key={champion.id} className="overflow-hidden rounded-[1.6rem] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.05)] ring-1 ring-black/5">
                  <div className="grid grid-cols-2">
                    <div className="relative aspect-[3/4]">
                      <Image src={champion.beforeImage} alt={`${champion.name} قبل`} fill className="object-cover object-top" sizes="(max-width: 640px) 50vw, 240px" />
                      <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-bold text-white">قبل</span>
                    </div>
                    <div className="relative aspect-[3/4] border-r border-white">
                      <Image src={champion.afterImage} alt={`${champion.name} بعد`} fill className="object-cover object-top" sizes="(max-width: 640px) 50vw, 240px" />
                      <span className="absolute bottom-2 left-2 rounded-full bg-[#3caf2d] px-2.5 py-1 text-[11px] font-bold text-white">بعد</span>
                    </div>
                  </div>
                  <div className="space-y-2 p-4 text-right">
                    <h3 className="text-base font-extrabold">{champion.name}</h3>
                    {lost > 0 ? (
                      <p className="text-sm font-extrabold text-[#2E9B32]">{faNum(lost)} کیلوگرم کمتر</p>
                    ) : null}
                    <p className="text-xs leading-6 text-[#666]">
                      وزن{" "}
                      <span dir="ltr" className="inline-block tabular-nums">
                        {faNum(champion.startKg)} → {faNum(champion.endKg)}
                      </span>
                      {sizeLost !== undefined && sizeLost > 0 ? (
                        <>
                          {" · "}دور کمر {faNum(sizeLost)} سانتی‌متر کمتر
                        </>
                      ) : null}
                    </p>
                    {champion.quote ? <p className="text-sm leading-7 text-[#444]">{champion.quote}</p> : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section id="visit" className="bg-[#F7FBF7]">
        <div className="mx-auto grid max-w-5xl items-center gap-6 px-5 py-12 sm:px-8 md:grid-cols-[160px_1fr]">
          <div className="relative mx-auto size-36 overflow-hidden rounded-full">
            <Image src="/images/about/doctor-pourhosseini.jpg" alt={clinic.about.doctorName} fill className="object-cover object-[center_20%]" sizes="144px" />
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-[#2E9B32]">مسئول علمی</p>
            <h2 className="mt-1 text-2xl font-extrabold">{clinic.about.doctorName}</h2>
            <p className="mt-1 text-sm text-[#666]">{clinic.about.doctorTitle}</p>
            <p className="mt-3 text-sm leading-7 text-[#444]">{clinic.hours}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
              <a href={`tel:${tel}`} className="inline-flex h-11 items-center rounded-full bg-[#3caf2d] px-5 text-sm font-extrabold text-white" dir="ltr">
                {clinic.phone}
              </a>
              <Link href="/patient/consult" className="inline-flex h-11 items-center rounded-full border border-[#3caf2d] px-5 text-sm font-extrabold text-[#2E9B32]">
                مشاوره آنلاین
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#0E241C] text-white">
        <div className="h-1 bg-gradient-to-l from-[#F0B429] via-[#3caf2d] to-[#0E241C]" />
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.3fr_0.8fr_1.15fr]">
          <div>
            <div className="inline-flex rounded-2xl bg-white px-3 py-2 shadow-sm">
              <Image src="/tandis-logo.png" alt="تندیس" width={120} height={48} className="h-10 w-auto" />
            </div>
            <p className="mt-4 text-lg font-extrabold">تندیس، دوست سلامتی تو</p>
            <p className="mt-2 max-w-sm text-sm leading-7 text-white/70">{clinic.tagline}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-[#F0B429]">دسترسی</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {navLinks.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-white/75 transition hover:text-white">
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/magazine" className="text-white/75 transition hover:text-white">
                  مجله
                </Link>
              </li>
              <li>
                <Link href="/patient/book" className="text-white/75 transition hover:text-white">
                  دریافت رژیم
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold text-[#F0B429]">ارتباط</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-white/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-1 size-4 shrink-0 text-[#F0B429]" />
                <span>{clinic.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-[#F0B429]" />
                <a href={`tel:${tel}`} className="font-bold text-white" dir="ltr">
                  {clinic.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock3 className="mt-1 size-4 shrink-0 text-[#F0B429]" />
                <span>{clinic.hours}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <InstagramMark className="size-4 shrink-0 text-[#F0B429]" />
                <a href={TANDIS_INSTAGRAM_URL} className="hover:text-white" dir="ltr">
                  @{TANDIS_INSTAGRAM_HANDLE}
                </a>
              </li>
            </ul>
            {clinic.about.mapUrl ? (
              <a
                href={clinic.about.mapUrl}
                className="mt-4 inline-flex text-sm font-bold text-[#F0B429] hover:text-[#ffd36a]"
              >
                مسیر روی نقشه
              </a>
            ) : null}
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 text-xs text-white/55 sm:px-8">
            <p>کلینیک تخصصی تغذیه تندیس · یزد</p>
            <div className="flex items-center gap-4">
              <LandingLoginMenu variant="footer" />
              <Link href="/patient/consult" className="hover:text-white">
                مشاوره آنلاین
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

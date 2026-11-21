import Image from "next/image";
import Link from "next/link";
import { CalendarCheck2, Headset, Salad, UtensilsCrossed } from "lucide-react";
import { LandingPromoSlider } from "@/components/landing/landing-promo-slider";
import { SampleBmi } from "@/components/landing/sample-bmi";
import { SampleLogo } from "@/components/landing/sample-frame";
import { LandingLoginMenu } from "@/components/landing/landing-login-menu";
import { lostKg, lostSizeCm } from "@/lib/champions";
import type { Champion, ClinicProfile, PromoBanner } from "@/lib/types";

const features = [
  { icon: UtensilsCrossed, title: "رژیم غذایی اختصاصی", text: "بر اساس ویژگی‌ها و شرایط خاص شما" },
  { icon: Salad, title: "برنامه بر اساس سفره خانوار", text: "منطبق با ذائقه و عادت غذایی شما" },
  { icon: Headset, title: "پشتیبانی در طول رژیم", text: "تلفنی، تا وقتی به برنامه عادت کنید" },
  { icon: CalendarCheck2, title: "پیگیری تا نتیجه", text: "وزن و دورها ثبت می‌شود و مسیر گم نمی‌شود" },
];

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
      <header className="px-5 pt-6 text-center sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <LandingLoginMenu variant="fresh" />
          <a href="/downloads/tandis-patient.apk" download="tandis-patient.apk" className="text-sm font-extrabold text-[#2E9B32]">
            دانلود اپ
          </a>
        </div>
        <div className="mt-4 flex justify-center">
          <SampleLogo />
        </div>
        <p className="mt-2 text-sm text-[#666]">کلینیک رژیم درمانی تندیس · یزد</p>
        <nav className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-full bg-[#F8D9D6] px-4 py-3 text-sm font-bold text-[#555]">
          <a href="#start" className="text-[#2E9B32]">خانه</a>
          <a href="#champions">قهرمانان</a>
          <a href="#bmi">ماشین حساب</a>
          <a href="#visit">نوبت</a>
          <a href={`tel:${tel}`}>تماس</a>
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

      <section id="bmi" className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
        <SampleBmi />
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

      <footer className="px-5 py-8 text-center text-sm leading-7 text-[#666] sm:px-8">
        <p>{clinic.address}</p>
      </footer>
    </div>
  );
}

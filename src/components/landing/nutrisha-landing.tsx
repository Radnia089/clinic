import Image from "next/image";
import Link from "next/link";
import { CalendarCheck2, ChevronDown, Headset, Salad, UtensilsCrossed } from "lucide-react";
import { LandingFrame } from "@/components/landing/landing-frame";
import { LandingMagazineRow } from "@/components/landing/landing-magazine-row";
import { LandingPromoSlider } from "@/components/landing/landing-promo-slider";
import { SampleBmi } from "@/components/landing/sample-bmi";
import { lostKg, lostSizeCm } from "@/lib/champions";
import { clinicFaqs } from "@/lib/site-seo";
import type { Champion, ClinicProfile, MagazineArticle, PromoBanner } from "@/lib/types";

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

function faNum(value: number) {
  return new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(value);
}

export function NutrishaLanding({
  clinic,
  champions,
  banners,
  articles = [],
}: {
  clinic: ClinicProfile;
  champions: Champion[];
  banners: PromoBanner[];
  articles?: Pick<MagazineArticle, "slug" | "title" | "excerpt" | "category" | "coverImage">[];
}) {
  return (
    <LandingFrame clinic={clinic}>
      <section id="start" className="mx-auto max-w-5xl px-5 pb-6 pt-8 text-center sm:px-8">
        <LandingPromoSlider items={banners} />
        <h1 className="mt-8 text-3xl font-extrabold text-[#2E9B32] sm:text-5xl">کلینیک لاغری و رژیم درمانی در یزد</h1>
        <p className="mt-3 text-xl font-bold text-[#3caf2d] sm:text-3xl">تندیس، دوست سلامتی تو</p>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-8 text-[#444]">
          کلینیک لاغری تندیس در یزد رژیم غذایی شخصی می‌نویسد و با دستگاه‌های لاغری، کاهش وزن را جلو می‌برد.
        </p>
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
          <h2 className="border-r-4 border-[#3caf2d] pr-3 text-sm font-extrabold text-[#2E9B32]">دستگاه‌های لاغری در یزد</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#555]">
            جایی که رژیم دیرتر جواب می‌دهد، دستگاه‌های لاغری وارد می‌شوند. شکم، پهلو، ران یا پوستی که شل شده؛ یک وقت بگیرید تا همان ناحیه را شروع کنیم.
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

      {articles.length > 0 ? (
        <section id="magazine" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-12 sm:px-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="border-r-4 border-[#3caf2d] pr-3 text-sm font-extrabold text-[#2E9B32]">
              مجله لاغری و رژیم
            </h2>
            <Link href="/magazine" className="text-sm font-extrabold text-[#2E9B32]">
              همهٔ مقاله‌ها
            </Link>
          </div>
          <LandingMagazineRow articles={articles} />
        </section>
      ) : null}

      <section id="topics" className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <h2 className="border-r-4 border-[#3caf2d] pr-3 text-sm font-extrabold text-[#2E9B32]">
          سؤال‌های رژیم و لاغری
        </h2>
        <div className="mt-6 space-y-3">
          {clinicFaqs(clinic).map((item) => (
            <details key={item.question} className="group rounded-2xl bg-[#F7FBF7] px-5 text-right">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 font-extrabold text-[#14352A] [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <ChevronDown className="size-4 shrink-0 text-[#2E9B32] transition-transform group-open:rotate-180" />
              </summary>
              <p className="pb-4 text-sm leading-7 text-[#444]">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

    </LandingFrame>
  );
}

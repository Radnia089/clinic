import Image from "next/image";
import Link from "next/link";
import { SampleFrame, SampleLogo } from "@/components/landing/sample-frame";
import type { ClinicProfile } from "@/lib/types";

const steps = [
  { n: "۰۱", title: "ویزیت", text: "اندازه، عادت غذا و هدف را با هم می‌بینیم." },
  { n: "۰۲", title: "برنامه", text: "غذایی که بشود ادامه داد، نه یک فهرست سخت." },
  { n: "۰۳", title: "پیگیری", text: "وزن و دورها ثبت می‌شود تا مسیر گم نشود." },
];

const services = [
  { title: "رژیم شخصی", text: "برای کاهش وزن، تثبیت، یا بیماری‌هایی مثل دیابت و کبد چرب.", href: "/patient/book" },
  { title: "نوبت در یزد", text: "صفائیه، مجتمع خورشید. اندازه‌گیری همان روز انجام می‌شود.", href: "/patient/book" },
  { title: "مشاوره آنلاین", text: "اگر یزد نیستید، سایز را از خانه می‌فرستید و تماس می‌گیریم.", href: "/patient/consult" },
];

const devices = [
  { name: "آر‌اف", text: "سفتی پوست، بعد از اینکه رژیم شروع شده باشد.", image: "/images/device-rf.jpg" },
  { name: "کویتیشن", text: "برای چربی موضعی که با غذا تنها عقب نمی‌رود.", image: "/images/device-cavitation.jpg" },
  { name: "ایندرمولوژی", text: "گردش بهتر و پوست یکدست‌تر، کنار برنامه غذایی.", image: "/images/device-endermologie.jpg" },
];

export function SampleCalm({ clinic }: { clinic: ClinicProfile }) {
  const tel = clinic.phone.replace(/[^0-9+]/g, "");
  return (
    <SampleFrame active="calm">
      <div className="min-h-screen bg-[#F4EFE6] text-[#241C16]">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <SampleLogo />
          <nav className="hidden items-center gap-6 text-sm text-[#241C16]/70 md:flex">
            <a href="#path">مسیر</a>
            <a href="#services">خدمات</a>
            <a href="#visit">ویزیت</a>
          </nav>
          <Link href="/patient/book" className="inline-flex h-11 items-center rounded-full bg-[#234237] px-5 text-sm font-bold text-[#F4EFE6]">
            رزرو ویزیت
          </Link>
        </header>

        <section className="mx-auto grid max-w-6xl items-end gap-8 px-5 pb-24 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-24">
          <div className="contents lg:block">
            <div className="order-1">
              <p className="text-sm text-[#241C16]/60">کلینیک رژیم درمانی تندیس · یزد</p>
              <h1 className="mt-4 max-w-xl text-4xl font-extrabold leading-[1.25] sm:text-6xl sm:leading-[1.15]">
                وزن را با عجله کم نمی‌کنیم.
              </h1>
            </div>
            <div className="order-3">
              <p className="mt-6 max-w-md text-lg leading-9 text-[#241C16]/75 lg:mt-6">
                برنامه غذایی برای بدن، کار و سفره خودتان نوشته می‌شود. دستگاه کمک لاغری فقط وقتی به رژیم اضافه می‌شود که لازم باشد.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/patient/book" className="inline-flex h-12 items-center rounded-full bg-[#234237] px-6 text-sm font-bold text-[#F4EFE6]">
                  نوبت حضوری
                </Link>
                <Link href="/patient/consult" className="inline-flex h-12 items-center rounded-full border border-[#234237]/20 px-6 text-sm font-bold text-[#234237]">
                  مشاوره آنلاین
                </Link>
              </div>
              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-[#241C16]/10 pt-6 text-sm">
                <div>
                  <dt className="text-[#241C16]/50">ساعت کار</dt>
                  <dd className="mt-1 font-bold leading-6">
                    {clinic.hours.split("·").map((part) => (
                      <span key={part} className="block">{part.trim()}</span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-[#241C16]/50">تماس</dt>
                  <dd className="mt-1 font-bold" dir="ltr">{clinic.phone}</dd>
                </div>
                <div>
                  <dt className="text-[#241C16]/50">مسئول علمی</dt>
                  <dd className="mt-1 font-bold leading-6">{clinic.about.doctorTitle.split("·")[0]}</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="relative order-2">
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] bg-[#E7DDD0] sm:aspect-[4/5]">
              <Image
                src="/images/about/doctor-pourhosseini.jpg"
                alt={clinic.about.doctorName}
                fill
                priority
                className="object-cover object-[center_20%]"
                sizes="(max-width: 1024px) 100vw, 46vw"
              />
            </div>
            <p className="absolute -bottom-4 right-6 max-w-[16rem] rounded-2xl bg-white px-4 py-3 text-sm leading-7 shadow-[0_10px_30px_rgba(36,28,22,0.08)]">
              {clinic.about.doctorName}
              <span className="mt-1 block text-xs text-[#241C16]/55">{clinic.about.doctorTitle}</span>
            </p>
          </div>
        </section>

        <section className="bg-[#234237] text-[#F4EFE6]">
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <h2 className="text-3xl font-extrabold leading-snug">رژیم سخت نیست. دقیق است.</h2>
              <p className="mt-4 text-sm leading-8 text-[#F4EFE6]/75">
                غذای معمولی خانه، با اندازه درست. نه حذف یک گروه غذایی، نه وعده‌ای که فقط چند روز دوام بیاورد.
              </p>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-[1.6rem]">
              <Image src="/images/landing-food-fresh.jpg" alt="یک وعده غذایی متعادل" fill className="object-cover" sizes="60vw" />
            </div>
          </div>
        </section>

        <section id="path" className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <h2 className="text-sm text-[#241C16]/50">از اولین مراجعه تا ماه بعد</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <li key={step.n} className="border-t border-[#241C16]/15 pt-5">
                <p className="text-3xl font-extrabold text-[#A68456]">{step.n}</p>
                <h3 className="mt-3 text-2xl font-extrabold">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#241C16]/70">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="services" className="mx-auto max-w-6xl px-5 pb-8 sm:px-8">
          {services.map((item) => (
            <Link key={item.title} href={item.href} className="group flex items-end justify-between gap-6 border-t border-[#241C16]/12 py-7">
              <div>
                <h3 className="text-2xl font-extrabold sm:text-3xl">{item.title}</h3>
                <p className="mt-2 max-w-xl text-sm leading-7 text-[#241C16]/65">{item.text}</p>
              </div>
              <span className="shrink-0 text-sm font-bold text-[#234237] group-hover:underline">شروع</span>
            </Link>
          ))}
        </section>

        <section id="visit" className="mx-auto grid max-w-6xl gap-6 px-5 py-16 sm:px-8 lg:grid-cols-3">
          {devices.map((device) => (
            <article key={device.name}>
              <div className="relative aspect-[5/4] overflow-hidden rounded-[1.4rem]">
                <Image src={device.image} alt={device.name} fill className="object-cover" sizes="33vw" />
              </div>
              <h3 className="mt-4 text-xl font-extrabold">{device.name}</h3>
              <p className="mt-2 text-sm leading-7 text-[#241C16]/65">{device.text}</p>
            </article>
          ))}
        </section>

        <footer className="border-t border-[#241C16]/10">
          <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-5 py-10 sm:px-8">
            <div>
              <p className="text-sm text-[#241C16]/50">مراجعه</p>
              <p className="mt-2 max-w-md text-lg font-bold leading-8">{clinic.address}</p>
              <a href={`tel:${tel}`} className="mt-2 inline-block text-2xl font-extrabold" dir="ltr">{clinic.phone}</a>
            </div>
            <Link href="/patient/book" className="inline-flex h-12 items-center rounded-full bg-[#234237] px-6 text-sm font-bold text-[#F4EFE6]">
              وقت ویزیت را بگیرم
            </Link>
          </div>
        </footer>
      </div>
    </SampleFrame>
  );
}

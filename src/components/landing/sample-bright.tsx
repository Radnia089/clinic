import Image from "next/image";
import Link from "next/link";
import { Apple, Headset, HeartPulse, UserRound } from "lucide-react";
import { SampleFrame, SampleLogo } from "@/components/landing/sample-frame";
import type { ClinicProfile } from "@/lib/types";

const reasons = [
  { icon: Headset, title: "پیگیری واقعی", text: "بعد از ویزیت رها نمی‌شوید. وزن و دورها دوباره دیده می‌شود." },
  { icon: UserRound, title: "برنامه مخصوص شما", text: "نه یک فهرست آماده. غذا روی کار، سفره و بیماری شما تنظیم می‌شود." },
  { icon: HeartPulse, title: "همراه بیماری", text: "دیابت، فشار خون، کبد چرب و بارداری مسیر جدا دارند." },
  { icon: Apple, title: "غذای ایرانی", text: "وعده‌ای که بشود پخت و ادامه داد، نه یک چالش چندروزه." },
];

const steps = [
  { n: "۱", title: "وضعیت‌تان را بگویید", text: "قد، وزن، هدف و اینکه حضوری می‌آیید یا آنلاین." },
  { n: "۲", title: "برنامه نوشته می‌شود", text: "بعد از اندازه‌گیری، غذا روی زندگی واقعی‌تان تنظیم می‌شود." },
  { n: "۳", title: "تا نتیجه همراهید", text: "مراجعه بعدی برای دیدن مسیر است، نه فقط یک برگه رژیم." },
];

export function SampleBright({ clinic }: { clinic: ClinicProfile }) {
  const tel = clinic.phone.replace(/[^0-9+]/g, "");
  return (
    <SampleFrame active="bright">
      <div className="min-h-screen bg-white text-[#161616]">
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <SampleLogo />
          <div className="flex items-center gap-3">
            <a href={`tel:${tel}`} className="hidden text-sm font-bold text-[#14956C] sm:inline" dir="ltr">
              {clinic.phone}
            </a>
            <Link href="/patient/book" className="inline-flex h-11 items-center rounded-2xl bg-[#14956C] px-4 text-sm font-extrabold text-white">
              نوبت بگیر
            </Link>
          </div>
        </header>

        <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-8 pt-4 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="inline-flex rounded-full bg-[#E7F8F2] px-3 py-1 text-xs font-bold text-[#14956C]">
              متخصص تغذیه اختصاصی · یزد
            </p>
            <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.45] sm:text-5xl">
              رژیم لاغری با
              <span className="mt-2 block w-fit rounded-xl bg-[#CFF6EA] px-3 sm:mx-2 sm:mt-0 sm:inline-block">برنامه غذایی شخصی</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-8 text-[#555] sm:text-base">
              قد، وزن، عادت غذا و هدفتان را می‌گویید. در تندیس برنامه روی سفره خودتان نوشته می‌شود و تا مراجعه بعد همراهتان می‌مانیم.
            </p>
            <div className="mt-6 rounded-[1.6rem] bg-[#F4FBF8] p-4">
              <p className="text-sm font-bold">از کجا شروع کنیم؟</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link href="/patient/book" className="rounded-2xl bg-white px-3 py-4 text-center shadow-sm ring-1 ring-[#14956C]/15">
                  <span className="block text-sm font-extrabold text-[#14956C]">حضوری</span>
                  <span className="mt-1 block text-xs text-[#666]">کلینیک یزد</span>
                </Link>
                <Link href="/patient/consult" className="rounded-2xl bg-white px-3 py-4 text-center shadow-sm ring-1 ring-black/5">
                  <span className="block text-sm font-extrabold">آنلاین</span>
                  <span className="mt-1 block text-xs text-[#666]">از خانه</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-md">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-[#F3F7F5]">
              <Image
                src="/images/about/doctor-pourhosseini.jpg"
                alt={clinic.about.doctorName}
                fill
                priority
                className="object-cover object-[center_18%]"
                sizes="(max-width: 1024px) 100vw, 420px"
              />
            </div>
            <p className="absolute right-3 top-6 max-w-[11rem] rounded-2xl bg-white px-3 py-2 text-xs leading-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              <span className="font-extrabold">رژیم سالم</span>
              <span className="mt-0.5 block text-[#777]">غذای ایرانی، نه گرسنگی</span>
            </p>
            <p className="absolute bottom-16 left-3 rounded-2xl bg-white px-3 py-2 text-xs font-extrabold shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              {clinic.hours.includes("·") ? `عصرها، ${clinic.hours.split("·")[1].trim()}` : clinic.hours}
            </p>
            <p className="absolute bottom-4 right-4 rounded-2xl bg-[#14956C] px-3 py-2 text-xs font-extrabold text-white shadow-lg">
              اندازه‌گیری همان روز
            </p>
          </div>
        </section>

        <section className="bg-[#F3FAF7]">
          <ul className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-3 text-xs font-bold text-[#3D4A45] sm:text-sm">
            <li>برنامه روی سفره ایرانی</li>
            <li>پیگیری بعد از ویزیت</li>
            <li>نوبت حضوری در یزد</li>
            <li>مشاوره آنلاین</li>
          </ul>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
          <h2 className="text-3xl font-extrabold">یک متخصص، کنار پرونده شما</h2>
          <p className="mt-3 max-w-xl text-sm leading-8 text-[#555]">
            {clinic.about.doctorName}، {clinic.about.doctorTitle}. برنامه را می‌نویسد و در مراجعه بعد خودش مسیر را می‌بیند.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((item) => (
              <article key={item.title} className="rounded-[1.5rem] border border-[#EEF2F0] p-5">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-[#E7F8F2] text-[#14956C]">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-base font-extrabold">{item.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#666]">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-8">
          <h2 className="text-center text-3xl font-extrabold">چطور نوبت می‌گیرید؟</h2>
          <ol className="mt-8 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <li key={step.n} className="rounded-[1.5rem] bg-[#F7FBF9] p-5">
                <span className="flex size-9 items-center justify-center rounded-full bg-[#CFF6EA] text-sm font-extrabold text-[#14956C]">{step.n}</span>
                <h3 className="mt-4 text-lg font-extrabold">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-[#666]">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="px-4 pb-24 sm:px-8">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 rounded-[1.8rem] bg-[#14956C] px-6 py-8 text-white">
            <div>
              <h2 className="text-2xl font-extrabold">امروز وقت را بردارید</h2>
              <p className="mt-2 text-sm text-white/80">{clinic.address}</p>
            </div>
            <Link href="/patient/book" className="inline-flex h-12 items-center rounded-2xl bg-white px-6 text-sm font-extrabold text-[#14956C]">
              انتخاب ساعت
            </Link>
          </div>
        </section>
      </div>
    </SampleFrame>
  );
}

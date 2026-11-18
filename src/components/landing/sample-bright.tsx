import Image from "next/image";
import Link from "next/link";
import { SampleFrame, SampleLogo } from "@/components/landing/sample-frame";
import type { ClinicProfile } from "@/lib/types";

const reasons = [
  { title: "کاهش وزن", text: "وقتی رژیم‌های قبلی یا برنگشته یا برگشته است." },
  { title: "تثبیت", text: "وزن کم شده و نمی‌خواهید دوباره بالا بیاید." },
  { title: "همراه بیماری", text: "دیابت، فشار خون، کبد چرب یا بارداری." },
];

export function SampleBright({ clinic }: { clinic: ClinicProfile }) {
  const tel = clinic.phone.replace(/[^0-9+]/g, "");
  return (
    <SampleFrame active="bright">
      <div className="min-h-screen bg-[#F7F4EF] text-[#17241F]">
        <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
          <SampleLogo />
          <a href={`tel:${tel}`} className="text-sm font-bold text-[#1E4A38]" dir="ltr">
            {clinic.phone}
          </a>
        </header>

        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-[2rem] bg-[#1B3C30] text-[#F7F4EF]">
            <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1.1fr_0.9fr] lg:p-14">
              <div>
                <p className="text-sm text-[#E7C98A]">نوبت این هفته در یزد باز است</p>
                <h1 className="mt-4 text-4xl font-extrabold leading-[1.3] sm:text-6xl sm:leading-[1.2]">
                  یک برنامه غذایی.
                  <br />
                  نه یک چالش سی‌روزه.
                </h1>
                <p className="mt-5 max-w-md text-base leading-8 text-[#F7F4EF]/75">
                  در تندیس اول حرف می‌زنیم، بعد اندازه می‌گیریم، بعد غذا را روی زندگی واقعی‌تان تنظیم می‌کنیم.
                </p>
              </div>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.6rem] sm:aspect-[5/4] lg:aspect-[4/5]">
                <Image src="/images/landing-consult-desk.jpg" alt="میز مشاوره تغذیه" fill className="object-cover" priority sizes="40vw" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto -mt-8 grid max-w-6xl gap-4 px-4 sm:-mt-12 sm:grid-cols-2 sm:px-6">
          <Link href="/patient/book" className="rounded-[1.6rem] bg-white p-6 shadow-[0_16px_40px_rgba(23,36,31,0.06)]">
            <p className="text-sm text-[#17241F]/50">حضوری</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[#1B3C30]">نوبت کلینیک</h2>
            <p className="mt-3 text-sm leading-7 text-[#17241F]/70">{clinic.address}</p>
            <p className="mt-4 text-sm font-bold text-[#1E4A38]">انتخاب ساعت ←</p>
          </Link>
          <Link href="/patient/consult" className="rounded-[1.6rem] bg-[#E7C98A] p-6 text-[#1B3C30]">
            <p className="text-sm text-[#1B3C30]/70">از خانه</p>
            <h2 className="mt-2 text-3xl font-extrabold">مشاوره آنلاین</h2>
            <p className="mt-3 text-sm leading-7">سایز را می‌فرستید، وقت تماس را رزرو می‌کنید.</p>
            <p className="mt-4 text-sm font-bold">شروع درخواست ←</p>
          </Link>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <h2 className="text-3xl font-extrabold">اگر یکی از این‌ها مال شماست</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {reasons.map((item) => (
              <article key={item.title} className="rounded-[1.4rem] bg-white p-6">
                <h3 className="text-xl font-extrabold text-[#1B3C30]">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-[#17241F]/70">{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl items-center gap-8 px-5 pb-16 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.8rem]">
            <Image src="/images/about/doctor-pourhosseini.jpg" alt={clinic.about.doctorName} fill className="object-cover object-top" sizes="40vw" />
          </div>
          <div>
            <p className="text-sm text-[#17241F]/50">مسئول علمی</p>
            <h2 className="mt-2 text-3xl font-extrabold leading-snug">{clinic.about.doctorName}</h2>
            <p className="mt-2 text-sm text-[#1E4A38]">{clinic.about.doctorTitle}</p>
            <p className="mt-5 text-base leading-9 text-[#17241F]/80">{clinic.about.doctorBio}</p>
            <p className="mt-6 text-sm text-[#17241F]/55">{clinic.hours}</p>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 py-14 sm:px-8 md:grid-cols-[0.7fr_1.3fr] md:items-center">
            <div>
              <h2 className="text-3xl font-extrabold">دستگاه، مکمل رژیم است</h2>
              <p className="mt-3 text-sm leading-7 text-[#17241F]/65">
                آر‌اف، کویتیشن و ایندرمولوژی جایگزین غذا نیستند. بعد از ویزیت گفته می‌شود کدام‌شان به کار شما می‌آید.
              </p>
            </div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-[1.6rem]">
              <Image src="/images/device-rf.jpg" alt="دستگاه آر‌اف" fill className="object-cover" sizes="60vw" />
            </div>
          </div>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/5 bg-[#F7F4EF]/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="grid grid-cols-2 gap-2">
            <Link href="/patient/book" className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#1B3C30] text-sm font-bold text-white">
              نوبت حضوری
            </Link>
            <a href={`tel:${tel}`} className="inline-flex h-12 items-center justify-center rounded-2xl bg-white text-sm font-bold text-[#1B3C30]">
              تماس
            </a>
          </div>
        </div>

        <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 pb-24 text-sm text-[#17241F]/60 sm:px-8 md:pb-8">
          <p>{clinic.address}</p>
          <Link href="/patient/consult" className="font-bold text-[#1E4A38]">مشاوره آنلاین</Link>
        </footer>
      </div>
    </SampleFrame>
  );
}

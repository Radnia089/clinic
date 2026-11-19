import Image from "next/image";
import Link from "next/link";
import { CalendarCheck2, Headset, Salad, UtensilsCrossed } from "lucide-react";
import { SampleBmi } from "@/components/landing/sample-bmi";
import { SampleLogo } from "@/components/landing/sample-frame";
import { LandingLoginMenu } from "@/components/landing/landing-login-menu";
import type { ClinicProfile } from "@/lib/types";

const features = [
  { icon: UtensilsCrossed, title: "رژیم غذایی اختصاصی", text: "بر اساس ویژگی‌ها و شرایط خاص شما" },
  { icon: Salad, title: "برنامه بر اساس سفره خانوار", text: "منطبق با ذائقه و عادت غذایی شما" },
  { icon: Headset, title: "پشتیبانی در طول رژیم", text: "تلفنی، تا وقتی به برنامه عادت کنید" },
  { icon: CalendarCheck2, title: "پیگیری تا نتیجه", text: "وزن و دورها ثبت می‌شود و مسیر گم نمی‌شود" },
];

const diets = [
  { title: "کاهش وزن", text: "غذای ایرانی، بدون گرسنگی", chip: "bg-[#E8F8E4] text-[#1F7A28]", tile: "bg-[#3caf2d]", mark: "ک" },
  { title: "تثبیت", text: "وزن برگشت نکند", chip: "bg-[#E7F1FF] text-[#1D4E89]", tile: "bg-[#2F80ED]", mark: "ت" },
  { title: "دیابت و کبد", text: "رژیم همراه بیماری", chip: "bg-[#FFF1D6] text-[#8A5A00]", tile: "bg-[#F2B544]", mark: "د" },
  { title: "آنلاین", text: "اگر یزد نیستید", chip: "bg-[#F3E8FF] text-[#6B3FA0]", tile: "bg-[#8E5BD0]", mark: "آ" },
  { title: "دستگاه", text: "فقط کنار رژیم", chip: "bg-[#FDECEC] text-[#A33B3B]", tile: "bg-[#E15B5B]", mark: "ج" },
];

export function NutrishaLanding({ clinic }: { clinic: ClinicProfile }) {
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
          <a href="#diets">رژیم‌ها</a>
          <a href="#bmi">ماشین حساب</a>
          <a href="#visit">نوبت</a>
          <a href={`tel:${tel}`}>تماس</a>
        </nav>
      </header>

      <section id="start" className="mx-auto max-w-5xl px-5 pb-6 pt-8 text-center sm:px-8">
        <div className="relative mx-auto h-[240px] max-w-4xl overflow-hidden rounded-[2.2rem] bg-[#F7F7F7] sm:h-[360px]">
          <Image src="/images/landing-food-fresh.jpg" alt="یک وعده غذایی متعادل" fill priority className="object-cover" sizes="(max-width: 900px) 100vw, 900px" />
        </div>
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

      <section id="diets" className="mx-auto max-w-6xl px-5 pb-6 sm:px-8">
        <h2 className="border-r-4 border-[#3caf2d] pr-3 text-sm font-extrabold text-[#2E9B32]">انواع رژیم تندیس</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {diets.map((item) => (
            <Link key={item.title} href={item.title === "آنلاین" ? "/patient/consult" : "/patient/book"} className="rounded-[1.4rem] bg-white p-3 text-center shadow-[0_8px_24px_rgba(0,0,0,0.04)] ring-1 ring-black/5">
              <span className={`mx-auto flex size-16 items-center justify-center rounded-2xl text-xl font-extrabold text-white ${item.tile}`}>
                {item.mark}
              </span>
              <span className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-extrabold ${item.chip}`}>{item.title}</span>
              <p className="mt-2 text-xs leading-6 text-[#666]">{item.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="bmi" className="mx-auto max-w-3xl px-5 py-10 sm:px-8">
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

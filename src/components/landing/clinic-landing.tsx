import Image from "next/image";
import Link from "next/link";
import { Phone } from "lucide-react";

const navLinks = [
  { href: "#services", label: "خدمات" },
  { href: "#about", label: "درباره ما" },
  { href: "/patient/book", label: "نوبت حضوری" },
  { href: "/patient/consult", label: "مشاوره آنلاین" },
  { href: "#contact", label: "تماس با ما" },
];

const services = [
  {
    en: "Personal Diet Plan",
    fa: "رژیم شخصی",
    href: "/patient/book",
    image: "/images/meals/lunch.jpg",
  },
  {
    en: "In-Clinic Visit",
    fa: "نوبت حضوری",
    href: "/patient/book",
    image: "/images/clinic-care.jpg",
  },
  {
    en: "Online Consult",
    fa: "مشاوره آنلاین",
    href: "/patient/consult",
    image: "/images/hero-wellness.jpg",
  },
  {
    en: "Body Measurement",
    fa: "اندازه‌گیری سایز",
    href: "/patient/consult",
    image: "/images/measurement-guide.png",
  },
  {
    en: "Progress Follow-up",
    fa: "پیگیری پیشرفت",
    href: "/patient",
    image: "/images/meals/breakfast.jpg",
  },
];

const reasons = [
  { title: "رژیم علمی", text: "برنامه غذایی متناسب با هدف و سبک زندگی شما" },
  { title: "پیگیری منظم", text: "ثبت وزن و سایز در هر مرحله درمان" },
  { title: "حضوری و آنلاین", text: "هم مراجعه به کلینیک، هم مشاوره از خانه" },
  { title: "تیم متخصص", text: "همراهی مشاوران رژیم درمانی تندیس یزد" },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-center gap-4">
      <span className="h-px w-12 bg-gradient-to-l from-[#F07167] to-transparent sm:w-24" />
      <h2 className="text-center text-2xl font-extrabold text-[#2D2D2D] sm:text-3xl">
        {children}
      </h2>
      <span className="h-px w-12 bg-gradient-to-r from-[#F07167] to-transparent sm:w-24" />
    </div>
  );
}

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
    <div className="min-h-screen bg-white text-[#2D2D2D]">
      {/* Sticky white header — clinictandis style */}
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a
            href={`tel:${tel}`}
            className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#F07167] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#e45d53]"
          >
            <Phone className="size-4" />
            <span className="hidden sm:inline" dir="ltr">
              {phone}
            </span>
            <span className="sm:hidden">تماس</span>
          </a>

          <nav className="hidden items-center gap-5 text-sm font-medium text-[#4B5563] lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-[#F07167]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link href="/" className="relative -mb-8 flex size-[78px] shrink-0 items-center justify-center rounded-full bg-white p-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)] ring-1 ring-black/5 sm:size-[92px] sm:p-2.5">
            <Image
              src="/tandis-logo.png"
              alt="کلینیک تندیس"
              width={200}
              height={84}
              className="h-auto w-full object-contain"
              priority
            />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto mt-6 max-w-6xl px-4 sm:mt-8 sm:px-6">
        <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] sm:min-h-[520px] sm:rounded-[2.5rem]">
          <Image
            src="/images/tandis-landing-hero.jpg"
            alt="کلینیک لاغری تندیس یزد"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#2D2D2D]/35" />
          <div className="absolute inset-0 flex items-center justify-center p-5">
            <div className="w-full max-w-xl rounded-[2rem] border border-white/50 bg-white/20 px-6 py-10 text-center backdrop-blur-md sm:px-10 sm:py-12">
              <p className="text-2xl font-extrabold text-white sm:text-3xl">
                کلینیک لاغری تندیس
              </p>
              <p className="mt-2 font-[family-name:var(--font-playfair)] text-xl font-bold tracking-wide text-[#F07167] sm:text-2xl">
                TANDIS Diet Clinic
              </p>
              <p className="mt-4 text-sm leading-7 text-white/95 sm:text-base">
                کلینیک رژیم درمانی و لاغری در یزد — حضوری و آنلاین
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/patient/consult"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-[#F07167] px-6 text-sm font-bold text-white transition hover:bg-[#e45d53]"
                >
                  <Phone className="size-4" />
                  مشاوره و تماس
                </Link>
                <Link
                  href="/patient/book"
                  className="inline-flex h-11 items-center rounded-full bg-white px-6 text-sm font-bold text-[#F07167] transition hover:bg-[#FFF5F4]"
                >
                  رزرو نوبت حضوری
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionTitle>خدمات کلینیک</SectionTitle>
        <div className="mt-12 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5 lg:gap-5">
          {services.map((service) => (
            <Link
              key={service.fa}
              href={service.href}
              className="group relative min-w-[200px] snap-start overflow-hidden rounded-t-[100px] rounded-b-2xl bg-[#FFF5F4] shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:min-w-0"
            >
              <div className="relative h-44 overflow-hidden rounded-t-[100px]">
                <Image
                  src={service.image}
                  alt={service.fa}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="220px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#F07167]/70 via-transparent to-transparent" />
              </div>
              <div className="px-3 py-4 text-center">
                <p className="text-[11px] font-medium text-[#F07167]">{service.en}</p>
                <p className="mt-1 text-sm font-extrabold text-[#2D2D2D]">
                  {service.fa}
                </p>
                <span className="mt-3 inline-flex rounded-full bg-[#F07167] px-3 py-1 text-[11px] font-bold text-white">
                  مشاهده
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-[#FFF8F7] py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionTitle>درباره کلینیک تندیس</SectionTitle>
          <div className="mt-12 grid items-center gap-10 md:grid-cols-2">
            <div>
              <h3 className="text-xl font-extrabold text-[#F07167]">
                کلینیک تخصصی رژیم درمانی و لاغری تندیس یزد
              </h3>
              <p className="mt-4 text-sm leading-8 text-[#6B7280] sm:text-base">
                در کلینیک تندیس، مسیر کاهش وزن با رژیم علمی، اندازه‌گیری دقیق و
                پیگیری منظم طراحی می‌شود. می‌توانید برای ویزیت حضوری وقت بگیرید یا
                از طریق مشاوره آنلاین، سایز و مشخصات خود را ارسال کنید تا وقت
                تماس برایتان رزرو شود.
              </p>
              <Link
                href="/patient"
                className="mt-6 inline-flex h-11 items-center rounded-full bg-[#F07167] px-6 text-sm font-bold text-white transition hover:bg-[#e45d53]"
              >
                ورود به اپ مشتری
              </Link>
            </div>
            <div className="relative min-h-[260px] overflow-hidden rounded-[2rem] sm:min-h-[320px]">
              <Image
                src="/images/clinic-care.jpg"
                alt="فضای کلینیک تندیس"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionTitle>چرا کلینیک تندیس</SectionTitle>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl bg-gradient-to-b from-[#FFF5F4] to-white px-5 py-7 text-center ring-1 ring-[#F07167]/10"
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#F07167]" />
              <h3 className="text-base font-extrabold text-[#2D2D2D]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[#6B7280]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Consultation CTA pill */}
      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 rounded-full bg-[#FFF5F4] px-6 py-8 text-center ring-1 ring-[#F07167]/15 sm:flex-row sm:px-10 sm:text-right">
          <div>
            <p className="text-xl font-extrabold text-[#2D2D2D] sm:text-2xl">
              در مسیر لاغری همراه شماییم
            </p>
            <p className="mt-2 text-sm text-[#6B7280]">
              همین حالا درخواست مشاوره آنلاین یا نوبت حضوری بدهید
            </p>
          </div>
          <Link
            href="/patient/consult"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-[#F07167] px-7 text-sm font-bold text-white"
          >
            <Phone className="size-4" />
            درخواست مشاوره
          </Link>
        </div>
      </section>

      {/* Contact / booking band */}
      <section id="contact" className="bg-[#FFF8F7] py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2">
          <div className="relative min-h-[280px] overflow-hidden rounded-[2rem]">
            <Image
              src="/images/hero-wellness.jpg"
              alt="مشاوره رژیم درمانی"
              fill
              className="object-cover"
              sizes="50vw"
            />
          </div>
          <div>
            <SectionTitle>رزرو و تماس</SectionTitle>
            <p className="mt-6 text-sm leading-8 text-[#6B7280]">
              برای هماهنگی نوبت حضوری یا مشاوره آنلاین از دکمه‌های زیر استفاده
              کنید. اطلاعات تماس کلینیک نیز همین‌جاست.
            </p>
            <dl className="mt-6 space-y-3 text-sm">
              <div>
                <dt className="font-bold text-[#F07167]">آدرس</dt>
                <dd className="mt-1 text-[#4B5563]">{address}</dd>
              </div>
              <div>
                <dt className="font-bold text-[#F07167]">تلفن</dt>
                <dd className="mt-1">
                  <a href={`tel:${tel}`} className="font-bold text-[#2D2D2D]" dir="ltr">
                    {phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="font-bold text-[#F07167]">ساعات کاری</dt>
                <dd className="mt-1 text-[#4B5563]">{hours}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/patient/book"
                className="inline-flex h-11 items-center rounded-full bg-[#F07167] px-6 text-sm font-bold text-white"
              >
                رزرو نوبت حضوری
              </Link>
              <Link
                href="/patient/consult"
                className="inline-flex h-11 items-center rounded-full border border-[#F07167] bg-white px-6 text-sm font-bold text-[#F07167]"
              >
                مشاوره آنلاین
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer — coral like reference */}
      <footer className="bg-[#F07167] text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="inline-block rounded-2xl bg-white px-3 py-2">
              <Image
                src="/tandis-logo.png"
                alt="تندیس"
                width={140}
                height={58}
                className="h-10 w-auto object-contain"
              />
            </div>
            <p className="mt-4 text-sm leading-7 text-white/90">
              کلینیک لاغری و رژیم درمانی تندیس یزد
            </p>
          </div>
          <div>
            <p className="font-extrabold">خدمات</p>
            <ul className="mt-3 space-y-2 text-sm text-white/90">
              <li>
                <Link href="/patient/book">نوبت حضوری</Link>
              </li>
              <li>
                <Link href="/patient/consult">مشاوره آنلاین</Link>
              </li>
              <li>
                <Link href="/patient">اپ مشتری</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-extrabold">دسترسی سریع</p>
            <ul className="mt-3 space-y-2 text-sm text-white/90">
              <li>
                <Link href="#about">درباره ما</Link>
              </li>
              <li>
                <Link href="#contact">تماس با ما</Link>
              </li>
              <li>
                <Link href="/apps">ورود کارکنان</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-extrabold">تماس</p>
            <p className="mt-3 text-sm leading-7 text-white/90">{address}</p>
            <a href={`tel:${tel}`} className="mt-2 inline-block text-sm font-bold" dir="ltr">
              {phone}
            </a>
          </div>
        </div>
        <div className="border-t border-white/20 py-4 text-center text-xs text-white/80">
          © کلینیک لاغری تندیس یزد
        </div>
      </footer>
    </div>
  );
}

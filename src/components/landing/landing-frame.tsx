import Image from "next/image";
import Link from "next/link";
import { Clock3, MapPin, Phone } from "lucide-react";
import { LandingLoginMenu } from "@/components/landing/landing-login-menu";
import { PhoneLink } from "@/components/landing/phone-link";
import { TANDIS_INSTAGRAM_HANDLE, TANDIS_INSTAGRAM_URL } from "@/lib/social-links";
import type { ClinicProfile } from "@/lib/types";

const headerLinks = [
  { href: "/", label: "خانه" },
  { href: "/#devices", label: "دستگاه‌ها" },
  { href: "/about", label: "درباره ما" },
  { href: "/contact", label: "تماس با ما" },
];

const footerLinks = [
  ...headerLinks,
  { href: "/#bmi", label: "ماشین حساب" },
  { href: "/#champions", label: "قهرمانان" },
  { href: "/#magazine", label: "مجله" },
  { href: "/patient/book", label: "نوبت" },
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

export function LandingFrame({
  clinic,
  children,
}: {
  clinic: ClinicProfile;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      <header className="sticky top-0 z-40 border-b border-[#E5F0E6] bg-white/92 shadow-[0_8px_24px_rgba(20,53,42,0.04)] backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <Image src="/tandis-logo.png" alt="تندیس" width={132} height={52} className="h-11 w-auto" priority />
            <span className="hidden min-w-0 sm:block">
              <span className="block truncate text-sm font-extrabold text-[#14352A]">کلینیک تندیس</span>
              <span className="block text-[11px] text-[#66756c]">رژیم درمانی · یزد</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {headerLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 text-sm font-bold text-[#3d4f45] transition hover:bg-[#F3FAF3] hover:text-[#2E9B32]"
              >
                {item.label}
              </a>
            ))}
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
          {headerLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-full bg-[#F4F8F4] px-3.5 py-1.5 text-xs font-bold text-[#244033]"
            >
              {item.label}
            </a>
          ))}
          <a href="/api/app-download" className="shrink-0 rounded-full bg-[#E8F6E8] px-3.5 py-1.5 text-xs font-extrabold text-[#2E9B32]">
            دانلود اپ
          </a>
        </nav>
      </header>
      {children}
      <footer id="contact" className="scroll-mt-24 bg-[#0E241C] text-white">
        <div className="h-1 bg-gradient-to-l from-[#F0B429] via-[#3caf2d] to-[#0E241C]" />
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.3fr_0.8fr_1.15fr]">
          <div>
            <p className="text-lg font-extrabold">تندیس، دوست سلامتی تو</p>
            <p className="mt-2 max-w-sm text-sm leading-7 text-white/70">{clinic.tagline}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-[#F0B429]">دسترسی</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="text-white/75 transition hover:text-white">
                    {item.label}
                  </a>
                </li>
              ))}
              <li>
                <Link href="/patient/book" className="text-white/75 transition hover:text-white">
                  دریافت رژیم
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <a href="/contact" className="text-xs font-bold text-[#F0B429] hover:text-[#ffd36a]">
              تماس با ما
            </a>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-white/80">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-1 size-4 shrink-0 text-[#F0B429]" />
                <span>{clinic.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="size-4 shrink-0 text-[#F0B429]" />
                <PhoneLink phone={clinic.phone} className="font-bold text-white">
                  <span dir="ltr">{clinic.phone}</span>
                </PhoneLink>
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
              <a href={clinic.about.mapUrl} className="mt-4 inline-flex text-sm font-bold text-[#F0B429] hover:text-[#ffd36a]">
                مسیر روی نقشه
              </a>
            ) : null}
          </div>
        </div>
        <div className="border-t border-white/10">
          <p className="px-5 py-4 text-center text-xs leading-6 text-white/55 sm:px-8">
            کلیه حقوق این وب‌سایت متعلق به کلینیک تندیس می‌باشد.
          </p>
        </div>
      </footer>
    </div>
  );
}

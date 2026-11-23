import type { Metadata } from "next";
import { Clock3, MapPin, Navigation, Phone } from "lucide-react";
import { LandingFrame } from "@/components/landing/landing-frame";
import { PhoneLink } from "@/components/landing/phone-link";
import { SITE_NAME, shareMetadata } from "@/lib/site-seo";
import { TANDIS_INSTAGRAM_HANDLE, TANDIS_INSTAGRAM_URL } from "@/lib/social-links";
import { getAppData } from "@/lib/store";

export const dynamic = "force-dynamic";

const CONTACT_TITLE = `تماس با ما | ${SITE_NAME}`;

export async function generateMetadata(): Promise<Metadata> {
  const { clinic } = await getAppData();
  const description = `تماس با ${clinic.fullName}: ${clinic.address}. تلفن ${clinic.phone}. ${clinic.hours}`;
  return {
    title: { absolute: CONTACT_TITLE },
    description,
    ...shareMetadata(CONTACT_TITLE, description, "/contact"),
  };
}

function InstagramMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default async function ContactPage() {
  const { clinic } = await getAppData();

  return (
    <LandingFrame clinic={clinic}>
      <main className="bg-[#F7FBF7]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <h1 className="border-r-4 border-[#3caf2d] pr-3 text-sm font-extrabold text-[#2E9B32]">تماس با ما</h1>
          <p className="mt-4 text-2xl font-extrabold text-[#14352A] sm:text-3xl">{clinic.fullName}</p>
          {clinic.tagline ? <p className="mt-2 text-sm font-bold text-[#C48A12]">{clinic.tagline}</p> : null}

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <section className="rounded-[1.8rem] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
              <MapPin className="size-6 text-[#2E9B32]" />
              <h2 className="mt-3 text-base font-extrabold text-[#14352A]">آدرس</h2>
              <p className="mt-2 text-sm leading-8 text-[#444]">{clinic.address}</p>
            </section>
            <section className="rounded-[1.8rem] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
              <Phone className="size-6 text-[#2E9B32]" />
              <h2 className="mt-3 text-base font-extrabold text-[#14352A]">تلفن</h2>
              <p className="mt-2 text-lg font-extrabold text-[#14352A]">
                <PhoneLink phone={clinic.phone}>
                  <span dir="ltr">{clinic.phone}</span>
                </PhoneLink>
              </p>
            </section>
            <section className="rounded-[1.8rem] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
              <Clock3 className="size-6 text-[#2E9B32]" />
              <h2 className="mt-3 text-base font-extrabold text-[#14352A]">ساعت کاری</h2>
              <p className="mt-2 text-sm leading-8 text-[#444]">{clinic.hours}</p>
            </section>
          </div>

          <section className="mt-4 flex flex-wrap items-center gap-3 rounded-[1.8rem] bg-white p-6 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
            <a
              href={TANDIS_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-[#E8F6E8] px-5 text-sm font-extrabold text-[#2E9B32]"
            >
              <InstagramMark className="size-4" />
              <span dir="ltr">@{TANDIS_INSTAGRAM_HANDLE}</span>
            </a>
            {clinic.about.mapUrl ? (
              <a
                href={clinic.about.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#14352A] px-5 text-sm font-extrabold text-white"
              >
                <Navigation className="size-4" />
                مشاهده لوکیشن و مسیریابی
              </a>
            ) : null}
          </section>
        </div>
      </main>
    </LandingFrame>
  );
}

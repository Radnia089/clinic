import type { Metadata } from "next";
import Image from "next/image";
import { Clock3, MapPin, Navigation, Phone, UserRound } from "lucide-react";
import { LandingFrame } from "@/components/landing/landing-frame";
import { PhoneLink } from "@/components/landing/phone-link";
import { SITE_NAME, shareMetadata } from "@/lib/site-seo";
import { getAppData } from "@/lib/store";

export const dynamic = "force-dynamic";

const ABOUT_TITLE = `درباره ما | ${SITE_NAME}`;

export async function generateMetadata(): Promise<Metadata> {
  const { clinic } = await getAppData();
  const description = clinic.about.aboutText.replace(/\s+/g, " ").trim().slice(0, 180);
  return {
    title: { absolute: ABOUT_TITLE },
    description,
    ...shareMetadata(ABOUT_TITLE, description, "/about"),
  };
}

export default async function AboutPage() {
  const { clinic } = await getAppData();
  const about = clinic.about;

  return (
    <LandingFrame clinic={clinic}>
      <main className="bg-[#F7FBF7]">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
          <h1 className="border-r-4 border-[#3caf2d] pr-3 text-sm font-extrabold text-[#2E9B32]">درباره ما</h1>
          <p className="mt-4 text-2xl font-extrabold text-[#14352A] sm:text-3xl">{clinic.fullName}</p>
          {clinic.tagline ? <p className="mt-2 text-sm font-bold text-[#C48A12]">{clinic.tagline}</p> : null}

          {about.coverImage ? (
            <div className="relative mt-6 aspect-[16/7] overflow-hidden rounded-[1.8rem]">
              <Image
                src={about.coverImage}
                alt={clinic.fullName}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1152px) 100vw, 1152px"
              />
            </div>
          ) : null}

          <p className="mt-6 max-w-3xl text-sm leading-8 text-[#444]">{about.aboutText}</p>

          <section className="mt-10 grid items-start gap-6 rounded-[1.8rem] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] md:grid-cols-[160px_1fr] md:p-8">
            <div className="relative mx-auto size-36 overflow-hidden rounded-full bg-[#E8F6E8]">
              {about.doctorImage ? (
                <Image
                  src={about.doctorImage}
                  alt={about.doctorName}
                  fill
                  className="object-cover object-[center_20%]"
                  sizes="144px"
                />
              ) : (
                <span className="flex size-full items-center justify-center text-[#2E9B32]">
                  <UserRound className="size-10" />
                </span>
              )}
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm font-bold text-[#2E9B32]">پزشک / مشاور</p>
              <h2 className="mt-1 text-2xl font-extrabold">{about.doctorName}</h2>
              {about.doctorTitle ? <p className="mt-1 text-sm text-[#666]">{about.doctorTitle}</p> : null}
              {about.doctorBio ? <p className="mt-3 text-sm leading-7 text-[#444]">{about.doctorBio}</p> : null}
            </div>
          </section>

          {about.gallery.length > 0 ? (
            <section className="mt-10">
              <h2 className="text-base font-extrabold text-[#14352A]">تصاویر کلینیک</h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {about.gallery.map((src) => (
                  <div key={src} className="relative aspect-square overflow-hidden rounded-2xl bg-white">
                    <Image src={src} alt="تصویر کلینیک تندیس" fill className="object-cover" sizes="240px" />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-10 grid gap-3 rounded-[1.8rem] bg-white p-5 shadow-[0_8px_24px_rgba(0,0,0,0.04)] sm:grid-cols-2 sm:p-8">
            <h2 className="text-base font-extrabold text-[#14352A] sm:col-span-2">تماس و آدرس</h2>
            <p className="flex items-start gap-2.5 text-sm leading-7 text-[#444]">
              <MapPin className="mt-1 size-4 shrink-0 text-[#2E9B32]" />
              <span>{clinic.address}</span>
            </p>
            <p className="flex items-center gap-2.5 text-sm font-bold text-[#14352A]">
              <Phone className="size-4 shrink-0 text-[#2E9B32]" />
              <PhoneLink phone={clinic.phone}>
                <span dir="ltr">{clinic.phone}</span>
              </PhoneLink>
            </p>
            <p className="flex items-start gap-2.5 text-sm leading-7 text-[#444] sm:col-span-2">
              <Clock3 className="mt-1 size-4 shrink-0 text-[#2E9B32]" />
              <span>{clinic.hours}</span>
            </p>
            {about.mapUrl ? (
              <a
                href={about.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#14352A] px-5 text-sm font-extrabold text-white sm:col-span-2 sm:w-fit"
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

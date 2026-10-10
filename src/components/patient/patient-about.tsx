"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Clock3,
  MapPin,
  Navigation,
  Phone,
  UserRound,
} from "lucide-react";
import {
  DEFAULT_CLINIC_ABOUT,
  type ClinicAbout,
} from "@/lib/types";
import {
  TANDIS_INSTAGRAM_HANDLE,
  TANDIS_INSTAGRAM_URL,
} from "@/lib/social-links";

type AboutClinic = {
  name: string;
  fullName: string;
  tagline: string;
  phone: string;
  address: string;
  hours: string;
  about: ClinicAbout;
};

const GALLERY_CAPTIONS: Record<string, string> = {
  "/images/device-rf.jpg": "دستگاه آر‌اف (RF)",
  "/images/device-cavitation.jpg": "کاویتیشن",
  "/images/device-endermologie.jpg": "اندومولوژی",
  "/images/landing-consult-desk.jpg": "مشاوره تغذیه",
  "/images/clinic-care.jpg": "فضای کلینیک",
};

function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:+98${digits.replace(/^0/, "")}` : "tel:";
}

export function PatientAboutScreen() {
  const [clinic, setClinic] = useState<AboutClinic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/clinic/about", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.clinic) setClinic(data.clinic);
      })
      .finally(() => setLoading(false));
  }, []);

  const about = clinic?.about ?? DEFAULT_CLINIC_ABOUT;

  return (
    <div className="min-h-[100svh] bg-[#F6F8F5]">
      <div className="mx-auto w-full max-w-[430px] px-4 pb-16 pt-6">
        <Link
          href="/patient"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#14352A]/70"
        >
          <ArrowRight className="size-4" />
          بازگشت
        </Link>

        <h1 className="mt-4 text-2xl font-extrabold text-brand">درباره ما</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {clinic?.fullName || "کلینیک تخصصی لاغری و رژیم درمانی تندیس"}
        </p>

        {loading ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">
            در حال بارگذاری...
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            {about.coverImage ? (
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1.75rem]">
                <Image
                  src={about.coverImage}
                  alt="کلینیک تندیس"
                  fill
                  className="object-cover"
                  sizes="430px"
                  priority
                />
              </div>
            ) : null}

            <section className="rounded-[1.5rem] bg-white p-4 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
              <h2 className="text-base font-extrabold text-[#14352A]">
                معرفی کلینیک
              </h2>
              <p className="mt-2 text-sm leading-7 text-[#1A2E26]/75">
                {about.aboutText}
              </p>
              {clinic?.tagline ? (
                <p className="mt-3 text-xs font-bold text-[#C48A12]">
                  {clinic.tagline}
                </p>
              ) : null}
            </section>

            <section className="rounded-[1.5rem] bg-white p-4 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
              <div className="flex items-start gap-3">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-[#E8F2EA]">
                  {about.doctorImage ? (
                    <Image
                      src={about.doctorImage}
                      alt={about.doctorName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-brand">
                      <UserRound className="size-8" />
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#C48A12]">پزشک / مشاور</p>
                  <h2 className="mt-1 text-base font-extrabold text-[#14352A]">
                    {about.doctorName}
                  </h2>
                  <p className="mt-0.5 text-xs font-medium text-[#14352A]/65">
                    {about.doctorTitle}
                  </p>
                </div>
              </div>
              {about.doctorBio ? (
                <p className="mt-3 text-sm leading-7 text-[#1A2E26]/75">
                  {about.doctorBio}
                </p>
              ) : null}
            </section>

            {about.gallery.length > 0 ? (
              <section className="space-y-2">
                <h2 className="px-1 text-base font-extrabold text-[#14352A]">
                  دستگاه‌ها و فضای کلینیک
                </h2>
                <div className="grid grid-cols-2 gap-2">
                  {about.gallery.map((src) => (
                    <div
                      key={src}
                      className="relative aspect-square overflow-hidden rounded-2xl bg-white"
                    >
                      <Image
                        src={src}
                        alt={GALLERY_CAPTIONS[src] || "تصویر کلینیک"}
                        fill
                        className="object-cover"
                        sizes="200px"
                      />
                      {GALLERY_CAPTIONS[src] ? (
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent px-2 pb-2 pt-8 text-[11px] font-bold text-white">
                          {GALLERY_CAPTIONS[src]}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section className="space-y-2 rounded-[1.5rem] bg-white p-4 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
              <h2 className="text-base font-extrabold text-[#14352A]">
                تماس و آدرس
              </h2>
              <a
                href={telHref(clinic?.phone || "")}
                className="flex items-center gap-3 rounded-2xl bg-[#F7F8F6] px-3 py-3"
              >
                <Phone className="size-4 text-brand" />
                <span className="text-sm font-bold text-[#14352A]" dir="ltr">
                  {clinic?.phone}
                </span>
              </a>
              <div className="flex items-start gap-3 rounded-2xl bg-[#F7F8F6] px-3 py-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand" />
                <p className="text-sm leading-7 text-[#1A2E26]/75">
                  {clinic?.address}
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-[#F7F8F6] px-3 py-3">
                <Clock3 className="mt-0.5 size-4 shrink-0 text-brand" />
                <p className="text-sm leading-7 text-[#1A2E26]/75">
                  {clinic?.hours}
                </p>
              </div>
              {about.mapUrl ? (
                <a
                  href={about.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-[#14352A] text-sm font-extrabold text-white"
                >
                  <Navigation className="size-4" />
                  مشاهده لوکیشن و مسیریابی
                </a>
              ) : null}
              <a
                href={TANDIS_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 flex-col items-center justify-center rounded-full bg-[#E8F2EA] text-sm font-extrabold text-brand"
              >
                <span>اینستاگرام تندیس</span>
                <span className="text-[11px] font-medium opacity-80" dir="ltr">
                  @{TANDIS_INSTAGRAM_HANDLE}
                </span>
              </a>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

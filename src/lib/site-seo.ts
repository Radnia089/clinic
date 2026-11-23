import { TANDIS_INSTAGRAM_URL } from "@/lib/social-links";
import type { ClinicProfile } from "@/lib/types";

export const SITE_NAME = "کلینیک لاغری تندیس یزد";
export const HOME_TITLE = "کلینیک لاغری در یزد | رژیم و دستگاه‌های لاغری تندیس";
export const HOME_DESCRIPTION =
  "کلینیک لاغری تندیس در یزد: رژیم درمانی شخصی، دستگاه‌های لاغری و نوبت حضوری یا مشاوره آنلاین در صفاییه.";
export const BOOK_TITLE = "نوبت کلینیک لاغری در یزد | رژیم و دستگاه تندیس";
export const BOOK_DESCRIPTION =
  "وقت رژیم و دستگاه‌های لاغری در کلینیک تندیس یزد، صفاییه. شنبه، یکشنبه، سه‌شنبه و چهارشنبه از ۱۶ تا ۲۱.";
export const CONSULT_TITLE = "مشاوره رژیم و لاغری | کلینیک تندیس یزد";
export const CONSULT_DESCRIPTION =
  "مشاوره آنلاین رژیم درمانی و لاغری از کلینیک تندیس در یزد، با برنامه غذایی شخصی.";
export const MAGAZINE_TITLE = "مجله لاغری و رژیم درمانی | کلینیک تندیس یزد";
export const MAGAZINE_DESCRIPTION =
  "راهنمای رژیم، لاغری و دستگاه‌های لاغری از کلینیک تندیس در یزد.";
export const SHARE_IMAGE = "/images/clinic-care.jpg";

const PERSIAN_DAYS: Record<string, string> = {
  شنبه: "Saturday",
  یکشنبه: "Sunday",
  دوشنبه: "Monday",
  "سه‌شنبه": "Tuesday",
  سهشنبه: "Tuesday",
  چهارشنبه: "Wednesday",
  پنجشنبه: "Thursday",
  جمعه: "Friday",
};

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

export function siteOrigin() {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const origin = configured && configured.length > 0 ? configured : "https://tandisclinicyazd.ir";
  return origin.replace(/\/$/, "");
}

export function absoluteUrl(path: string) {
  if (!path) return siteOrigin();
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${siteOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

export function jsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function latinDigits(value: string) {
  return value.replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)));
}

export function openingHoursSpecification(hours: string) {
  const normalized = latinDigits(hours).replace(/\s+/g, " ").trim();
  const [dayPart, timePart] = normalized.split("·").map((part) => part.trim());
  const dayNames = (dayPart || "")
    .replace(/ و /g, "، ")
    .split(/[،,]/)
    .map((part) => PERSIAN_DAYS[part.trim()])
    .filter((day): day is string => Boolean(day));
  const timeMatch = (timePart || normalized).match(
    /(\d{1,2})(?::(\d{2}))?\s*(?:تا|-)\s*(\d{1,2})(?::(\d{2}))?/
  );
  const days = dayNames.length
    ? dayNames
    : ["Saturday", "Sunday", "Tuesday", "Wednesday"];
  const opens = timeMatch
    ? `${timeMatch[1].padStart(2, "0")}:${timeMatch[2] ?? "00"}`
    : "16:00";
  const closes = timeMatch
    ? `${timeMatch[3].padStart(2, "0")}:${timeMatch[4] ?? "00"}`
    : "21:00";
  return days.map((dayOfWeek) => ({
    "@type": "OpeningHoursSpecification" as const,
    dayOfWeek,
    opens,
    closes,
  }));
}

export function clinicTelephone(phone: string) {
  const compact = phone.replace(/[^\d+]/g, "");
  if (compact.startsWith("+")) return compact;
  if (compact.startsWith("00")) return `+${compact.slice(2)}`;
  if (compact.startsWith("0")) return `+98${compact.slice(1)}`;
  return compact;
}

function geoFrom(mapUrl?: string) {
  const match = mapUrl?.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return { latitude: 31.839193, longitude: 54.368628 };
  return { latitude: Number(match[1]), longitude: Number(match[2]) };
}

export function clinicFaqs(
  clinic: Pick<ClinicProfile, "address" | "phone" | "hours">
) {
  return [
    {
      question: "کلینیک لاغری در یزد کجاست؟",
      answer: `کلینیک لاغری تندیس در ${clinic.address} است. تلفن \u2066${clinic.phone}\u2069. ساعت کار: ${clinic.hours}.`,
    },
    {
      question: "رژیم درمانی تندیس چطور نوشته می‌شود؟",
      answer:
        "رژیم غذایی شخصی برای لاغری، بر اساس هدف، سایز و سفره خانوار نوشته می‌شود و تا رسیدن به نتیجه پیگیری می‌شود.",
    },
    {
      question: "دستگاه‌های لاغری تندیس کدام‌اند؟",
      answer:
        "دستگاه‌های لاغری تندیس لیپولکس، آر‌اف رافوس و ایندرمولوژی هستند و کنار رژیم برای شکم، پهلو، ران و فرم پوست به کار می‌روند.",
    },
    {
      question: "لاغری در یزد را حضوری شروع کنم یا آنلاین؟",
      answer:
        "برای اندازه‌گیری و دستگاه‌های لاغری نوبت حضوری بگیرید. برای شروع رژیم از راه دور، مشاوره آنلاین کافی است.",
    },
  ];
}

export function clinicJsonLd(
  clinic: Pick<ClinicProfile, "fullName" | "phone" | "address" | "hours" | "about">
) {
  const geo = geoFrom(clinic.about?.mapUrl);
  const faqs = clinicFaqs(clinic);
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MedicalClinic",
        name: SITE_NAME,
        alternateName: [clinic.fullName, "کلینیک لاغری در یزد", "کلینیک رژیم درمانی تندیس"],
        description: HOME_DESCRIPTION,
        url: siteOrigin(),
        image: absoluteUrl(SHARE_IMAGE),
        logo: absoluteUrl("/tandis-logo.png"),
        telephone: clinicTelephone(clinic.phone),
        address: {
          "@type": "PostalAddress",
          streetAddress: clinic.address,
          addressLocality: "یزد",
          addressRegion: "یزد",
          addressCountry: "IR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: geo.latitude,
          longitude: geo.longitude,
        },
        ...(clinic.about?.mapUrl ? { hasMap: clinic.about.mapUrl } : {}),
        openingHoursSpecification: openingHoursSpecification(clinic.hours),
        sameAs: [TANDIS_INSTAGRAM_URL],
        areaServed: {
          "@type": "City",
          name: "یزد",
        },
        knowsAbout: ["رژیم", "لاغری", "رژیم درمانی", "دستگاه‌های لاغری", "کاهش وزن"],
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

export function shareMetadata(title: string, description: string, path: string) {
  return {
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "fa_IR" as const,
      type: "website" as const,
      images: [{ url: SHARE_IMAGE, alt: "کلینیک لاغری تندیس در یزد" }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [SHARE_IMAGE],
    },
  };
}

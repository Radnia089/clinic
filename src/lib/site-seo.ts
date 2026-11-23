import { TANDIS_INSTAGRAM_URL } from "@/lib/social-links";
import type { ClinicProfile } from "@/lib/types";

export const SITE_NAME = "کلینیک لاغری تندیس یزد";
export const HOME_TITLE = "کلینیک لاغری تندیس یزد | رژیم درمانی و مشاوره آنلاین";
export const HOME_DESCRIPTION =
  "کلینیک رژیم درمانی و لاغری تندیس در یزد، صفاییه. رزرو نوبت حضوری، مشاوره آنلاین و برنامه غذایی شخصی.";
export const BOOK_TITLE = "رزرو نوبت حضوری | کلینیک لاغری تندیس یزد";
export const BOOK_DESCRIPTION =
  "نوبت حضوری کلینیک تندیس در یزد، صفاییه، مجتمع خورشید. شنبه، یکشنبه، سه‌شنبه و چهارشنبه از ۱۶ تا ۲۱.";
export const CONSULT_TITLE = "مشاوره آنلاین تغذیه | کلینیک لاغری تندیس یزد";
export const CONSULT_DESCRIPTION =
  "درخواست مشاوره آنلاین رژیم درمانی از کلینیک تندیس یزد، با برنامه غذایی شخصی.";
export const MAGAZINE_TITLE = "مجله لاغری و رژیم درمانی | کلینیک تخصصی تندیس یزد";
export const MAGAZINE_DESCRIPTION =
  "مقاله‌های رژیم درمانی، کاهش وزن و دستگاه‌های کمک لاغری از کلینیک تندیس یزد.";
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

export function clinicJsonLd(
  clinic: Pick<ClinicProfile, "fullName" | "phone" | "address" | "hours" | "about">
) {
  const geo = geoFrom(clinic.about?.mapUrl);
  return {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: clinic.fullName || SITE_NAME,
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

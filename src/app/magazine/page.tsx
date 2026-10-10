import type { Metadata } from "next";
import Link from "next/link";
import { MagazineList } from "@/components/magazine/magazine-list";
import { listArticles } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "مجله لاغری و رژیم درمانی | کلینیک تخصصی تندیس یزد",
  description:
    "مقالات سئو‌شده درباره رژیم درمانی، کاهش وزن، دستگاه‌های کمک لاغری و سبک زندگی از کلینیک لاغری تندیس یزد. اینستاگرام: @tandis_clinic_yazd",
  keywords: [
    "کلینیک لاغری تندیس",
    "رژیم درمانی یزد",
    "لاغری یزد",
    "مشاوره تغذیه یزد",
    "مجله لاغری",
    "tandis_clinic_yazd",
  ],
  alternates: { canonical: "/magazine" },
  openGraph: {
    title: "مجله کلینیک لاغری تندیس یزد",
    description:
      "راهنمای رژیم، کاهش سایز و دستگاه‌های کمک لاغری از کلینیک تخصصی تندیس.",
    locale: "fa_IR",
    type: "website",
  },
};

export default async function MagazinePage() {
  const items = await listArticles({ publishedOnly: true });

  return (
    <div className="min-h-screen bg-[#F6F8F5]">
      <header className="border-b border-[#1A2E26]/08 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold text-[#C48A12]">کلینیک تندیس</p>
            <h1 className="text-2xl font-extrabold text-[#14352A]">مجله</h1>
          </div>
          <Link href="/" className="text-sm font-medium text-brand">
            بازگشت به سایت
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <MagazineList items={items} hrefBase="/magazine" />
      </main>
    </div>
  );
}

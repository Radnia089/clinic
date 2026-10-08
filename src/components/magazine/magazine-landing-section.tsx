import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArticleCard } from "@/components/magazine/article-card";
import type { MagazineArticle } from "@/lib/types";

export function MagazineLandingSection({
  items,
}: {
  items: MagazineArticle[];
}) {
  if (items.length === 0) return null;
  const preview = items.slice(0, 3);

  return (
    <section id="magazine" className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold tracking-wide text-[#C48A12]">مجله تندیس</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[#14352A] sm:text-4xl">
              مقالات لاغری و رژیم درمانی
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-8 text-[#1A2E26]/70 sm:text-base">
              محتوای آموزشی برای انتخاب بهتر مسیر تغذیه، کاهش وزن و کاهش سایز.
            </p>
          </div>
          <Link
            href="/magazine"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#14352A] px-5 text-sm font-bold text-white transition hover:bg-[#1f4a3a]"
          >
            مشاهده همه مقالات
            <ArrowLeft className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {preview.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}

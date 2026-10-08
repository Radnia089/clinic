"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ArticleCard } from "@/components/magazine/article-card";
import { MAGAZINE_CATEGORIES, type MagazineArticle } from "@/lib/magazine";
import { cn } from "@/lib/utils";

function faNum(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}

export function MagazineList({
  items,
  hrefBase = "/magazine",
}: {
  items: MagazineArticle[];
  hrefBase?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("همه");
  const [newestFirst, setNewestFirst] = useState(true);

  const filtered = useMemo(() => {
    const q = query.trim();
    let list = items.filter((item) => {
      const matchCategory = category === "همه" || item.category === category;
      const matchQuery =
        !q ||
        item.title.includes(q) ||
        item.excerpt.includes(q) ||
        item.category.includes(q);
      return matchCategory && matchQuery;
    });
    list = [...list].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return newestFirst ? db - da : da - db;
    });
    return list;
  }, [items, query, category, newestFirst]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-brand">
        مقاله‌ها{" "}
        <span className="font-bold">{faNum(filtered.length)} مقاله</span>
      </p>

      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو در مجله"
          className="h-12 w-full rounded-2xl border border-[#D7E2D9] bg-white pr-10 pl-4 text-sm outline-none focus:border-brand"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setNewestFirst((v) => !v)}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-bold",
            newestFirst
              ? "bg-brand text-white"
              : "bg-white text-brand border border-[#D7E2D9]"
          )}
        >
          {newestFirst ? "جدیدترین" : "قدیمی‌ترین"}
        </button>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-full border border-[#D7E2D9] bg-white px-3 py-1.5 text-xs font-bold text-brand"
        >
          <option value="همه">دسته‌بندی</option>
          {MAGAZINE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-[1.5rem] bg-white p-6 text-center text-sm text-muted-foreground">
          مقاله‌ای پیدا نشد.
        </p>
      ) : (
        <div className="space-y-4">
          {filtered.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              hrefBase={hrefBase}
            />
          ))}
        </div>
      )}
    </div>
  );
}

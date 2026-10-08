import Image from "next/image";
import Link from "next/link";
import { Eye } from "lucide-react";
import type { MagazineArticle } from "@/lib/types";
import { cn } from "@/lib/utils";

function faNum(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}

export function ArticleCard({
  article,
  hrefBase = "/magazine",
  compact = false,
}: {
  article: MagazineArticle;
  hrefBase?: string;
  compact?: boolean;
}) {
  return (
    <article
      className={cn(
        "overflow-hidden rounded-[1.5rem] bg-white shadow-[0_8px_24px_rgba(20,53,42,0.08)]",
        compact && "rounded-[1.25rem]"
      )}
    >
      <Link href={`${hrefBase}/${article.slug}`} className="block">
        <div className={cn("relative", compact ? "aspect-[16/10]" : "aspect-[16/9]")}>
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            className="object-cover"
            sizes={compact ? "400px" : "(max-width:768px) 100vw, 33vw"}
          />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
            {article.category}
          </span>
        </div>
      </Link>
      <div className={cn(compact ? "space-y-2 p-3.5" : "space-y-2.5 p-4")}>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Eye className="size-3.5" />
          {faNum(article.views)} بازدید
        </p>
        <h3
          className={cn(
            "font-extrabold leading-7 text-[#14352A]",
            compact ? "text-sm" : "text-base"
          )}
        >
          <Link href={`${hrefBase}/${article.slug}`}>{article.title}</Link>
        </h3>
        <p
          className={cn(
            "leading-7 text-[#1A2E26]/65",
            compact ? "line-clamp-2 text-xs" : "line-clamp-3 text-sm"
          )}
        >
          {article.excerpt}
        </p>
        <Link
          href={`${hrefBase}/${article.slug}`}
          className="inline-flex text-sm font-bold text-[#2F6B4F] hover:underline"
        >
          بیشتر بخوانید
        </Link>
      </div>
    </article>
  );
}

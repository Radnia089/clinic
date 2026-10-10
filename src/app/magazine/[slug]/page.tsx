import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import { ArticleInstagramCta } from "@/components/magazine/article-instagram-cta";
import { articleParagraphs } from "@/lib/magazine";
import {
  TANDIS_INSTAGRAM_HANDLE,
  TANDIS_INSTAGRAM_URL,
} from "@/lib/social-links";
import {
  getArticleBySlug,
  incrementArticleViews,
  listArticles,
} from "@/lib/store";

export const dynamic = "force-dynamic";

function faNum(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || !article.published) {
    return { title: "مقاله یافت نشد | مجله تندیس یزد" };
  }
  const title = `${article.title} | کلینیک لاغری تندیس یزد`;
  const description = `${article.excerpt} مشاوره تغذیه و رژیم درمانی در کلینیک تندیس یزد · اینستاگرام @${TANDIS_INSTAGRAM_HANDLE}`;
  return {
    title,
    description,
    keywords: [
      "کلینیک لاغری تندیس",
      "رژیم درمانی یزد",
      "لاغری یزد",
      "مشاوره تغذیه یزد",
      article.category,
      TANDIS_INSTAGRAM_HANDLE,
    ],
    alternates: {
      canonical: `/magazine/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [{ url: article.coverImage }],
      type: "article",
      locale: "fa_IR",
      siteName: "کلینیک لاغری تندیس یزد",
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.coverImage],
    },
  };
}

export default async function MagazineArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || !article.published) notFound();

  await incrementArticleViews(slug);
  const views = article.views + 1;
  const paragraphs = articleParagraphs(article.body);
  const related = (await listArticles({ publishedOnly: true }))
    .filter((item) => item.id !== article.id)
    .slice(0, 2);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: [article.coverImage],
    datePublished: article.createdAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Organization",
      name: "کلینیک تخصصی لاغری و رژیم درمانی تندیس",
      url: "https://www.instagram.com/tandis_clinic_yazd/",
    },
    publisher: {
      "@type": "Organization",
      name: "کلینیک تندیس یزد",
      logo: {
        "@type": "ImageObject",
        url: "/tandis-logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `/magazine/${article.slug}`,
    },
    about: [
      "لاغری",
      "رژیم درمانی",
      "یزد",
      article.category,
    ],
    sameAs: [TANDIS_INSTAGRAM_URL],
  };

  return (
    <div className="min-h-screen bg-[#F6F8F5]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="border-b border-[#1A2E26]/08 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/magazine" className="text-sm font-medium text-brand">
            بازگشت به مجله
          </Link>
          <Link href="/" className="text-sm text-muted-foreground">
            صفحه اصلی
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <article>
          <p className="text-xs font-bold text-[#C48A12]">{article.category}</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-[#14352A] sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Eye className="size-4" />
            {faNum(views)} بازدید
          </p>

          <div className="relative mt-6 aspect-[16/9] overflow-hidden rounded-[1.75rem]">
            <Image
              src={article.coverImage}
              alt={`${article.title} — کلینیک لاغری تندیس یزد`}
              fill
              className="object-cover"
              sizes="(max-width:768px) 100vw, 768px"
              priority
            />
          </div>

          <p className="mt-6 text-base leading-8 text-[#1A2E26]/75">
            {article.excerpt}
          </p>

          <div className="mt-6 space-y-5 text-sm leading-8 text-[#1A2E26]/80 sm:text-base">
            {paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>

          <ArticleInstagramCta />

          <div className="mt-6 rounded-[1.5rem] bg-[#E8F2EA] p-5">
            <p className="text-sm font-bold text-brand">
              آماده شروع مسیر لاغری در تندیس هستید؟
            </p>
            <p className="mt-2 text-sm leading-7 text-[#1A2E26]/70">
              کلینیک تخصصی لاغری و رژیم درمانی تندیس یزد — نوبت حضوری یا مشاوره
              آنلاین بگیرید.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/patient/book"
                className="inline-flex h-11 items-center rounded-full bg-[#14352A] px-5 text-sm font-bold text-white"
              >
                رزرو نوبت حضوری
              </Link>
              <Link
                href="/patient/consult"
                className="inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-bold text-[#14352A]"
              >
                مشاوره آنلاین
              </Link>
            </div>
          </div>
        </article>

        {related.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-xl font-extrabold text-[#14352A]">مقالات مرتبط</h2>
            <ul className="mt-4 space-y-3">
              {related.map((item) => (
                <li key={item.id}>
                  <Link
                    href={`/magazine/${item.slug}`}
                    className="block rounded-2xl bg-white px-4 py-3 text-sm font-bold text-brand shadow-sm hover:bg-[#F7F8F6]"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}

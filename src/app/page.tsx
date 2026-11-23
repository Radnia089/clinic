import type { Metadata } from "next";
import { NutrishaLanding } from "@/components/landing/nutrisha-landing";
import { absoluteUrl, clinicJsonLd, HOME_DESCRIPTION, HOME_TITLE, jsonLdScript, shareMetadata } from "@/lib/site-seo";
import { getAppData, listArticles, listChampions, listPromoBanners } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  ...shareMetadata(HOME_TITLE, HOME_DESCRIPTION, "/"),
};

export default async function HomePage() {
  const [{ clinic }, champions, banners, articles] = await Promise.all([
    getAppData(),
    listChampions({ publishedOnly: true }),
    listPromoBanners({ publishedOnly: true }),
    listArticles({ publishedOnly: true }),
  ]);
  const articleList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "مجله لاغری و رژیم درمانی تندیس یزد",
    itemListElement: articles.map((article, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: article.title,
      url: absoluteUrl(`/magazine/${article.slug}`),
    })),
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(clinicJsonLd(clinic)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(articleList) }}
      />
      <NutrishaLanding
        clinic={clinic}
        champions={champions}
        banners={banners}
        articles={articles}
      />
    </>
  );
}

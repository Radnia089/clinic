import type { Metadata } from "next";
import { NutrishaLanding } from "@/components/landing/nutrisha-landing";
import { getAppData, listChampions, listPromoBanners } from "@/lib/store";
import {
  clinicJsonLd,
  HOME_DESCRIPTION,
  HOME_TITLE,
  jsonLdScript,
  shareMetadata,
} from "@/lib/site-seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  ...shareMetadata(HOME_TITLE, HOME_DESCRIPTION, "/"),
};

export default async function HomePage() {
  const [{ clinic }, champions, banners] = await Promise.all([
    getAppData(),
    listChampions({ publishedOnly: true }),
    listPromoBanners({ publishedOnly: true }),
  ]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(clinicJsonLd(clinic)) }}
      />
      <NutrishaLanding clinic={clinic} champions={champions} banners={banners} />
    </>
  );
}

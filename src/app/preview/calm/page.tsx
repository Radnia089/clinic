import type { Metadata } from "next";
import { SampleCalm } from "@/components/landing/sample-calm";
import { getAppData, listChampions, listPromoBanners } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function CalmPreviewPage() {
  const [{ clinic }, champions, banners] = await Promise.all([
    getAppData(),
    listChampions({ publishedOnly: true }),
    listPromoBanners({ publishedOnly: true }),
  ]);
  return <SampleCalm clinic={clinic} champions={champions} banners={banners} />;
}

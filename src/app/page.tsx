import { NutrishaLanding } from "@/components/landing/nutrisha-landing";
import { getAppData, listChampions, listPromoBanners } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ clinic }, champions, banners] = await Promise.all([
    getAppData(),
    listChampions({ publishedOnly: true }),
    listPromoBanners({ publishedOnly: true }),
  ]);
  return <NutrishaLanding clinic={clinic} champions={champions} banners={banners} />;
}

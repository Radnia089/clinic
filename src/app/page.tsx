import { ClinicLanding } from "@/components/landing/clinic-landing";
import {
  getAppData,
  listArticles,
  listChampions,
  listPromoBanners,
} from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ clinic }, champions, articles, promoBanners] = await Promise.all([
    getAppData(),
    listChampions({ publishedOnly: true }),
    listArticles({ publishedOnly: true }),
    listPromoBanners({ publishedOnly: true }),
  ]);

  return (
    <ClinicLanding
      phone={clinic.phone}
      address={clinic.address}
      hours={clinic.hours}
      champions={champions}
      articles={articles}
      promoBanners={promoBanners}
    />
  );
}

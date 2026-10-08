import { ClinicLanding } from "@/components/landing/clinic-landing";
import { getAppData, listArticles, listChampions } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ clinic }, champions, articles] = await Promise.all([
    getAppData(),
    listChampions({ publishedOnly: true }),
    listArticles({ publishedOnly: true }),
  ]);

  return (
    <ClinicLanding
      phone={clinic.phone}
      address={clinic.address}
      hours={clinic.hours}
      champions={champions}
      articles={articles}
    />
  );
}

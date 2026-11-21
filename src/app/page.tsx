import { NutrishaLanding } from "@/components/landing/nutrisha-landing";
import { getAppData, listChampions } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [{ clinic }, champions] = await Promise.all([
    getAppData(),
    listChampions({ publishedOnly: true }),
  ]);
  return <NutrishaLanding clinic={clinic} champions={champions} />;
}

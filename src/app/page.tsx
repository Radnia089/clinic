import { NutrishaLanding } from "@/components/landing/nutrisha-landing";
import { getAppData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { clinic } = await getAppData();
  return <NutrishaLanding clinic={clinic} />;
}

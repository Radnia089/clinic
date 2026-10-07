import { ClinicLanding } from "@/components/landing/clinic-landing";
import { getAppData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { clinic } = await getAppData();

  return (
    <ClinicLanding
      phone={clinic.phone}
      address={clinic.address}
      hours={clinic.hours}
    />
  );
}

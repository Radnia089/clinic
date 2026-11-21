import { NutrishaLanding } from "@/components/landing/nutrisha-landing";
import { SampleFrame } from "@/components/landing/sample-frame";
import type { Champion, ClinicProfile, PromoBanner } from "@/lib/types";

export function SampleCalm({
  clinic,
  champions,
  banners,
}: {
  clinic: ClinicProfile;
  champions: Champion[];
  banners: PromoBanner[];
}) {
  return (
    <SampleFrame active="calm">
      <NutrishaLanding clinic={clinic} champions={champions} banners={banners} />
    </SampleFrame>
  );
}

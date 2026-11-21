import { NutrishaLanding } from "@/components/landing/nutrisha-landing";
import { SampleFrame } from "@/components/landing/sample-frame";
import type { Champion, ClinicProfile } from "@/lib/types";

export function SampleCalm({
  clinic,
  champions,
}: {
  clinic: ClinicProfile;
  champions: Champion[];
}) {
  return (
    <SampleFrame active="calm">
      <NutrishaLanding clinic={clinic} champions={champions} />
    </SampleFrame>
  );
}

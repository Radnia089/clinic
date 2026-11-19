import { NutrishaLanding } from "@/components/landing/nutrisha-landing";
import { SampleFrame } from "@/components/landing/sample-frame";
import type { ClinicProfile } from "@/lib/types";

export function SampleCalm({ clinic }: { clinic: ClinicProfile }) {
  return (
    <SampleFrame active="calm">
      <NutrishaLanding clinic={clinic} />
    </SampleFrame>
  );
}

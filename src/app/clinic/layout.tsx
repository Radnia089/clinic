import { ClinicShell } from "@/components/clinic/clinic-shell";
import { getAppData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getAppData();
  return <ClinicShell version={data.clinic.version}>{children}</ClinicShell>;
}

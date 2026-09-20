import { ClinicShell } from "@/components/clinic/clinic-shell";
import { getCurrentUser } from "@/lib/auth";
import { getAppData } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ClinicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, user] = await Promise.all([getAppData(), getCurrentUser()]);
  return (
    <ClinicShell version={data.clinic.version} userName={user?.name}>
      {children}
    </ClinicShell>
  );
}

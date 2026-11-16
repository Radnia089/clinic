import { AppSignupsPanel } from "@/components/clinic/app-signups-panel";
import { requireStaffPage } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppSignupsPage() {
  await requireStaffPage();
  return <AppSignupsPanel />;
}

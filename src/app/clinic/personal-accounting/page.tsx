import { redirect } from "next/navigation";
import { PersonalLedgerPanel } from "@/components/clinic/personal-ledger-panel";
import { PageHeader } from "@/components/clinic/page-header";
import { getCurrentUser } from "@/lib/auth";
import { listPersonalLedger } from "@/lib/store";

export default async function PersonalAccountingPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "management") {
    redirect("/clinic");
  }

  const entries = await listPersonalLedger();

  return (
    <div>
      <PageHeader
        eyebrow="فقط مدیر"
        title="حسابداری شخصی"
        description="دفتر ساده درآمد و هزینه شخصی مدیر کلینیک — مانده، هزینه ماه و گردش مالی."
      />
      <PersonalLedgerPanel initialEntries={entries} />
    </div>
  );
}

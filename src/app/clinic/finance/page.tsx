import { FinancePanel } from "@/components/clinic/finance-panel";
import { PageHeader } from "@/components/clinic/page-header";
import { listPatients, listPayments } from "@/lib/store";
import { formatMoney } from "@/lib/types";

export default async function FinancePage() {
  const [payments, patients] = await Promise.all([listPayments(), listPatients()]);
  const patientMap = Object.fromEntries(patients.map((p) => [p.id, p]));
  const rows = payments.map((payment) => ({
    ...payment,
    patient: patientMap[payment.patientId] ?? null,
  }));

  const revenue = payments
    .filter((p) => p.status === "paid" || p.status === "partial")
    .reduce((sum, p) => sum + p.paidAmount, 0);

  return (
    <div>
      <PageHeader
        title="بخش مالی"
        description={`ثبت و پیگیری پرداختی‌های خدمات کلینیک. مجموع دریافت‌شده: ${formatMoney(revenue)}`}
      />
      <FinancePanel initialPayments={rows} />
    </div>
  );
}

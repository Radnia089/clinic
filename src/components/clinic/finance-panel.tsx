"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState, StatusBadge } from "@/components/clinic/page-header";
import {
  formatDateFa,
  formatMoney,
  patientFullName,
  paymentMethodLabel,
  paymentStatusLabel,
  type Patient,
  type Payment,
  type PaymentMethod,
} from "@/lib/types";

type PaymentRow = Payment & { patient: Patient | null };

export function FinancePanel({ initialPayments }: { initialPayments: PaymentRow[] }) {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [payments, setPayments] = useState(initialPayments);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [patientId, setPatientId] = useState("");
  const [title, setTitle] = useState("ویزیت رژیم درمانی");
  const [amount, setAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [note, setNote] = useState("");

  useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  useEffect(() => {
    fetch("/api/patients")
      .then((r) => r.json())
      .then((data) => {
        setPatients(data.patients ?? []);
        if (data.patients?.[0]) setPatientId(data.patients[0].id);
      })
      .catch(() => undefined);
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          title,
          amount: Number(amount),
          paidAmount: Number(paidAmount || 0),
          method,
          note,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setTitle("ویزیت رژیم درمانی");
      setAmount("");
      setPaidAmount("");
      setNote("");
      router.refresh();
    } catch {
      setError("ثبت پرداخت انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-3xl border border-border/80 bg-card/90 p-5 shadow-sm sm:grid-cols-2 sm:p-8"
      >
        <h3 className="sm:col-span-2 text-lg font-semibold text-brand">ثبت پرداخت جدید</h3>
        <div className="space-y-2 sm:col-span-2">
          <Label>مشتری</Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-transparent px-3"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          >
            {patients.length === 0 ? (
              <option value="">ابتدا مشتری ثبت کنید</option>
            ) : (
              patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {patientFullName(p)} — {p.phone}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="space-y-2">
          <Label>عنوان خدمت / پرداخت</Label>
          <Input
            className="h-11 rounded-xl"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>روش پرداخت</Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-transparent px-3"
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
          >
            <option value="cash">نقدی</option>
            <option value="card">کارتخوان</option>
            <option value="transfer">واریز</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>مبلغ کل (تومان)</Label>
          <Input
            type="number"
            className="h-11 rounded-xl"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>مبلغ پرداخت‌شده</Label>
          <Input
            type="number"
            className="h-11 rounded-xl"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label>یادداشت</Label>
          <Input
            className="h-11 rounded-xl"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        {error ? <p className="sm:col-span-2 text-sm text-destructive">{error}</p> : null}
        <Button
          type="submit"
          disabled={loading || !patientId}
          className="h-11 rounded-xl bg-cta text-cta-foreground hover:bg-cta/90 sm:col-span-2 sm:w-fit sm:px-8"
        >
          {loading ? "در حال ثبت..." : "ثبت در بخش مالی"}
        </Button>
      </form>

      {payments.length === 0 ? (
        <EmptyState title="پرداختی ثبت نشده" hint="اولین تراکنش مالی را از فرم بالا اضافه کنید." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">مشتری</TableHead>
                <TableHead className="text-right">عنوان</TableHead>
                <TableHead className="text-right">مبلغ</TableHead>
                <TableHead className="text-right">پرداخت‌شده</TableHead>
                <TableHead className="text-right">روش</TableHead>
                <TableHead className="text-right">وضعیت</TableHead>
                <TableHead className="text-right">تاریخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    {payment.patient ? patientFullName(payment.patient) : "—"}
                  </TableCell>
                  <TableCell>{payment.title}</TableCell>
                  <TableCell>{formatMoney(payment.amount)}</TableCell>
                  <TableCell>{formatMoney(payment.paidAmount)}</TableCell>
                  <TableCell>{paymentMethodLabel(payment.method)}</TableCell>
                  <TableCell>
                    <StatusBadge
                      tone={
                        payment.status === "paid"
                          ? "success"
                          : payment.status === "partial"
                            ? "warning"
                            : "info"
                      }
                    >
                      {paymentStatusLabel(payment.status)}
                    </StatusBadge>
                  </TableCell>
                  <TableCell>{formatDateFa(payment.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

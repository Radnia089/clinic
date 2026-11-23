"use client";

import { useEffect, useState } from "react";
import { PaymentEntryForm } from "@/components/clinic/payment-entry-form";
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
} from "@/lib/types";

type PaymentRow = Payment & { patient: Patient | null };

export function FinancePanel({
  initialPayments,
  patients,
}: {
  initialPayments: PaymentRow[];
  patients: Patient[];
}) {
  const [payments, setPayments] = useState(initialPayments);

  useEffect(() => {
    setPayments(initialPayments);
  }, [initialPayments]);

  return (
    <div className="space-y-8">
      <PaymentEntryForm patients={patients} />

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
                  <TableCell>{formatMoney(payment.paidAmount)}</TableCell>
                  <TableCell>
                    {paymentMethodLabel(payment.method)}
                    {payment.method === "check" && payment.checkDate
                      ? ` · ${formatDateFa(payment.checkDate)}`
                      : ""}
                  </TableCell>
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

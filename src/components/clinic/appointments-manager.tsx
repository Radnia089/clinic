"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState, StatusBadge } from "@/components/clinic/page-header";
import { formatDateFa, type AppointmentRequest } from "@/lib/types";

export function AppointmentsManager({
  initialAppointments,
}: {
  initialAppointments: AppointmentRequest[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialAppointments);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateStatus(id: string, status: AppointmentRequest["status"]) {
    setBusyId(id);
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("failed");
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
      router.refresh();
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return <EmptyState title="نوبت آنلاینی ثبت نشده" hint="درخواست‌های اپ مشتری اینجا دیده می‌شوند." />;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">نام</TableHead>
            <TableHead className="text-right">موبایل</TableHead>
            <TableHead className="text-right">خدمت</TableHead>
            <TableHead className="text-right">تاریخ پیشنهادی</TableHead>
            <TableHead className="text-right">وضعیت</TableHead>
            <TableHead className="text-right">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell dir="ltr" className="text-left">
                {item.phone}
              </TableCell>
              <TableCell>{item.service}</TableCell>
              <TableCell>
                {item.preferredDate ? formatDateFa(item.preferredDate) : "—"}
              </TableCell>
              <TableCell>
                <StatusBadge
                  tone={
                    item.status === "confirmed"
                      ? "success"
                      : item.status === "rejected"
                        ? "danger"
                        : "warning"
                  }
                >
                  {item.status === "new"
                    ? "جدید"
                    : item.status === "confirmed"
                      ? "تأیید شده"
                      : "رد شده"}
                </StatusBadge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    className="rounded-lg"
                    disabled={busyId === item.id || item.status === "confirmed"}
                    onClick={() => updateStatus(item.id, "confirmed")}
                  >
                    تأیید
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-lg"
                    disabled={busyId === item.id || item.status === "rejected"}
                    onClick={() => updateStatus(item.id, "rejected")}
                  >
                    رد
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

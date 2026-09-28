"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, X } from "lucide-react";
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
  visitChannelLabel,
  type AppointmentRequest,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppointmentsManager({
  initialAppointments,
}: {
  initialAppointments: AppointmentRequest[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialAppointments);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function updateStatus(id: string, status: AppointmentRequest["status"]) {
    const current = items.find((i) => i.id === id);
    if (!current) return;
    // دوباره زدن همان وضعیت → برگردد به جدید
    const next = current.status === status ? "new" : status;
    setBusyId(id);
    const previous = items;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: next } : item)));
    try {
      const res = await fetch("/api/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: next }),
      });
      if (!res.ok) throw new Error("failed");
      router.refresh();
    } catch {
      setItems(previous);
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="نوبت آنلاینی / تلفنی ثبت نشده"
        hint="درخواست‌های تلفنی و اپ مشتری اینجا دیده می‌شوند."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">نام</TableHead>
            <TableHead className="text-right">موبایل</TableHead>
            <TableHead className="text-right">خدمت</TableHead>
            <TableHead className="text-right">نوع</TableHead>
            <TableHead className="text-right">تاریخ پیشنهادی</TableHead>
            <TableHead className="text-right">وضعیت</TableHead>
            <TableHead className="text-right">مراجعه</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const confirmed = item.status === "confirmed";
            const rejected = item.status === "rejected";
            return (
              <TableRow key={item.id} className={busyId === item.id ? "opacity-60" : undefined}>
                <TableCell className="font-medium">
                  <span className="inline-flex items-center gap-2">
                    {confirmed ? (
                      <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#2F9E5A] text-white">
                        <Check className="size-3.5 stroke-[3]" />
                      </span>
                    ) : null}
                    {rejected ? (
                      <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#C45C5C] text-white">
                        <X className="size-3.5 stroke-[3]" />
                      </span>
                    ) : null}
                    {item.name}
                  </span>
                </TableCell>
                <TableCell dir="ltr" className="text-left">
                  {item.phone}
                </TableCell>
                <TableCell>{item.service}</TableCell>
                <TableCell>
                  <StatusBadge
                    tone={(item.channel ?? "clinic") === "clinic" ? "info" : "warning"}
                  >
                    {visitChannelLabel(item.channel ?? "clinic")}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  {item.preferredDate ? (
                    <>
                      {formatDateFa(item.preferredDate)}
                      {item.preferredTime ? ` • ${item.preferredTime}` : ""}
                    </>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    tone={
                      confirmed ? "success" : rejected ? "danger" : "warning"
                    }
                  >
                    {item.status === "new"
                      ? "در انتظار"
                      : confirmed
                        ? "مراجعه کرد / تأیید"
                        : "نیامد / رد"}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      title="مراجعه کرد"
                      disabled={busyId === item.id}
                      className={cn(
                        "inline-flex h-8 items-center gap-1 rounded-xl px-2.5 text-[11px] font-bold transition",
                        confirmed
                          ? "bg-[#2F9E5A] text-white"
                          : "bg-white text-[#2F9E5A] ring-1 ring-[#2F9E5A]/35 hover:bg-[#2F9E5A] hover:text-white"
                      )}
                      onClick={() => updateStatus(item.id, "confirmed")}
                    >
                      <Check className="size-3.5 stroke-[3]" />
                      مراجعه کرد
                    </button>
                    <button
                      type="button"
                      title="نیامد / لغو"
                      disabled={busyId === item.id}
                      className={cn(
                        "inline-flex h-8 items-center gap-1 rounded-xl px-2.5 text-[11px] font-bold transition",
                        rejected
                          ? "bg-[#C45C5C] text-white"
                          : "bg-white text-[#C45C5C] ring-1 ring-[#C45C5C]/35 hover:bg-[#C45C5C] hover:text-white"
                      )}
                      onClick={() => updateStatus(item.id, "rejected")}
                    >
                      <X className="size-3.5 stroke-[3]" />
                      نیامد
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

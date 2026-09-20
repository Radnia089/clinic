"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AttendanceButtons,
  AttendanceMark,
} from "@/components/clinic/attendance-buttons";
import {
  formatDateFa,
  formatMoney,
  genderLabel,
  patientFullName,
  visitChannelLabel,
  visitStatusLabel,
  visitTypeLabel,
  type Patient,
  type ProgressMeasurement,
  type Payment,
  type Visit,
  type VisitStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function CustomerFileClient({
  patient,
  initialVisits,
  measurements,
  payments,
}: {
  patient: Patient;
  initialVisits: Visit[];
  measurements: ProgressMeasurement[];
  payments: Payment[];
}) {
  const router = useRouter();
  const [visits, setVisits] = useState(initialVisits);

  async function setAttendance(visitId: string, status: VisitStatus) {
    const current = visits.find((v) => v.id === visitId);
    if (!current) return;
    const next = current.status === status ? "visitor" : status;
    const previous = visits;
    setVisits((list) =>
      list.map((v) => (v.id === visitId ? { ...v, status: next } : v))
    );
    try {
      const res = await fetch("/api/visits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: visitId, status: next }),
      });
      if (!res.ok) throw new Error("fail");
      router.refresh();
    } catch {
      setVisits(previous);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">پرونده مشتری</p>
          <h1 className="mt-1 text-2xl font-extrabold text-brand">
            {patientFullName(patient)}
          </h1>
        </div>
        <Link href="/clinic/reception/customers" className="text-sm font-medium text-brand">
          بازگشت به لیست
        </Link>
      </div>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
        <h2 className="text-sm font-bold text-brand">اطلاعات عمومی</h2>
        <dl className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#F7F8F6] px-3 py-2">
            <dt className="text-[11px] text-muted-foreground">موبایل</dt>
            <dd className="mt-1 text-sm font-medium" dir="ltr">
              {patient.phone}
            </dd>
          </div>
          <div className="rounded-2xl bg-[#F7F8F6] px-3 py-2">
            <dt className="text-[11px] text-muted-foreground">سن / جنسیت</dt>
            <dd className="mt-1 text-sm font-medium">
              {patient.age != null ? patient.age : "—"} · {genderLabel(patient.gender)}
            </dd>
          </div>
          <div className="rounded-2xl bg-[#F7F8F6] px-3 py-2 sm:col-span-2">
            <dt className="text-[11px] text-muted-foreground">آدرس</dt>
            <dd className="mt-1 text-sm font-medium">{patient.address || "—"}</dd>
          </div>
          {patient.notes ? (
            <div className="rounded-2xl bg-[#F7F8F6] px-3 py-2 sm:col-span-2">
              <dt className="text-[11px] text-muted-foreground">یادداشت</dt>
              <dd className="mt-1 text-sm font-medium">{patient.notes}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
        <h2 className="text-sm font-bold text-brand">مراجعات (ویزیت / تلفنی)</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          تیک سبز = مراجعه کرد · ضربدر قرمز = نیامد / لغو
        </p>
        {visits.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">مراجعه‌ای ثبت نشده.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {visits.map((visit) => (
              <li
                key={visit.id}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-3 rounded-2xl px-3 py-3 text-sm",
                  visit.status === "cancelled"
                    ? "bg-[#F3F3F3]"
                    : visit.status === "completed" || visit.status === "admitted"
                      ? "bg-[#F2FBF4]"
                      : "bg-[#F7F8F6]"
                )}
              >
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    <AttendanceMark status={visit.status} />
                    {visitTypeLabel(visit.visitType)} · {visitChannelLabel(visit.channel)} ·{" "}
                    {visitStatusLabel(visit.status)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateFa(visit.visitDate)}
                    {visit.visitTime ? ` · ${visit.visitTime}` : ""}
                    {visit.packageName ? ` · ${visit.packageName}` : ""}
                  </p>
                </div>
                <AttendanceButtons
                  status={visit.status}
                  withLabels
                  onChange={(status) => setAttendance(visit.id, status)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
        <h2 className="text-sm font-bold text-brand">اندازه‌گیری‌ها</h2>
        {measurements.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">اندازه‌گیری ثبت نشده.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {[...measurements].reverse().map((m) => (
              <li key={m.id} className="rounded-2xl bg-[#F7F8F6] px-3 py-3 text-sm">
                <p className="font-semibold">{formatDateFa(m.recordedAt)}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  وزن {m.weightKg} کیلو · کمر {m.waistCm} سم
                  {m.hipCm ? ` · باسن ${m.hipCm} سم` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
        <h2 className="text-sm font-bold text-brand">پرداخت‌ها</h2>
        {payments.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">پرداختی ثبت نشده.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {payments.map((p) => (
              <li key={p.id} className="rounded-2xl bg-[#F7F8F6] px-3 py-3 text-sm">
                <p className="font-semibold">{p.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatMoney(p.paidAmount)} از {formatMoney(p.amount)} ·{" "}
                  {formatDateFa(p.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

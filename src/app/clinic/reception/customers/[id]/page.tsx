import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getPatient,
  listMeasurements,
  listPayments,
  listVisits,
} from "@/lib/store";
import {
  formatDateFa,
  formatMoney,
  genderLabel,
  patientFullName,
  visitStatusLabel,
  visitTypeLabel,
} from "@/lib/types";

export default async function CustomerFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const patient = await getPatient(id);
  if (!patient) notFound();

  const [visits, measurements, payments] = await Promise.all([
    listVisits(),
    listMeasurements(id),
    listPayments(),
  ]);

  const patientVisits = visits.filter((v) => v.patientId === id);
  const patientPayments = payments.filter((p) => p.patientId === id);

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
        <h2 className="text-sm font-bold text-brand">مراجعات</h2>
        {patientVisits.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">مراجعه‌ای ثبت نشده.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {patientVisits.map((visit) => (
              <li key={visit.id} className="rounded-2xl bg-[#F7F8F6] px-3 py-3 text-sm">
                <p className="font-semibold">
                  {visitTypeLabel(visit.visitType)} · {visitStatusLabel(visit.status)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateFa(visit.visitDate)}
                  {visit.packageName ? ` · ${visit.packageName}` : ""}
                </p>
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
        {patientPayments.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">پرداختی ثبت نشده.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {patientPayments.map((p) => (
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

"use client";

import { useEffect, useState } from "react";
import { TrendChart } from "@/components/patient/trend-chart";
import {
  formatDateFa,
  type Patient,
  type ProgressMeasurement,
} from "@/lib/types";

export function PatientProgressScreen() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [measurements, setMeasurements] = useState<ProgressMeasurement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patient-auth/me")
      .then(async (r) => {
        if (r.status === 401) {
          window.location.href = "/patient/login";
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        setPatient(data.patient ?? null);
        setMeasurements(data.measurements ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const first = measurements[0];
  const last = measurements[measurements.length - 1];

  return (
    <div className="space-y-4 px-4 pb-28 pt-5">
      <header>
        <p className="text-xs font-medium text-muted-foreground">پیشرفت مسیر</p>
        <h1 className="mt-1 text-2xl font-extrabold text-brand">نمودار رشد من</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          هر بار که در پرونده مشتری کلینیک وزن و سایز ثبت شود، همین‌جا به‌روز
          می‌شود.
        </p>
      </header>

      {loading ? (
        <div className="rounded-3xl bg-white p-8 text-center text-sm text-muted-foreground">
          در حال بارگذاری...
        </div>
      ) : (
        <>
          {first && last ? (
            <section className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-[#E8F2EA] p-4">
                <p className="text-xs text-muted-foreground">کاهش وزن</p>
                <p className="mt-1 text-xl font-extrabold text-brand">
                  {new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(
                    Math.max(0, first.weightKg - last.weightKg)
                  )}{" "}
                  <span className="text-sm">کیلو</span>
                </p>
              </div>
              <div className="rounded-3xl bg-[#F6E6E1] p-4">
                <p className="text-xs text-[#9A4E42]/80">کاهش سایز کمر</p>
                <p className="mt-1 text-xl font-extrabold text-[#9A4E42]">
                  {new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(
                    Math.max(0, first.waistCm - last.waistCm)
                  )}{" "}
                  <span className="text-sm">cm</span>
                </p>
              </div>
            </section>
          ) : null}

          <section className="rounded-[28px] bg-white p-4 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
            <h2 className="mb-3 text-sm font-bold text-brand">نمودار وزن</h2>
            <TrendChart
              measurements={measurements}
              metric="weightKg"
              color="#2F6B4F"
              unit="kg"
            />
          </section>

          <section className="rounded-[28px] bg-white p-4 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
            <h2 className="mb-3 text-sm font-bold text-brand">نمودار سایز (دور کمر)</h2>
            <TrendChart
              measurements={measurements}
              metric="waistCm"
              color="#D86B5C"
              unit="cm"
            />
          </section>

          <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
            <div className="border-b border-black/5 px-4 py-3">
              <h2 className="text-sm font-bold text-brand">جدول اندازه‌گیری‌ها</h2>
              {patient ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {patient.firstName} {patient.lastName}
                </p>
              ) : null}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] text-sm">
                <thead className="bg-[#F3F6F3] text-xs text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-right font-medium">زمان</th>
                    <th className="px-4 py-3 text-right font-medium">وزن</th>
                    <th className="px-4 py-3 text-right font-medium">سایز کمر</th>
                  </tr>
                </thead>
                <tbody>
                  {[...measurements].reverse().map((row) => (
                    <tr key={row.id} className="border-t border-black/5">
                      <td className="px-4 py-3">{formatDateFa(row.recordedAt)}</td>
                      <td className="px-4 py-3">
                        {new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(
                          row.weightKg
                        )}{" "}
                        کیلو
                      </td>
                      <td className="px-4 py-3">
                        {new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 }).format(
                          row.waistCm
                        )}{" "}
                        سم
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
import { EmptyState } from "@/components/clinic/page-header";
import {
  formatDateFa,
  patientFullName,
  type Patient,
  type ProgressMeasurement,
} from "@/lib/types";
import { ShamsiDateInput } from "@/components/ui/shamsi-date-input";
import { DigitsInput } from "@/components/ui/digits-input";
import { jalaliPartsToIsoDate, todayJalaliParts } from "@/lib/jalali";

type Row = ProgressMeasurement & { patient: Patient | null };

export function ProgressRecorder() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [patientId, setPatientId] = useState("");
  const [recordedAt, setRecordedAt] = useState(() => jalaliPartsToIsoDate(todayJalaliParts()));
  const [weightKg, setWeightKg] = useState("");
  const [waistCm, setWaistCm] = useState("");
  const [hipCm, setHipCm] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const [patientsRes, measurementsRes] = await Promise.all([
      fetch("/api/patients"),
      fetch("/api/measurements"),
    ]);
    const patientsData = await patientsRes.json();
    const measurementsData = await measurementsRes.json();
    setPatients(patientsData.patients ?? []);
    setRows([...(measurementsData.measurements ?? [])].reverse());
    if (!patientId && patientsData.patients?.[0]) {
      setPatientId(patientsData.patients[0].id);
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          recordedAt: new Date(recordedAt).toISOString(),
          weightKg: Number(weightKg),
          waistCm: Number(waistCm),
          hipCm: hipCm ? Number(hipCm) : undefined,
          note,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setWeightKg("");
      setWaistCm("");
      setHipCm("");
      setNote("");
      await load();
      router.refresh();
    } catch {
      setError("ثبت اندازه‌گیری انجام نشد.");
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
        <h3 className="text-lg font-semibold text-brand sm:col-span-2">
          ثبت وزن و سایز جلسه
        </h3>
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
          <Label>تاریخ اندازه‌گیری (شمسی)</Label>
          <ShamsiDateInput value={recordedAt} onChange={setRecordedAt} required />
        </div>
        <div className="space-y-2">
          <Label>وزن (kg)</Label>
          <DigitsInput
            mode="decimal"
            className="h-11 rounded-xl"
            value={weightKg}
            onValueChange={setWeightKg}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>دور کمر (cm)</Label>
          <DigitsInput
            mode="decimal"
            className="h-11 rounded-xl"
            value={waistCm}
            onValueChange={setWaistCm}
            required
          />
        </div>
        <div className="space-y-2">
          <Label>دور باسن (اختیاری)</Label>
          <DigitsInput
            mode="decimal"
            className="h-11 rounded-xl"
            value={hipCm}
            onValueChange={setHipCm}
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
        {error ? <p className="text-sm text-destructive sm:col-span-2">{error}</p> : null}
        <Button
          type="submit"
          disabled={loading || !patientId}
          className="h-11 rounded-xl bg-cta text-cta-foreground hover:bg-cta/90 sm:col-span-2 sm:w-fit sm:px-8"
        >
          {loading ? "در حال ثبت..." : "ثبت در نمودار پیشرفت مشتری"}
        </Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState
          title="هنوز اندازه‌گیری ثبت نشده"
          hint="با هر مراجعه، وزن و سایز را اینجا وارد کنید تا در اپ مشتری نمایش داده شود."
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">مشتری</TableHead>
                <TableHead className="text-right">زمان</TableHead>
                <TableHead className="text-right">وزن</TableHead>
                <TableHead className="text-right">دور کمر</TableHead>
                <TableHead className="text-right">دور باسن</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {row.patient ? patientFullName(row.patient) : "—"}
                  </TableCell>
                  <TableCell>{formatDateFa(row.recordedAt)}</TableCell>
                  <TableCell>{row.weightKg} کیلو</TableCell>
                  <TableCell>{row.waistCm} سم</TableCell>
                  <TableCell>{row.hipCm ? `${row.hipCm} سم` : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

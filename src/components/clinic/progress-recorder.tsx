"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import {
  isVisitSessionAllowed,
  nextVisitSession,
  visitSessionChoices,
  visitSessionTitle,
} from "@/lib/visit-sessions";

type Row = ProgressMeasurement & { patient: Patient | null };

const paperFields = [
  ["heightCm", "قد (cm)"],
  ["bmi", "BMI"],
  ["bodyFatPct", "چربی بدن"],
  ["muscleMassKg", "توده عضلانی (kg)"],
  ["visceralFat", "چربی احشایی"],
  ["rmr", "سوخت‌وساز استراحت"],
  ["armRightCm", "بازو راست"],
  ["armLeftCm", "بازو چپ"],
  ["chestCm", "دور سینه"],
  ["waistCm", "دور شکم بالای ناف"],
  ["waistBelowCm", "دور شکم پایین ناف"],
  ["hipCm", "دور باسن"],
  ["thighRightCm", "ران راست"],
  ["thighLeftCm", "ران چپ"],
  ["kneeRightCm", "زانوی راست"],
  ["kneeLeftCm", "زانوی چپ"],
  ["calfRightCm", "ساق پای راست"],
  ["calfLeftCm", "ساق پای چپ"],
] as const;

type PaperKey = (typeof paperFields)[number][0];

const emptyPaper = Object.fromEntries(paperFields.map(([key]) => [key, ""])) as Record<PaperKey, string>;

function rowSummary(row: ProgressMeasurement) {
  const bits = [
    ["قد", row.heightCm],
    ["BMI", row.bmi],
    ["چربی", row.bodyFatPct],
    ["عضله", row.muscleMassKg],
    ["شکم بالا", row.waistCm],
    ["شکم پایین", row.waistBelowCm],
    ["باسن", row.hipCm],
  ].filter((item): item is [string, number] => typeof item[1] === "number");
  return bits.map(([label, value]) => `${label} ${value}`).join(" · ");
}

export function ProgressRecorder() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [patientId, setPatientId] = useState("");
  const [recordedAt, setRecordedAt] = useState(() => jalaliPartsToIsoDate(todayJalaliParts()));
  const [sessionPick, setSessionPick] = useState<string | null>(null);
  const [weightKg, setWeightKg] = useState("");
  const [paper, setPaper] = useState(emptyPaper);
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

  const patientLabels = useMemo(
    () => rows.filter((row) => row.patientId === patientId).map((row) => row.sessionLabel),
    [rows, patientId]
  );
  const nextSession = nextVisitSession(patientLabels);
  const sessionChoices = visitSessionChoices(nextSession);
  const sessionLabel =
    sessionPick && isVisitSessionAllowed(sessionPick, patientLabels)
      ? sessionPick
      : visitSessionTitle(nextSession);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const numbers = Object.fromEntries(
        paperFields.flatMap(([key]) => (paper[key] ? [[key, paper[key]]] : []))
      );
      const res = await fetch("/api/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          recordedAt: new Date(recordedAt).toISOString(),
          weightKg,
          sessionLabel: sessionLabel || undefined,
          ...numbers,
          note: note || undefined,
        }),
      });
      if (!res.ok) throw new Error("failed");
      setWeightKg("");
      setSessionPick(null);
      setPaper(emptyPaper);
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
          آنالیز بدن و سایز، مثل پرونده کاغذی
        </h3>
        <div className="space-y-2 sm:col-span-2">
          <Label>مشتری</Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-transparent px-3"
            value={patientId}
            onChange={(e) => {
              setPatientId(e.target.value);
              setSessionPick(null);
            }}
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
          <Label>جلسه</Label>
          <select
            className="h-11 w-full rounded-xl border border-input bg-transparent px-3"
            value={sessionChoices.includes(sessionLabel) ? sessionLabel : ""}
            onChange={(e) => setSessionPick(e.target.value)}
            required
            disabled={sessionChoices.length === 0}
          >
            {sessionChoices.map((title) => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
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
        {paperFields.map(([key, label]) => (
          <div key={key} className="space-y-2">
            <Label>{label}</Label>
            <DigitsInput
              mode="decimal"
              className="h-11 rounded-xl"
              value={paper[key]}
              onValueChange={(value) => setPaper((current) => ({ ...current, [key]: value }))}
            />
          </div>
        ))}
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
          hint="با هر مراجعه، آنالیز بدن و سایز را اینجا وارد کنید تا در پرونده و اپ مشتری بماند."
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">مشتری</TableHead>
                <TableHead className="text-right">زمان</TableHead>
                <TableHead className="text-right">جلسه</TableHead>
                <TableHead className="text-right">وزن</TableHead>
                <TableHead className="text-right">آنالیز و سایز</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    {row.patient ? patientFullName(row.patient) : "—"}
                  </TableCell>
                  <TableCell>{formatDateFa(row.recordedAt)}</TableCell>
                  <TableCell>{row.sessionLabel || "—"}</TableCell>
                  <TableCell>{row.weightKg} kg</TableCell>
                  <TableCell>{rowSummary(row) || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

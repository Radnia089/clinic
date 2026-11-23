"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShamsiDateInput } from "@/components/ui/shamsi-date-input";
import { normalizeIntegerInput } from "@/lib/digits";
import { jalaliPartsToIsoDate, todayJalaliParts } from "@/lib/jalali";
import { patientFullName, type Patient, type Payment } from "@/lib/types";
import { cn } from "@/lib/utils";

const fieldClass = "h-11 rounded-xl";

function groupDigits(value: string) {
  if (!value) return "";
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function GroupedAmountInput({
  value,
  onValueChange,
  required,
}: {
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      dir="ltr"
      required={required}
      className={cn(fieldClass, "text-left")}
      value={groupDigits(value)}
      onChange={(event) => {
        const el = event.target;
        const caret = el.selectionStart ?? el.value.length;
        const digitsBefore = normalizeIntegerInput(el.value.slice(0, caret)).length;
        const next = normalizeIntegerInput(el.value);
        onValueChange(next);
        const formatted = groupDigits(next);
        requestAnimationFrame(() => {
          const node = inputRef.current;
          if (!node) return;
          let seen = 0;
          let pos = formatted.length;
          for (let index = 0; index < formatted.length; index += 1) {
            if (/\d/.test(formatted[index] ?? "")) seen += 1;
            if (seen === digitsBefore) {
              pos = index + 1;
              break;
            }
          }
          node.setSelectionRange(pos, pos);
        });
      }}
    />
  );
}

function CustomerSearch({
  patients,
  patientId,
  onSelect,
}: {
  patients: Patient[];
  patientId: string;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = patients.find((patient) => patient.id === patientId) ?? null;
  const matches = useMemo(() => {
    const raw = query.trim().toLowerCase();
    const digits = normalizeIntegerInput(query);
    if (!raw) return [];
    return patients
      .filter((patient) => {
        const name = patientFullName(patient).toLowerCase();
        return (
          name.includes(raw) ||
          patient.phone.includes(digits || raw) ||
          (patient.nationalId ?? "").includes(digits)
        );
      })
      .slice(0, 8);
  }, [patients, query]);

  return (
    <div className="relative">
      <Input
        className={fieldClass}
        value={open || !selected ? query : `${patientFullName(selected)} — ${selected.phone}`}
        placeholder="نام یا موبایل مشتری را بنویسید"
        aria-label="جستجوی مشتری"
        autoComplete="off"
        required={!patientId}
        onFocus={() => {
          setOpen(true);
          setQuery("");
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          if (patientId) onSelect("");
        }}
        onBlur={() => {
          window.setTimeout(() => setOpen(false), 150);
        }}
      />
      {open && query.trim() ? (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-card shadow-lg">
          {matches.length === 0 ? (
            <li className="px-3 py-3 text-sm text-muted-foreground">مشتری پیدا نشد.</li>
          ) : (
            matches.map((patient) => (
              <li key={patient.id}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-right hover:bg-[#E8F2EA]"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onSelect(patient.id);
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-bold">{patientFullName(patient)}</span>
                    <span className="mt-0.5 block text-xs text-muted-foreground" dir="ltr">
                      {patient.phone}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-bold text-brand">انتخاب</span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}

export function PaymentEntryForm({
  patients = [],
  lockedPatient,
  heading = "ثبت پرداخت جدید",
  onCreated,
}: {
  patients?: Patient[];
  lockedPatient?: Patient;
  heading?: string;
  onCreated?: (payment: Payment) => void;
}) {
  const router = useRouter();
  const [patientId, setPatientId] = useState(lockedPatient?.id ?? "");
  const [title, setTitle] = useState("ویزیت رژیم درمانی");
  const [paidAmount, setPaidAmount] = useState("");
  const [method, setMethod] = useState<"cash" | "card" | "check">("cash");
  const [checkDate, setCheckDate] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function changeMethod(next: "cash" | "card" | "check") {
    setMethod(next);
    if (next === "check") {
      setCheckDate((current) => current || jalaliPartsToIsoDate(todayJalaliParts()));
      return;
    }
    setCheckDate("");
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const ownerId = lockedPatient?.id ?? patientId;
    if (!ownerId) {
      setError("یک مشتری را انتخاب کنید.");
      return;
    }
    if (method === "check" && !checkDate) {
      setError("تاریخ چک را انتخاب کنید.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: ownerId,
          title,
          paidAmount,
          method,
          note,
          checkDate: method === "check" ? checkDate : undefined,
        }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setTitle("ویزیت رژیم درمانی");
      setPaidAmount("");
      setNote("");
      setMethod("cash");
      setCheckDate("");
      if (!lockedPatient) setPatientId("");
      if (data.payment) onCreated?.(data.payment as Payment);
      router.refresh();
    } catch {
      setError("ثبت پرداخت انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-3xl border border-border/80 bg-card/90 p-5 shadow-sm sm:grid-cols-2 sm:p-8"
    >
      <h3 className="text-lg font-semibold text-brand sm:col-span-2">{heading}</h3>
      {lockedPatient ? (
        <div className="space-y-2 sm:col-span-2">
          <Label>مشتری</Label>
          <p className="rounded-xl bg-[#F7F8F6] px-3 py-3 text-sm font-bold text-brand">
            {patientFullName(lockedPatient)}
            <span className="mr-2 font-medium text-muted-foreground" dir="ltr">
              {lockedPatient.phone}
            </span>
          </p>
        </div>
      ) : (
        <div className="space-y-2 sm:col-span-2">
          <Label>مشتری</Label>
          <CustomerSearch patients={patients} patientId={patientId} onSelect={setPatientId} />
        </div>
      )}
      <div className="space-y-2">
        <Label>عنوان خدمت / پرداخت</Label>
        <Input className={fieldClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>روش پرداخت</Label>
        <select
          className="h-11 w-full rounded-xl border border-input bg-transparent px-3"
          value={method}
          onChange={(e) => changeMethod(e.target.value as "cash" | "card" | "check")}
        >
          <option value="cash">نقدی</option>
          <option value="card">کارتخوان</option>
          <option value="check">چک</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>مبلغ</Label>
        <div className="flex items-center gap-2">
          <GroupedAmountInput value={paidAmount} onValueChange={setPaidAmount} required />
          <span className="shrink-0 text-sm font-bold text-muted-foreground">تومان</span>
        </div>
      </div>
      <div className={cn("space-y-2 sm:col-span-2", method === "check" ? "" : "opacity-50")}>
        <Label>تاریخ چک</Label>
        <ShamsiDateInput
          value={checkDate}
          onChange={setCheckDate}
          disabled={method !== "check"}
          required={method === "check"}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label>یادداشت</Label>
        <Input className={fieldClass} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      {error ? <p className="text-sm text-destructive sm:col-span-2">{error}</p> : null}
      <Button
        type="submit"
        disabled={loading || !(lockedPatient || patientId)}
        className="h-11 rounded-xl bg-cta text-cta-foreground hover:bg-cta/90 sm:col-span-2 sm:w-fit sm:px-8"
      >
        {loading ? "در حال ثبت..." : "ثبت پرداخت"}
      </Button>
    </form>
  );
}

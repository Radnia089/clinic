"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft } from "lucide-react";
import {
  formatDateFa,
  genderLabel,
  patientFullName,
  type Patient,
} from "@/lib/types";

export function CustomersList({
  patients,
  canDelete = false,
}: {
  patients: Patient[];
  canDelete?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(patients);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function removePatient(patient: Patient) {
    const name = patientFullName(patient) || patient.phone;
    if (!confirm(`پروندهٔ ${name} با نوبت‌ها و اندازه‌ها حذف شود؟ این کار برنمی‌گردد.`)) {
      return;
    }
    setBusyId(patient.id);
    try {
      const res = await fetch(`/api/patients?id=${encodeURIComponent(patient.id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("failed");
      setItems((list) => list.filter((item) => item.id !== patient.id));
      router.refresh();
    } catch {
      window.alert("حذف مشتری انجام نشد.");
    } finally {
      setBusyId(null);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((p) => {
      const full = patientFullName(p).toLowerCase();
      return (
        full.includes(q) ||
        p.phone.includes(q) ||
        p.address.toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground">پذیرش</p>
          <h1 className="mt-1 text-2xl font-extrabold text-brand">لیست مشتریان</h1>
        </div>
        <Link href="/clinic/reception" className="text-sm font-medium text-brand">
          بازگشت به میز پذیرش
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="جستجو با نام، موبایل یا آدرس..."
          className="h-12 w-full rounded-2xl border border-[#D7E2D9] bg-white pr-11 pl-4 text-sm outline-none focus:border-brand focus:ring-3 focus:ring-brand/20"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[28px] bg-white px-6 py-14 text-center shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
          <p className="font-semibold text-brand">مشتری‌ای پیدا نشد</p>
          <p className="mt-2 text-sm text-muted-foreground">عبارت جستجو را عوض کنید.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((patient) => (
            <li
              key={patient.id}
              className="rounded-[24px] bg-white p-4 shadow-[0_6px_18px_rgba(35,70,55,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-extrabold text-brand">
                    {patientFullName(patient)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                    {patient.phone}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {patient.age != null ? `${patient.age} ساله · ` : ""}
                    {genderLabel(patient.gender)} · ثبت از{" "}
                    {formatDateFa(patient.createdAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Link
                    href={`/clinic/reception/new?patient=${patient.id}`}
                    className="inline-flex items-center justify-center rounded-2xl bg-[#D86B5C] px-3 py-2 text-xs font-bold text-white"
                  >
                    ثبت نوبت
                  </Link>
                  <Link
                    href={`/clinic/reception/customers/${patient.id}`}
                    className="inline-flex items-center gap-1 rounded-2xl bg-[#E8F2EA] px-3 py-2 text-xs font-bold text-brand"
                  >
                    پرونده
                    <ChevronLeft className="size-3.5" />
                  </Link>
                  {canDelete ? (
                    <button
                      type="button"
                      disabled={busyId === patient.id}
                      onClick={() => removePatient(patient)}
                      className="rounded-2xl px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
                    >
                      {busyId === patient.id ? "در حال حذف..." : "حذف"}
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

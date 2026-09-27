"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DigitsInput } from "@/components/ui/digits-input";
import { ShamsiDateInput } from "@/components/ui/shamsi-date-input";
import { jalaliPartsToIsoDate, todayJalaliParts, toJalaliParts } from "@/lib/jalali";
import { toFaNumber } from "@/lib/schedule";
import {
  formatDateFa,
  formatMoney,
  personalLedgerKindLabel,
  PERSONAL_EXPENSE_CATEGORIES,
  PERSONAL_INCOME_CATEGORIES,
  type PersonalLedgerEntry,
  type PersonalLedgerKind,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const fieldClass =
  "h-12 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6] px-3 text-base focus-visible:border-brand focus-visible:ring-brand/20";

function monthKeyFromIso(isoDate: string) {
  const { jy, jm } = toJalaliParts(`${isoDate}T12:00:00`);
  return `${jy}-${String(jm).padStart(2, "0")}`;
}

function monthLabelFa(key: string) {
  const [y, m] = key.split("-").map(Number);
  const months = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];
  return `${months[(m || 1) - 1]} ${toFaNumber(y)}`;
}

export function PersonalLedgerPanel({
  initialEntries,
}: {
  initialEntries: PersonalLedgerEntry[];
}) {
  const router = useRouter();
  const [entries, setEntries] = useState(initialEntries);
  const [kind, setKind] = useState<PersonalLedgerKind>("income");
  const [category, setCategory] = useState<string>(PERSONAL_INCOME_CATEGORIES[0]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [entryDate, setEntryDate] = useState(() =>
    jalaliPartsToIsoDate(todayJalaliParts())
  );
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const categories =
    kind === "income" ? PERSONAL_INCOME_CATEGORIES : PERSONAL_EXPENSE_CATEGORIES;

  const currentMonthKey = useMemo(() => {
    const t = todayJalaliParts();
    return `${t.jy}-${String(t.jm).padStart(2, "0")}`;
  }, []);

  const summary = useMemo(() => {
    let incomeAll = 0;
    let expenseAll = 0;
    let incomeMonth = 0;
    let expenseMonth = 0;
    for (const e of entries) {
      if (e.kind === "income") incomeAll += e.amount;
      else expenseAll += e.amount;
      if (monthKeyFromIso(e.entryDate) === currentMonthKey) {
        if (e.kind === "income") incomeMonth += e.amount;
        else expenseMonth += e.amount;
      }
    }
    return {
      incomeAll,
      expenseAll,
      balanceAll: incomeAll - expenseAll,
      incomeMonth,
      expenseMonth,
      balanceMonth: incomeMonth - expenseMonth,
    };
  }, [entries, currentMonthKey]);

  function changeKind(next: PersonalLedgerKind) {
    setKind(next);
    setCategory(
      next === "income"
        ? PERSONAL_INCOME_CATEGORIES[0]
        : PERSONAL_EXPENSE_CATEGORIES[0]
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!amount || Number(amount) <= 0) {
      setError("مبلغ را وارد کنید.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/personal-ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          category,
          title: title.trim() || undefined,
          amount,
          entryDate,
          note: note.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("fail");
      const data = await res.json();
      setEntries((list) => [data.entry, ...list]);
      setAmount("");
      setTitle("");
      setNote("");
      setMessage("ثبت شد.");
      router.refresh();
    } catch {
      setError("ثبت انجام نشد.");
    } finally {
      setLoading(false);
    }
  }

  async function removeEntry(id: string) {
    const previous = entries;
    setEntries((list) => list.filter((e) => e.id !== id));
    try {
      const res = await fetch("/api/personal-ledger", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("fail");
      router.refresh();
    } catch {
      setEntries(previous);
      setError("حذف انجام نشد.");
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-[24px] bg-[#E8F2EA] p-4">
          <p className="text-xs text-muted-foreground">مانده کل</p>
          <p className="mt-2 text-xl font-extrabold text-brand">
            {formatMoney(summary.balanceAll)}
          </p>
        </div>
        <div className="rounded-[24px] bg-white p-4 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
          <p className="text-xs text-muted-foreground">
            درآمد این ماه · {monthLabelFa(currentMonthKey)}
          </p>
          <p className="mt-2 text-lg font-extrabold text-[#2F9E5A]">
            {formatMoney(summary.incomeMonth)}
          </p>
        </div>
        <div className="rounded-[24px] bg-white p-4 shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
          <p className="text-xs text-muted-foreground">
            هزینه این ماه · {monthLabelFa(currentMonthKey)}
          </p>
          <p className="mt-2 text-lg font-extrabold text-[#C45C5C]">
            {formatMoney(summary.expenseMonth)}
          </p>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        مانده این ماه:{" "}
        <span className="font-bold text-brand">
          {formatMoney(summary.balanceMonth)}
        </span>
      </p>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6"
      >
        <p className="text-sm font-bold text-brand">ثبت سریع درآمد یا هزینه</p>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => changeKind("income")}
            className={cn(
              "h-11 rounded-2xl text-sm font-bold transition",
              kind === "income"
                ? "bg-[#2F9E5A] text-white"
                : "bg-[#F7F8F6] text-brand"
            )}
          >
            درآمد
          </button>
          <button
            type="button"
            onClick={() => changeKind("expense")}
            className={cn(
              "h-11 rounded-2xl text-sm font-bold transition",
              kind === "expense"
                ? "bg-[#C45C5C] text-white"
                : "bg-[#F7F8F6] text-brand"
            )}
          >
            هزینه
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>نوع</Label>
            <select
              className={`w-full ${fieldClass}`}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>مبلغ (تومان)</Label>
            <DigitsInput
              mode="integer"
              className={fieldClass}
              value={amount}
              onValueChange={setAmount}
              placeholder="مثلاً ۵۰۰۰۰۰"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>تاریخ</Label>
            <ShamsiDateInput value={entryDate} onChange={setEntryDate} required />
          </div>
          <div className="space-y-2">
            <Label>عنوان کوتاه (اختیاری)</Label>
            <Input
              className={fieldClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً خرید دستگاه"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>توضیح (اختیاری)</Label>
            <Textarea
              className="min-h-20 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6]"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {message ? <p className="text-sm text-brand">{message}</p> : null}

        <Button
          type="submit"
          disabled={loading}
          className={cn(
            "h-12 rounded-2xl px-6 text-white",
            kind === "income"
              ? "bg-[#2F9E5A] hover:bg-[#2F9E5A]/90"
              : "bg-[#C45C5C] hover:bg-[#C45C5C]/90"
          )}
        >
          {loading ? "در حال ثبت..." : `ثبت ${personalLedgerKindLabel(kind)}`}
        </Button>
      </form>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6">
        <p className="text-sm font-bold text-brand">گردش حساب</p>
        {entries.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            هنوز چیزی ثبت نشده. اولین درآمد یا هزینه را بالا وارد کنید.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F7F8F6] px-4 py-3"
              >
                <div>
                  <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-brand">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px]",
                        entry.kind === "income"
                          ? "bg-[#E8F2EA] text-[#2F9E5A]"
                          : "bg-[#F6E6E1] text-[#C45C5C]"
                      )}
                    >
                      {personalLedgerKindLabel(entry.kind)}
                    </span>
                    {entry.category}
                    {entry.title ? ` · ${entry.title}` : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDateFa(entry.entryDate)}
                    {entry.note ? ` · ${entry.note}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p
                    className={cn(
                      "text-sm font-extrabold",
                      entry.kind === "income" ? "text-[#2F9E5A]" : "text-[#C45C5C]"
                    )}
                  >
                    {entry.kind === "income" ? "+" : "−"}
                    {formatMoney(entry.amount)}
                  </p>
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-destructive"
                    onClick={() => removeEntry(entry.id)}
                  >
                    حذف
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

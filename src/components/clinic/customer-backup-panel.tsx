"use client";

import { useState } from "react";
import { Download } from "lucide-react";

const SHEETS = [
  "مشتریان",
  "ویزیت‌ها و فرم پذیرش",
  "اندازه‌ها",
  "پرداخت‌ها",
  "درخواست نوبت",
  "مشاوره آنلاین",
  "پشتیبانی",
  "پیامک‌ها",
];

export function CustomerBackupPanel({
  counts,
}: {
  counts: {
    patients: number;
    visits: number;
    measurements: number;
    payments: number;
    appointments: number;
    consults: number;
    tickets: number;
    sms: number;
  };
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/clinic/customer-backup", { cache: "no-store" });
      if (response.status === 403) {
        setError("فقط مدیر کلینیک می‌تواند این فایل را بگیرد.");
        return;
      }
      if (!response.ok) {
        setError("ساخت فایل انجام نشد. یک‌بار دیگر تلاش کنید.");
        return;
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filenameFromDisposition(response.headers.get("Content-Disposition"));
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setError("ارتباط با سرور قطع شد.");
    } finally {
      setPending(false);
    }
  }

  const cards = [
    { label: "مشتری", value: counts.patients },
    { label: "ویزیت", value: counts.visits },
    { label: "اندازه", value: counts.measurements },
    { label: "پرداخت", value: counts.payments },
    { label: "نوبت", value: counts.appointments },
    { label: "مشاوره", value: counts.consults },
    { label: "پشتیبانی", value: counts.tickets },
    { label: "پیامک", value: counts.sms },
  ];

  return (
    <div className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6">
      <p className="text-sm leading-7 text-muted-foreground">
        هر وقت این دکمه را بزنید، یک فایل اکسل تازه از اطلاعات فعلی مشتریان ساخته می‌شود.
        فایل چند برگ دارد:
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {SHEETS.map((sheet) => (
          <li
            key={sheet}
            className="rounded-full bg-[#E8F2EA] px-3 py-1 text-xs font-medium text-brand"
          >
            {sheet}
          </li>
        ))}
      </ul>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-2xl bg-[#F7F8F6] px-4 py-3">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-xl font-extrabold text-brand">{card.value}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={download}
        disabled={pending}
        className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#14352A] px-6 text-sm font-extrabold text-white disabled:opacity-60"
      >
        <Download className="size-4" />
        {pending ? "در حال ساخت فایل..." : "دانلود فایل اکسل"}
      </button>
      <p className="mt-3 text-xs leading-6 text-muted-foreground">
        رمز عبور مشتریان و کلید اعلان گوشی داخل فایل نیست.
      </p>
      {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}
    </div>
  );
}

function filenameFromDisposition(header: string | null) {
  const encoded = header?.match(/filename\*=UTF-8''([^;]+)/)?.[1];
  if (encoded) {
    try {
      return decodeURIComponent(encoded);
    } catch {
      return "tandis-customers.xlsx";
    }
  }
  return header?.match(/filename="([^"]+)"/)?.[1] ?? "tandis-customers.xlsx";
}

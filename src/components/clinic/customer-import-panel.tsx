"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, FileSpreadsheet, Mic, Square } from "lucide-react";
import type { ImportPlanItem, ImportRecord } from "@/lib/customer-import";

type Preview = {
  items: ImportPlanItem[];
  counts: {
    create: number;
    fill: number;
    unchanged: number;
    skip: number;
    incomplete: number;
    measurements: number;
  };
};

type CommitResult = {
  created: number;
  filled: number;
  skipped: number;
  unchanged: number;
  measurements: number;
  errors: string[];
};

const ERRORS: Record<string, string> = {
  forbidden: "فقط مدیر کلینیک به این بخش دسترسی دارد.",
  file_too_large: "حجم فایل بیشتر از ۸ مگابایت است.",
  xlsx_only: "فقط فایل اکسل با پسوند xlsx قابل خواندن است.",
  unknown_headers: "ستون‌های فایل شناخته نشد. از فایل نمونه استفاده کنید.",
  unreadable: "این فایل خوانده نشد.",
  empty: "ردیف قابل استفاده‌ای در فایل نیست.",
};

export function CustomerImportPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [records, setRecords] = useState<ImportRecord[]>([]);
  const [result, setResult] = useState<CommitResult | null>(null);
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [speech, setSpeech] = useState("");
  const [listening, setListening] = useState(false);
  const [speechPreview, setSpeechPreview] = useState<ImportPlanItem | null>(null);
  const [speechError, setSpeechError] = useState("");

  async function downloadTemplate() {
    setError("");
    const response = await fetch("/api/clinic/customer-import/template");
    if (!response.ok) {
      setError(ERRORS.forbidden);
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "نمونه-ورود-پرونده.xlsx";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  async function readFile() {
    if (!file) return;
    setPending("preview");
    setError("");
    setResult(null);
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/clinic/customer-import", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setPreview(null);
        setError(ERRORS[data.error] ?? "خواندن فایل انجام نشد.");
        return;
      }
      setPreview(data);
      setRecords(data.items.map((item: ImportPlanItem) => item.record));
    } catch {
      setError("ارتباط با سرور قطع شد.");
    } finally {
      setPending("");
    }
  }

  async function commitRecords(nextRecords: ImportRecord[], kind: "file" | "speech") {
    setPending(kind);
    setError("");
    setSpeechError("");
    try {
      const response = await fetch("/api/clinic/customer-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "commit", records: nextRecords }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = ERRORS[data.error] ?? "ذخیره انجام نشد.";
        if (kind === "speech") setSpeechError(message);
        else setError(message);
        return;
      }
      if (kind === "file") {
        setResult(data);
        setPreview(null);
        setFile(null);
      } else {
        setSpeechPreview(null);
        setSpeech("");
        setResult(data);
      }
    } catch {
      const message = "ارتباط با سرور قطع شد.";
      if (kind === "speech") setSpeechError(message);
      else setError(message);
    } finally {
      setPending("");
    }
  }

  async function convertSpeech() {
    if (!speech.trim()) return;
    setPending("speech-preview");
    setSpeechError("");
    try {
      const response = await fetch("/api/clinic/customer-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "preview", text: speech }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSpeechError(ERRORS[data.error] ?? "تبدیل متن انجام نشد.");
        return;
      }
      setSpeechPreview(data.items?.[0] ?? null);
    } catch {
      setSpeechError("ارتباط با سرور قطع شد.");
    } finally {
      setPending("");
    }
  }

  function toggleMic() {
    const SpeechApi =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;
    if (!SpeechApi) {
      setSpeechError("این مرورگر گفتار را به متن تبدیل نمی‌کند. متن را بنویسید یا از اکسل استفاده کنید.");
      return;
    }
    if (listening) {
      window.__tandisSpeech?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechApi();
    recognition.lang = "fa-IR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let finalText = "";
      for (let index = 0; index < event.results.length; index += 1) {
        finalText += event.results[index][0]?.transcript ?? "";
      }
      setSpeech(finalText.trim());
    };
    recognition.onerror = () => {
      setSpeechError("میکروفن در دسترس نیست. متن را بنویسید.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    window.__tandisSpeech = recognition;
    recognition.start();
    setListening(true);
    setSpeechError("");
  }

  const visible = preview?.items.slice(0, 40) ?? [];

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6">
        <div className="flex items-center gap-2 text-brand">
          <FileSpreadsheet className="size-5" />
          <h2 className="text-base font-extrabold">ورود دسته‌ای از اکسل</h2>
        </div>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          برای تعداد زیاد مشتری، پرونده‌ها را در فایل نمونه بنویسید. ستون خالی اشکالی ندارد.
          اگر موبایل یا کد ملی با پرونده موجود یکی باشد، همان پرونده تکمیل می‌شود و مشتری تکراری ساخته نمی‌شود.
          تا وقتی ذخیره را نزنید چیزی در سیستم ثبت نمی‌شود.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#F7F8F6] px-4 text-sm font-bold text-brand"
          >
            <Download className="size-4" />
            دانلود فایل نمونه
          </button>
          <label className="inline-flex h-11 cursor-pointer items-center rounded-2xl bg-[#F7F8F6] px-4 text-sm font-bold text-brand">
            انتخاب فایل xlsx
            <input
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="sr-only"
              onChange={(event) => {
                setFile(event.target.files?.[0] ?? null);
                setPreview(null);
                setResult(null);
              }}
            />
          </label>
          <button
            type="button"
            disabled={!file || pending === "preview"}
            onClick={readFile}
            className="inline-flex h-11 items-center rounded-2xl bg-[#14352A] px-4 text-sm font-extrabold text-white disabled:opacity-60"
          >
            {pending === "preview" ? "در حال خواندن..." : "پیش‌نمایش"}
          </button>
        </div>
        {file ? <p className="mt-3 text-xs text-muted-foreground">{file.name}</p> : null}
        {error ? <p className="mt-3 text-sm font-medium text-rose-700">{error}</p> : null}

        {preview ? (
          <div className="mt-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Count label="مشتری جدید" value={preview.counts.create} />
              <Count label="تکمیل موجود" value={preview.counts.fill} />
              <Count label="بدون تغییر" value={preview.counts.unchanged} />
              <Count label="بدون موبایل" value={preview.counts.incomplete} />
            </div>
            <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto">
              {visible.map((item) => (
                <li key={`${item.row}-${item.name}`} className="rounded-2xl bg-[#F7F8F6] px-3 py-2 text-sm">
                  <p className="font-bold text-brand">
                    {item.name} · {actionLabel(item)}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.phone || "بدون موبایل"}
                    {item.missing.length ? ` · ناقص: ${item.missing.join("، ")}` : ""}
                    {item.warnings.length ? ` · ${item.warnings[0]}` : ""}
                  </p>
                </li>
              ))}
            </ul>
            {preview.items.length > visible.length ? (
              <p className="mt-2 text-xs text-muted-foreground">
                {preview.items.length - visible.length} ردیف دیگر هم در ذخیره می‌آید.
              </p>
            ) : null}
            <button
              type="button"
              disabled={pending === "file" || preview.counts.create + preview.counts.fill === 0}
              onClick={() => commitRecords(records, "file")}
              className="mt-4 inline-flex h-12 items-center rounded-2xl bg-[#14352A] px-6 text-sm font-extrabold text-white disabled:opacity-60"
            >
              {pending === "file" ? "در حال ذخیره..." : "ذخیره در پرونده مشتریان"}
            </button>
          </div>
        ) : null}

        {result ? (
          <div className="mt-5 rounded-2xl bg-[#E8F2EA] px-4 py-3 text-sm leading-7 text-brand">
            <p>
              {result.created} مشتری جدید، {result.filled} پرونده تکمیل شد
              {result.measurements ? ` و ${result.measurements} اندازه ثبت شد` : ""}.
              {result.unchanged ? ` ${result.unchanged} ردیف از قبل کامل بود.` : ""}
              {result.skipped ? ` ${result.skipped} ردیف بدون نام رد شد.` : ""}
            </p>
            {result.errors.length ? <p>{result.errors[0]}</p> : null}
            <Link href="/clinic/reception/customers" className="font-bold underline">
              دیدن لیست مشتریان
            </Link>
          </div>
        ) : null}
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6">
        <div className="flex items-center gap-2 text-brand">
          <Mic className="size-5" />
          <h2 className="text-base font-extrabold">خواندن شفاهی یک پرونده</h2>
        </div>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          پرونده کاغذی را با این جمله‌ها بخوانید: نام، نام خانوادگی، موبایل، کد ملی، سن، شهر، آدرس، قد، وزن، سوابق، دارو، حساسیت و شکایت.
          عددها را رقم‌به‌رقم بگویید. قبل از ذخیره، متن تبدیل‌شده را ببینید و اگر لازم است اصلاح کنید.
        </p>
        <textarea
          value={speech}
          onChange={(event) => {
            setSpeech(event.target.value);
            setSpeechPreview(null);
          }}
          rows={5}
          placeholder="مثلاً: نام فاطمه نام خانوادگی رضایی موبایل ۰۹۱۲۱۲۳۴۵۶۷ سن ۳۴ شهر یزد وزن ۷۸ سوابق کم‌کاری تیروئید"
          className="mt-4 w-full rounded-2xl border border-[#D7E2D9] bg-[#F7F8F6] px-3 py-3 text-sm leading-7 outline-none focus:border-brand"
        />
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={toggleMic}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#F7F8F6] px-4 text-sm font-bold text-brand"
          >
            {listening ? <Square className="size-4" /> : <Mic className="size-4" />}
            {listening ? "توقف ضبط" : "شروع خواندن"}
          </button>
          <button
            type="button"
            disabled={!speech.trim() || pending === "speech-preview"}
            onClick={convertSpeech}
            className="inline-flex h-11 items-center rounded-2xl bg-[#14352A] px-4 text-sm font-extrabold text-white disabled:opacity-60"
          >
            {pending === "speech-preview" ? "در حال تبدیل..." : "تبدیل به پرونده"}
          </button>
        </div>
        {speechError ? <p className="mt-3 text-sm font-medium text-rose-700">{speechError}</p> : null}
        {speechPreview ? (
          <div className="mt-4 rounded-2xl bg-[#F7F8F6] px-4 py-3 text-sm leading-7">
            <p className="font-extrabold text-brand">
              {speechPreview.name} · {actionLabel(speechPreview)}
            </p>
            <p className="text-muted-foreground">
              {speechPreview.phone || "بدون موبایل"}
              {speechPreview.missing.length ? ` · ناقص: ${speechPreview.missing.join("، ")}` : ""}
            </p>
            {speechPreview.warnings.map((warning) => (
              <p key={warning} className="text-xs text-[#9A6B10]">
                {warning}
              </p>
            ))}
            <button
              type="button"
              disabled={speechPreview.action === "skip" || pending === "speech"}
              onClick={() => commitRecords([speechPreview.record], "speech")}
              className="mt-3 inline-flex h-11 items-center rounded-2xl bg-[#14352A] px-4 text-sm font-extrabold text-white disabled:opacity-60"
            >
              {pending === "speech" ? "در حال ذخیره..." : "ذخیره همین پرونده"}
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Count({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-[#F7F8F6] px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-xl font-extrabold text-brand">{value}</p>
    </div>
  );
}

function actionLabel(item: ImportPlanItem) {
  if (item.action === "skip") return "رد می‌شود";
  if (item.unchanged) return "از قبل هست";
  if (item.action === "fill") return "پرونده موجود تکمیل می‌شود";
  return "مشتری جدید";
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechSession;
    webkitSpeechRecognition?: new () => SpeechSession;
    __tandisSpeech?: SpeechSession;
  }
}

type SpeechSession = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

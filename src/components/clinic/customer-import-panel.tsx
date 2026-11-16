"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, FileSpreadsheet, Mic, Square } from "lucide-react";
import type { ImportDraft, ImportPlanItem, ImportRecord } from "@/lib/customer-import";

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
  const [fileDraft, setFileDraft] = useState<ImportDraft | null>(null);
  const filePreviewRef = useRef<HTMLDivElement>(null);
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
        setFileDraft(null);
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
      const item = data.items?.[0] ?? null;
      setSpeechPreview(item);
      setFileDraft(item ? blankDraft(item.draft) : null);
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

  useEffect(() => {
    if (!fileDraft) return;
    filePreviewRef.current?.scrollIntoView({ block: "start" });
  }, [fileDraft]);

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
          عددها را رقم‌به‌رقم بگویید. بعد از تبدیل، خود پرونده را می‌بینید و تا تأیید نکنید ذخیره نمی‌شود.
        </p>
        <textarea
          value={speech}
          onChange={(event) => {
            setSpeech(event.target.value);
            setSpeechPreview(null);
            setFileDraft(null);
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
        {speechPreview && fileDraft ? (
          <div ref={filePreviewRef}>
          <SpokenFilePreview
            item={speechPreview}
            draft={fileDraft}
            pending={pending === "speech"}
            onChange={setFileDraft}
            onCancel={() => {
              setSpeechPreview(null);
              setFileDraft(null);
            }}
            onSave={() => commitRecords([recordFromDraft(fileDraft)], "speech")}
          />
          </div>
        ) : null}
      </section>
    </div>
  );
}

function SpokenFilePreview({
  item,
  draft,
  pending,
  onChange,
  onCancel,
  onSave,
}: {
  item: ImportPlanItem;
  draft: ImportDraft;
  pending: boolean;
  onChange: (draft: ImportDraft) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  function text(key: keyof ImportDraft, value: string) {
    onChange({ ...draft, [key]: value });
  }
  function number(key: keyof ImportDraft, value: string) {
    const parsed = value.trim() ? Number(value) : undefined;
    onChange({ ...draft, [key]: parsed != null && Number.isFinite(parsed) ? parsed : undefined });
  }
  const canSave = item.action !== "skip" && !item.unchanged && Boolean(draft.lastName || draft.firstName);

  return (
    <div className="mt-4 rounded-[28px] border border-[#D7E2D9] bg-[#F7F8F6] p-4">
      <p className="text-xs font-medium text-muted-foreground">پیش‌نمایش پرونده، هنوز ذخیره نشده</p>
      <h3 className="mt-1 text-xl font-extrabold text-brand">
        {`${draft.firstName} ${draft.lastName}`.trim() || "بدون نام"}
      </h3>
      <p className="mt-1 text-sm font-bold text-[#9A6B10]">{actionLabel(item)}</p>
      {item.missing.length ? (
        <p className="mt-1 text-xs text-muted-foreground">ناقص: {item.missing.join("، ")}</p>
      ) : null}
      {item.warnings.map((warning) => (
        <p key={warning} className="mt-1 text-xs text-[#9A6B10]">
          {warning}
        </p>
      ))}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="نام" value={draft.firstName} onChange={(value) => text("firstName", value)} />
        <Field label="نام خانوادگی" value={draft.lastName} onChange={(value) => text("lastName", value)} />
        <Field label="موبایل" value={draft.phone} onChange={(value) => text("phone", value)} dir="ltr" />
        <Field label="کد ملی" value={draft.nationalId ?? ""} onChange={(value) => text("nationalId", value)} dir="ltr" />
        <Field label="سن" value={draft.age?.toString() ?? ""} onChange={(value) => number("age", value)} />
        <label className="block text-xs font-bold text-brand">
          جنسیت
          <select
            value={draft.gender}
            onChange={(event) => onChange({ ...draft, gender: event.target.value as ImportDraft["gender"] })}
            className="mt-1 h-11 w-full rounded-2xl border border-[#D7E2D9] bg-white px-3 text-sm"
          >
            <option value="female">زن</option>
            <option value="male">مرد</option>
          </select>
        </label>
        <Field label="استان" value={draft.province ?? ""} onChange={(value) => text("province", value)} />
        <Field label="شهر" value={draft.city ?? ""} onChange={(value) => text("city", value)} />
        <Field label="آدرس" value={draft.address} onChange={(value) => text("address", value)} className="sm:col-span-2" />
        <Field label="قد" value={draft.heightCm?.toString() ?? ""} onChange={(value) => number("heightCm", value)} />
        <Field label="وزن" value={draft.weightKg?.toString() ?? ""} onChange={(value) => number("weightKg", value)} />
        <Field label="وزن هدف" value={draft.goalWeightKg?.toString() ?? ""} onChange={(value) => number("goalWeightKg", value)} />
        <Field label="دور کمر" value={draft.waistCm?.toString() ?? ""} onChange={(value) => number("waistCm", value)} />
        <Field label="دور باسن" value={draft.hipCm?.toString() ?? ""} onChange={(value) => number("hipCm", value)} />
        <Field label="فشار خون" value={draft.bloodPressure ?? ""} onChange={(value) => text("bloodPressure", value)} />
        <Area label="سوابق پزشکی" value={draft.medicalHistory ?? ""} onChange={(value) => text("medicalHistory", value)} />
        <Area label="داروها" value={draft.medications ?? ""} onChange={(value) => text("medications", value)} />
        <Area label="حساسیت" value={draft.allergies ?? ""} onChange={(value) => text("allergies", value)} />
        <Area label="شکایت" value={draft.chiefComplaint ?? ""} onChange={(value) => text("chiefComplaint", value)} />
        <Area label="یادداشت" value={draft.therapistNotes ?? ""} onChange={(value) => text("therapistNotes", value)} />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={!canSave || pending}
          onClick={onSave}
          className="inline-flex h-11 items-center rounded-2xl bg-[#14352A] px-4 text-sm font-extrabold text-white disabled:opacity-60"
        >
          {pending ? "در حال ذخیره..." : "پرونده درست است، ذخیره شود"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex h-11 items-center rounded-2xl bg-white px-4 text-sm font-bold text-brand"
        >
          انصراف
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  dir,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: "ltr";
  className?: string;
}) {
  return (
    <label className={`block text-xs font-bold text-brand ${className ?? ""}`}>
      {label}
      <input
        value={value}
        dir={dir}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full rounded-2xl border border-[#D7E2D9] bg-white px-3 text-sm font-normal text-foreground"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-xs font-bold text-brand sm:col-span-2">
      {label}
      <textarea
        value={value}
        rows={2}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-2xl border border-[#D7E2D9] bg-white px-3 py-2 text-sm font-normal leading-6 text-foreground"
      />
    </label>
  );
}

function blankDraft(draft: ImportDraft | undefined): ImportDraft {
  return {
    firstName: draft?.firstName ?? "",
    lastName: draft?.lastName ?? "",
    phone: draft?.phone ?? "",
    nationalId: draft?.nationalId,
    age: draft?.age,
    gender: draft?.gender === "male" ? "male" : "female",
    province: draft?.province,
    city: draft?.city,
    address: draft?.address ?? "",
    birthDate: draft?.birthDate,
    heightCm: draft?.heightCm,
    goalWeightKg: draft?.goalWeightKg,
    weightKg: draft?.weightKg,
    waistCm: draft?.waistCm,
    hipCm: draft?.hipCm,
    bloodPressure: draft?.bloodPressure,
    medicalHistory: draft?.medicalHistory,
    medications: draft?.medications,
    allergies: draft?.allergies,
    chiefComplaint: draft?.chiefComplaint,
    therapistNotes: draft?.therapistNotes,
    previousDiets: draft?.previousDiets,
    notes: draft?.notes,
  };
}

function recordFromDraft(draft: ImportDraft): ImportRecord {
  const record: ImportRecord = {
    firstName: draft.firstName,
    lastName: draft.lastName,
    phone: draft.phone,
    address: draft.address,
    gender: draft.gender === "male" ? "مرد" : "زن",
  };
  if (draft.nationalId) record.nationalId = draft.nationalId;
  if (draft.age != null) record.age = String(draft.age);
  if (draft.province) record.province = draft.province;
  if (draft.city) record.city = draft.city;
  if (draft.birthDate) record.birthDate = draft.birthDate;
  if (draft.heightCm != null) record.heightCm = String(draft.heightCm);
  if (draft.goalWeightKg != null) record.goalWeightKg = String(draft.goalWeightKg);
  if (draft.weightKg != null) record.weightKg = String(draft.weightKg);
  if (draft.waistCm != null) record.waistCm = String(draft.waistCm);
  if (draft.hipCm != null) record.hipCm = String(draft.hipCm);
  if (draft.bloodPressure) record.bloodPressure = draft.bloodPressure;
  if (draft.medicalHistory) record.medicalHistory = draft.medicalHistory;
  if (draft.medications) record.medications = draft.medications;
  if (draft.allergies) record.allergies = draft.allergies;
  if (draft.chiefComplaint) record.chiefComplaint = draft.chiefComplaint;
  if (draft.therapistNotes) record.therapistNotes = draft.therapistNotes;
  if (draft.previousDiets) record.previousDiets = draft.previousDiets;
  return record;
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

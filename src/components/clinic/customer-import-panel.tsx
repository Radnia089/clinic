"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, Download, FileSpreadsheet, ImagePlus, Mic, Square, X } from "lucide-react";
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
  too_many: "هر پرونده حداکثر پنج صفحه است.",
  image_only: "فقط عکس JPG یا PNG قابل خواندن است.",
  empty_text: "متنی در عکس‌ها خوانده نشد. عکس را روشن‌تر و صاف‌تر بگیرید.",
  ocr_unavailable: "خواندن عکس روی این سرور آماده نیست.",
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
  const [photos, setPhotos] = useState<Array<{ id: string; file: File; url: string }>>([]);
  const [photoText, setPhotoText] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [photoResult, setPhotoResult] = useState<CommitResult | null>(null);
  const [photoPreview, setPhotoPreview] = useState<ImportPlanItem | null>(null);
  const [photoDraft, setPhotoDraft] = useState<ImportDraft | null>(null);
  const photoPreviewRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

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

  async function commitRecords(nextRecords: ImportRecord[], kind: "file" | "speech" | "photo") {
    setPending(kind);
    setError("");
    setSpeechError("");
    setPhotoError("");
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
        else if (kind === "photo") setPhotoError(message);
        else setError(message);
        return;
      }
      if (kind === "file") {
        setResult(data);
        setPreview(null);
        setFile(null);
      } else if (kind === "photo") {
        setPhotoPreview(null);
        setPhotoDraft(null);
        setPhotos((current) => {
          current.forEach((page) => URL.revokeObjectURL(page.url));
          return [];
        });
        setPhotoText("");
        setPhotoResult(data);
      } else {
        setSpeechPreview(null);
        setFileDraft(null);
        setSpeech("");
        setResult(data);
      }
    } catch {
      const message = "ارتباط با سرور قطع شد.";
      if (kind === "speech") setSpeechError(message);
      else if (kind === "photo") setPhotoError(message);
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

  useEffect(() => {
    if (!photoDraft) return;
    photoPreviewRef.current?.scrollIntoView({ block: "start" });
  }, [photoDraft]);

  function addPhotos(list: FileList | null) {
    if (!list?.length) return;
    const incoming = Array.from(list).filter((file) => file.type.startsWith("image/"));
    const room = 5 - photos.length;
    setPhotoError(incoming.length > room ? ERRORS.too_many : "");
    setPhotoPreview(null);
    setPhotoDraft(null);
    setPhotoText("");
    setPhotos((current) => {
      const space = 5 - current.length;
      return [
        ...current,
        ...incoming.slice(0, Math.max(0, space)).map((file) => ({
          id: crypto.randomUUID(),
          file,
          url: URL.createObjectURL(file),
        })),
      ];
    });
  }

  async function analyzePhotos() {
    if (!photos.length) return;
    setPending("photo-preview");
    setPhotoError("");
    setPhotoResult(null);
    try {
      const body = new FormData();
      for (let index = 0; index < photos.length; index += 1) {
        const blob = await compressPhoto(photos[index].file);
        body.append("pages", blob, `page-${index + 1}.jpg`);
      }
      const response = await fetch("/api/clinic/customer-import/photos", { method: "POST", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setPhotoError(ERRORS[data.error] ?? "خواندن عکس انجام نشد.");
        return;
      }
      const item = data.items?.[0] ?? null;
      setPhotoText(typeof data.text === "string" ? data.text : "");
      setPhotoPreview(item);
      setPhotoDraft(item ? blankDraft(item.draft) : null);
    } catch {
      setPhotoError("این عکس خوانده نشد. از دوربین گوشی یک عکس معمولی بگیرید.");
    } finally {
      setPending("");
    }
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
          <Camera className="size-5" />
          <h2 className="text-base font-extrabold">ورود از عکس پرونده</h2>
        </div>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          از هر صفحه پرونده یک عکس بگیرید. پرونده‌های چهار یا پنج صفحه‌ای را پشت سر هم با دوربین گوشی ثبت کنید.
          متن عکس در فیلدها می‌نشیند و تا تأیید نکنید ذخیره نمی‌شود. خود عکس‌ها نگه داشته نمی‌شوند.
        </p>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            addPhotos(event.target.files);
            event.target.value = "";
          }}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => {
            addPhotos(event.target.files);
            event.target.value = "";
          }}
        />
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={photos.length >= 5}
            onClick={() => cameraRef.current?.click()}
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#14352A] px-4 text-sm font-extrabold text-white disabled:opacity-60"
          >
            <Camera className="size-4" />
            عکس با دوربین گوشی
          </button>
          <button
            type="button"
            disabled={photos.length >= 5}
            onClick={() => galleryRef.current?.click()}
            className="inline-flex h-12 items-center gap-2 rounded-2xl bg-[#F7F8F6] px-4 text-sm font-bold text-brand disabled:opacity-60"
          >
            <ImagePlus className="size-4" />
            انتخاب عکس‌ها
          </button>
        </div>
        {photos.length ? (
          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
            {photos.map((photo, index) => (
              <div key={photo.id} className="relative">
                {/* Blob previews from the phone camera are not remote images. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={`صفحه ${index + 1}`}
                  className="h-28 w-full rounded-2xl bg-[#F7F8F6] object-contain"
                />
                <span className="absolute bottom-1 right-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-brand">
                  صفحه {index + 1}
                </span>
                <button
                  type="button"
                  aria-label={`حذف صفحه ${index + 1}`}
                  onClick={() => {
                    setPhotos((current) => {
                      const page = current[index];
                      if (page) URL.revokeObjectURL(page.url);
                      return current.filter((item) => item.id !== page?.id);
                    });
                    setPhotoPreview(null);
                    setPhotoDraft(null);
                    setPhotoText("");
                  }}
                  className="absolute left-1 top-1 inline-flex size-7 items-center justify-center rounded-full bg-white text-brand"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          disabled={!photos.length || pending === "photo-preview"}
          onClick={analyzePhotos}
          className="mt-4 inline-flex h-11 items-center rounded-2xl bg-[#14352A] px-4 text-sm font-extrabold text-white disabled:opacity-60"
        >
          {pending === "photo-preview" ? "در حال خواندن عکس‌ها..." : "خواندن عکس‌ها و پیش‌نمایش"}
        </button>
        {photoError ? <p className="mt-3 text-sm font-medium text-rose-700">{photoError}</p> : null}
        {photoText ? (
          <p className="mt-3 max-h-28 overflow-y-auto rounded-2xl bg-[#F7F8F6] px-3 py-2 text-xs leading-6 text-muted-foreground">
            متن خوانده‌شده: {photoText}
          </p>
        ) : null}
        {photoPreview && photoDraft ? (
          <div ref={photoPreviewRef}>
            <SpokenFilePreview
              item={photoPreview}
              draft={photoDraft}
              pending={pending === "photo"}
              onChange={setPhotoDraft}
              onCancel={() => {
                setPhotoPreview(null);
                setPhotoDraft(null);
              }}
              onSave={() => commitRecords([recordFromDraft(photoDraft)], "photo")}
            />
          </div>
        ) : null}
        {photoResult ? (
          <div className="mt-5 rounded-2xl bg-[#E8F2EA] px-4 py-3 text-sm leading-7 text-brand">
            <p>
              {photoResult.created} مشتری جدید، {photoResult.filled} پرونده تکمیل شد
              {photoResult.measurements ? ` و ${photoResult.measurements} اندازه ثبت شد` : ""}.
            </p>
            {photoResult.errors.length ? <p>{photoResult.errors[0]}</p> : null}
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
          متن را همان‌طور که حرف می‌زنید بخوانید. لازم نیست فیلدها را با ویرگول جدا کنید یا عددها را رقم‌به‌رقم بگویید.
          نام، سن، قد، وزن، موبایل و بقیه از خود جمله درمی‌آید. بعد از تبدیل، پرونده را می‌بینید و تا تأیید نکنید ذخیره نمی‌شود.
        </p>
        <textarea
          value={speech}
          onChange={(event) => {
            setSpeech(event.target.value);
            setSpeechPreview(null);
            setFileDraft(null);
          }}
          rows={5}
          placeholder="مثلاً: نام و نام خانوادگی مشتری من وحید رادنیا است. سنش چهل و سه ساله. قدش صد و هشتاد و دو سانت. وزنش نود و چهار کیلو. شماره موبایلش صفر نهصد و دوازده، دویست و شصت، بیست و هفت، هفتاد و یک"
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
  const named = Boolean(draft.firstName.trim() || draft.lastName.trim());
  const canSave = named && !item.unchanged;

  return (
    <div className="mt-4 rounded-[28px] border border-[#D7E2D9] bg-[#F7F8F6] p-4">
      <p className="text-xs font-medium text-muted-foreground">پیش‌نمایش پرونده، هنوز ذخیره نشده</p>
      <h3 className="mt-1 text-xl font-extrabold text-brand">
        {`${draft.firstName} ${draft.lastName}`.trim() || "بدون نام"}
      </h3>
      <p className="mt-1 text-sm font-bold text-[#9A6B10]">
        {item.action === "skip" && named ? "مشتری جدید" : actionLabel(item)}
      </p>
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

async function compressPhoto(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const longest = Math.max(bitmap.width, bitmap.height);
    const scale = Math.min(1, 1600 / longest);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.72));
    return blob ?? file;
  } catch {
    return file;
  }
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

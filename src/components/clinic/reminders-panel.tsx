"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DigitsInput } from "@/components/ui/digits-input";
import { formatJalaliDate } from "@/lib/jalali";
import { toFaNumber } from "@/lib/schedule";
import type { ReminderSettings, SmsLogEntry } from "@/lib/types";

const fieldClass =
  "h-12 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6] px-3 text-base focus-visible:border-brand focus-visible:ring-brand/20";

type AudiencePatient = {
  id: string;
  name: string;
  phone: string;
  hasVisit: boolean;
};

const PROMO_PRESETS = [
  {
    id: "package",
    label: "آفر پکیج",
    text: "{name} عزیز، در {clinic} پکیج ویژه لاغری با تخفیف محدود داریم. برای رزرو با ما تماس بگیرید.",
  },
  {
    id: "offer",
    label: "تخفیف فصلی",
    text: "{name} عزیز، آفر ویژه این هفته {clinic}: ویزیت + مشاوره رایگان. همین امروز نوبت بگیرید.",
  },
  {
    id: "return",
    label: "یادآوری بازگشت",
    text: "{name} عزیز، مدتی است به {clinic} سر نزده‌اید. برای ادامه مسیر سلامتی‌تان منتظرتان هستیم.",
  },
  {
    id: "device",
    label: "دستگاه جدید",
    text: "{name} عزیز، دستگاه‌های جدید لاغری در {clinic} فعال شد. برای اطلاعات بیشتر پیام دهید یا تماس بگیرید.",
  },
];

function kindLabel(kind: SmsLogEntry["kind"]) {
  switch (kind) {
    case "morning":
      return "صبح";
    case "hours_before":
      return "قبل از نوبت";
    case "promo":
      return "تبلیغاتی";
    case "test":
      return "آزمایشی";
    case "online_consult":
      return "مشاوره آنلاین";
    default:
      return kind;
  }
}

function providerLabel(provider: SmsLogEntry["provider"] | "mock" | "kavenegar" | "android") {
  if (provider === "android") return "گوشی اندروید";
  if (provider === "kavenegar") return "کاوه‌نگار";
  return "آزمایشی / Mock";
}

function providerHelp(provider: "mock" | "kavenegar" | "android") {
  if (provider === "android") {
    return "اپ SMS Gateway روی گوشی اندروید تنظیم شده — پیامک‌ها از سیم‌کارت همان گوشی ارسال می‌شوند.";
  }
  if (provider === "kavenegar") {
    return "کلید کاوه‌نگار تنظیم شده — پیامک‌ها واقعی ارسال می‌شوند.";
  }
  return "فعلاً حالت آزمایشی (Mock) فعال است. پیام‌ها ذخیره می‌شوند ولی به شبکه مخابراتی نمی‌روند.";
}

export function RemindersPanel({
  initialSettings,
  initialLogs,
  provider,
  hasKavenegarKey,
  hasAndroidGateway,
  audience,
}: {
  initialSettings: ReminderSettings;
  initialLogs: SmsLogEntry[];
  provider: "mock" | "kavenegar" | "android";
  hasKavenegarKey: boolean;
  hasAndroidGateway: boolean;
  audience: {
    all: number;
    withVisits: number;
    validPhones: number;
    patients: AudiencePatient[];
  };
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [logs, setLogs] = useState(initialLogs);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [promoText, setPromoText] = useState(PROMO_PRESETS[0].text);
  const [promoAudience, setPromoAudience] = useState<"all" | "with_visits" | "selected">(
    "all"
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sendingPromo, setSendingPromo] = useState(false);
  const [confirmPromo, setConfirmPromo] = useState(false);

  const selectedCount = useMemo(() => {
    if (promoAudience === "all") return audience.all;
    if (promoAudience === "with_visits") return audience.withVisits;
    return selectedIds.length;
  }, [promoAudience, audience, selectedIds]);

  async function refresh() {
    const res = await fetch("/api/reminders");
    if (!res.ok) return;
    const data = await res.json();
    setSettings(data.settings);
    setLogs(data.logs ?? []);
  }

  useEffect(() => {
    void fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "run" }),
    }).then(() => refresh());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveSettings(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("save");
      const data = await res.json();
      setSettings(data.settings);
      setMessage("تنظیمات ذخیره شد.");
    } catch {
      setError("ذخیره تنظیمات انجام نشد.");
    } finally {
      setSaving(false);
    }
  }

  async function runNow() {
    setRunning(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("run");
      setMessage(
        `اجرا شد: ${toFaNumber(data.sent)} ارسال · ${toFaNumber(data.skipped)} تکراری · ${toFaNumber(data.failed)} ناموفق`
      );
      await refresh();
    } catch {
      setError("اجرای یادآوری‌ها ناموفق بود.");
    } finally {
      setRunning(false);
    }
  }

  async function sendTest() {
    setError("");
    setMessage("");
    if (!testPhone) {
      setError("شماره موبایل آزمایشی را وارد کنید.");
      return;
    }
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test", phone: testPhone }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(
        data.error === "invalid_phone"
          ? "شماره موبایل معتبر نیست."
          : "ارسال آزمایشی ناموفق بود."
      );
      return;
    }
    setMessage(
      data.entry?.status === "mock"
        ? "پیام آزمایشی در حالت آزمایشی ثبت شد (هنوز پنل واقعی وصل نیست)."
        : "پیام آزمایشی ارسال شد."
    );
    await refresh();
  }

  async function sendPromo() {
    setError("");
    setMessage("");
    if (!promoText.trim()) {
      setError("متن پیام تبلیغاتی را بنویسید.");
      return;
    }
    if (selectedCount === 0) {
      setError("هیچ گیرنده‌ای انتخاب نشده است.");
      return;
    }
    if (!confirmPromo) {
      setError("برای ارسال انبوه، تأیید را فعال کنید.");
      return;
    }

    setSendingPromo(true);
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "promo",
          message: promoText,
          audience: promoAudience,
          patientIds: promoAudience === "selected" ? selectedIds : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const map: Record<string, string> = {
          empty_message: "متن پیام خالی است.",
          too_long: "متن پیام بیش از ۵۰۰ کاراکتر است.",
          no_selection: "حداقل یک مشتری انتخاب کنید.",
        };
        setError(map[data.error] || "ارسال انبوه ناموفق بود.");
        return;
      }
      setMessage(
        `پیامک انبوه: ${toFaNumber(data.sent)} ارسال · ${toFaNumber(data.failed)} ناموفق · ${toFaNumber(data.skipped)} بدون موبایل معتبر`
      );
      setConfirmPromo(false);
      await refresh();
    } catch {
      setError("ارسال انبوه انجام نشد.");
    } finally {
      setSendingPromo(false);
    }
  }

  function togglePatient(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-brand">وضعیت بستر پیامک</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {providerHelp(provider)}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              provider === "android"
                ? "bg-[#E8F2EA] text-brand"
                : provider === "kavenegar"
                  ? "bg-[#E8F2EA] text-brand"
                  : "bg-[#F6E6E1] text-[#9A4E42]"
            }`}
          >
            {providerLabel(provider)}
          </span>
        </div>
        <div className="space-y-2 rounded-2xl bg-[#F7F8F6] px-4 py-3 text-xs leading-6 text-muted-foreground">
          <p>
            برای ارسال از گوشی اندروید (بدون پنل): اپ{" "}
            <span dir="ltr">SMS Gateway</span> را نصب کنید و متغیرهای مربوط را در{" "}
            <span dir="ltr">.env</span> طبق <span dir="ltr">.env.example</span>{" "}
            تنظیم کنید.
          </p>
          <p>
            وضعیت تنظیمات:{" "}
            {hasAndroidGateway ? "گوشی اندروید آماده" : "گوشی اندروید تنظیم نشده"}
            {" · "}
            {hasKavenegarKey ? "کاوه‌نگار آماده" : "کاوه‌نگار تنظیم نشده"}
          </p>
          <p>سرویس هر دقیقه نوبت‌های سررسید را چک می‌کند.</p>
        </div>
      </section>

      <form
        onSubmit={saveSettings}
        className="space-y-4 rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6"
      >
        <div className="mb-2">
          <p className="text-sm font-bold text-brand">۱ · یادآوری نوبت</p>
          <p className="mt-1 text-xs text-muted-foreground">
            صبح روز نوبت، یا چند ساعت قبل از ساعت نوبت.
          </p>
        </div>

        <label className="flex items-center gap-3 rounded-2xl bg-[#F7F8F6] px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) =>
              setSettings((s) => ({ ...s, enabled: e.target.checked }))
            }
            className="size-4 accent-[var(--brand)]"
          />
          فعال‌سازی کل سیستم یادآوری پیامکی
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl bg-[#E8F2EA]/50 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={settings.morningEnabled}
              onChange={(e) =>
                setSettings((s) => ({ ...s, morningEnabled: e.target.checked }))
              }
              className="size-4"
            />
            پیام صبح روز نوبت
          </label>
          <div className="space-y-2">
            <Label>ساعت ارسال صبح (به‌وقت ایران)</Label>
            <select
              className={`w-full ${fieldClass}`}
              value={settings.morningHour}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  morningHour: Number(e.target.value),
                }))
              }
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {toFaNumber(h)}:۰۰
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 rounded-2xl bg-[#F6E6E1]/50 px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={settings.hoursBeforeEnabled}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  hoursBeforeEnabled: e.target.checked,
                }))
              }
              className="size-4"
            />
            پیام چند ساعت قبل از نوبت
          </label>
          <div className="space-y-2">
            <Label>چند ساعت قبل</Label>
            <select
              className={`w-full ${fieldClass}`}
              value={settings.hoursBefore}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  hoursBefore: Number(e.target.value),
                }))
              }
            >
              {[1, 2, 3, 4, 6, 12, 24].map((h) => (
                <option key={h} value={h}>
                  {toFaNumber(h)} ساعت قبل
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>متن یادآوری نوبت</Label>
          <Textarea
            className="min-h-28 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6] focus-visible:border-brand focus-visible:ring-brand/20"
            value={settings.template}
            onChange={(e) =>
              setSettings((s) => ({ ...s, template: e.target.value }))
            }
          />
          <p className="text-[11px] text-muted-foreground" dir="ltr">
            {"{name} {date} {time} {clinic} {type}"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="submit"
            disabled={saving}
            className="h-11 rounded-2xl bg-brand px-5 text-white"
          >
            {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
          </Button>
          <Button
            type="button"
            disabled={running}
            onClick={runNow}
            variant="outline"
            className="h-11 rounded-2xl px-5"
          >
            {running ? "در حال اجرا..." : "اجرای دستی صف یادآوری"}
          </Button>
        </div>
      </form>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6">
        <div className="mb-4">
          <p className="text-sm font-bold text-[#9A4E42]">۲ · پیامک انبوه و تبلیغاتی</p>
          <p className="mt-1 text-xs text-muted-foreground">
            آفر پکیج، تخفیف، بازگشت مشتری یا هر پیام تبلیغاتی برای مشتریان سیستم.
          </p>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {PROMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setPromoText(preset.text)}
              className="rounded-full bg-[#F6E6E1] px-3 py-1.5 text-xs font-bold text-[#9A4E42] transition hover:bg-[#efd5cd]"
            >
              {preset.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <Label>متن پیام تبلیغاتی</Label>
          <Textarea
            className="min-h-28 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6] focus-visible:border-brand focus-visible:ring-brand/20"
            value={promoText}
            onChange={(e) => setPromoText(e.target.value)}
            maxLength={500}
          />
          <p className="text-[11px] text-muted-foreground">
            متغیرها: <span dir="ltr">{"{name} {clinic}"}</span> ·{" "}
            {toFaNumber(promoText.length)} / ۵۰۰ کاراکتر
          </p>
        </div>

        <div className="mt-4 space-y-2">
          <Label>گیرندگان</Label>
          <div className="grid gap-2 sm:grid-cols-3">
            {(
              [
                { id: "all", label: "همه مشتریان", count: audience.all },
                {
                  id: "with_visits",
                  label: "حداقل یک نوبت",
                  count: audience.withVisits,
                },
                {
                  id: "selected",
                  label: "انتخابی",
                  count: selectedIds.length,
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPromoAudience(opt.id)}
                className={`rounded-2xl px-3 py-3 text-right text-sm transition ${
                  promoAudience === opt.id
                    ? "bg-[#D86B5C] text-white"
                    : "bg-[#F7F8F6] text-brand hover:bg-[#E8F2EA]"
                }`}
              >
                <span className="block font-bold">{opt.label}</span>
                <span className="mt-0.5 block text-xs opacity-80">
                  {toFaNumber(opt.count)} نفر
                </span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground">
            موبایل معتبر در سیستم: {toFaNumber(audience.validPhones)} · آماده ارسال به{" "}
            {toFaNumber(selectedCount)} نفر
          </p>
        </div>

        {promoAudience === "selected" ? (
          <div className="mt-3 max-h-52 space-y-1 overflow-y-auto rounded-2xl bg-[#F7F8F6] p-2">
            {audience.patients.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                هنوز مشتری ثبت نشده است.
              </p>
            ) : (
              audience.patients.map((p) => (
                <label
                  key={p.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-white"
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    onChange={() => togglePatient(p.id)}
                    className="size-4"
                  />
                  <span className="flex-1 font-medium text-brand">{p.name}</span>
                  <span className="text-xs text-muted-foreground" dir="ltr">
                    {p.phone}
                  </span>
                </label>
              ))
            )}
          </div>
        ) : null}

        <label className="mt-4 flex items-center gap-3 rounded-2xl bg-[#FFF8F5] px-4 py-3 text-sm text-[#9A4E42]">
          <input
            type="checkbox"
            checked={confirmPromo}
            onChange={(e) => setConfirmPromo(e.target.checked)}
            className="size-4"
          />
          تأیید می‌کنم این پیام برای {toFaNumber(selectedCount)} نفر ارسال شود
        </label>

        <Button
          type="button"
          disabled={sendingPromo}
          onClick={sendPromo}
          className="mt-3 h-12 rounded-2xl bg-[#D86B5C] px-6 text-white hover:bg-[#D86B5C]/90"
        >
          {sendingPromo ? "در حال ارسال انبوه..." : "ارسال پیامک انبوه"}
        </Button>
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6">
        <p className="text-sm font-bold text-brand">ارسال آزمایشی یادآوری</p>
        <p className="mt-1 text-xs text-muted-foreground">
          یک پیام نمونه با قالب یادآوری به شماره دلخواه بفرستید.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <DigitsInput
            mode="phone"
            className={`${fieldClass} w-full sm:w-56`}
            placeholder="0913xxxxxxx"
            value={testPhone}
            onValueChange={setTestPhone}
          />
          <Button
            type="button"
            onClick={sendTest}
            className="h-12 rounded-2xl bg-brand px-5 text-white"
          >
            ارسال آزمایشی
          </Button>
        </div>
      </section>

      {(message || error) && (
        <p className={`text-sm ${error ? "text-destructive" : "text-brand"}`}>
          {error || message}
        </p>
      )}

      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6">
        <p className="text-sm font-bold text-brand">آخرین پیامک‌ها</p>
        {logs.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            هنوز پیامکی ثبت نشده است.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {logs.slice(0, 40).map((log) => (
              <li
                key={log.id}
                className="rounded-2xl bg-[#F7F8F6] px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-bold text-brand">
                    {log.patientName}{" "}
                    <span className="font-medium text-muted-foreground" dir="ltr">
                      {log.phone}
                    </span>
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      log.status === "failed"
                        ? "bg-red-100 text-red-700"
                        : log.kind === "promo"
                          ? "bg-[#F6E6E1] text-[#9A4E42]"
                          : log.status === "mock"
                            ? "bg-[#FFF3E0] text-[#9A6B2F]"
                            : "bg-[#E8F2EA] text-brand"
                    }`}
                  >
                    {log.status === "mock"
                      ? "Mock"
                      : log.status === "sent"
                        ? "ارسال‌شده"
                        : "ناموفق"}
                    {" · "}
                    {kindLabel(log.kind)}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-6 text-foreground/80">{log.body}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {formatJalaliDate(log.createdAt, {
                    withMonthName: true,
                    withWeekday: true,
                  })}
                  {log.error ? ` · ${log.error}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

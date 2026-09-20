"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DigitsInput } from "@/components/ui/digits-input";
import { formatJalaliDate } from "@/lib/jalali";
import { toFaNumber } from "@/lib/schedule";
import type { ReminderSettings, SmsLogEntry } from "@/lib/types";

const fieldClass =
  "h-12 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6] px-3 text-base focus-visible:border-brand focus-visible:ring-brand/20";

export function RemindersPanel({
  initialSettings,
  initialLogs,
  provider,
  hasKavenegarKey,
}: {
  initialSettings: ReminderSettings;
  initialLogs: SmsLogEntry[];
  provider: "mock" | "kavenegar";
  hasKavenegarKey: boolean;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [logs, setLogs] = useState(initialLogs);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [testPhone, setTestPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    const res = await fetch("/api/reminders");
    if (!res.ok) return;
    const data = await res.json();
    setSettings(data.settings);
    setLogs(data.logs ?? []);
  }

  useEffect(() => {
    // با باز شدن صفحه یک‌بار صف را اجرا کن
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

  return (
    <div className="space-y-5">
      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-brand">وضعیت بستر پیامک</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {hasKavenegarKey
                ? "کلید کاوه‌نگار تنظیم شده — پیامک‌ها واقعی ارسال می‌شوند."
                : "فعلاً حالت آزمایشی (Mock) فعال است. پیام‌ها ذخیره می‌شوند ولی به شبکه مخابراتی نمی‌روند."}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              provider === "kavenegar"
                ? "bg-[#E8F2EA] text-brand"
                : "bg-[#F6E6E1] text-[#9A4E42]"
            }`}
          >
            {provider === "kavenegar" ? "کاوه‌نگار" : "آزمایشی / Mock"}
          </span>
        </div>
        <div className="rounded-2xl bg-[#F7F8F6] px-4 py-3 text-xs leading-6 text-muted-foreground">
          برای ارسال واقعی، در فایل <span dir="ltr">.env.local</span> مقدار{" "}
          <span dir="ltr">KAVENEGAR_API_KEY</span> را بگذارید (اختیاری:{" "}
          <span dir="ltr">KAVENEGAR_SENDER</span>). سرویس هر دقیقه نوبت‌های سررسید را چک می‌کند.
        </div>
      </section>

      <form
        onSubmit={saveSettings}
        className="space-y-4 rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6"
      >
        <div className="mb-2">
          <p className="text-sm font-bold text-brand">قوانین یادآوری</p>
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
          <Label>متن پیامک</Label>
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
        <p className="text-sm font-bold text-brand">ارسال آزمایشی</p>
        <p className="mt-1 text-xs text-muted-foreground">
          یک پیام نمونه با قالب فعلی به شماره دلخواه بفرستید.
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
            className="h-12 rounded-2xl bg-[#D86B5C] px-5 text-white"
          >
            ارسال آزمایشی
          </Button>
        </div>
      </section>

      {(message || error) && (
        <p
          className={`text-sm ${error ? "text-destructive" : "text-brand"}`}
        >
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
            {logs.slice(0, 30).map((log) => (
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
                        : log.status === "mock"
                          ? "bg-[#F6E6E1] text-[#9A4E42]"
                          : "bg-[#E8F2EA] text-brand"
                    }`}
                  >
                    {log.status === "mock"
                      ? "آزمایشی"
                      : log.status === "sent"
                        ? "ارسال‌شده"
                        : "ناموفق"}
                    {" · "}
                    {log.kind === "morning" ? "صبح" : "قبل از نوبت"}
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

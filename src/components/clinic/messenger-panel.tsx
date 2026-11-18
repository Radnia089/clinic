"use client";

import { useState, type FormEvent } from "react";
import type { MessengerNotifySettings } from "@/lib/types";

type Tokens = { telegram: boolean; bale: boolean };
type TargetResult = { channel: "telegram" | "bale"; chatId: string; ok: boolean; error?: string };

const fieldClass =
  "mt-2 w-full rounded-2xl border border-[#D7E2D9] bg-[#F7F8F6] px-3 py-3 text-sm leading-7 outline-none focus:border-brand";

export function MessengerPanel({
  initialSettings,
  tokens,
}: {
  initialSettings: MessengerNotifySettings;
  tokens: Tokens;
}) {
  const [enabled, setEnabled] = useState(initialSettings.enabled);
  const [appointments, setAppointments] = useState(initialSettings.appointments);
  const [consults, setConsults] = useState(initialSettings.consults);
  const [telegramEnabled, setTelegramEnabled] = useState(initialSettings.telegram.enabled);
  const [baleEnabled, setBaleEnabled] = useState(initialSettings.bale.enabled);
  const [telegramIds, setTelegramIds] = useState(initialSettings.telegram.chatIds.join("\n"));
  const [baleIds, setBaleIds] = useState(initialSettings.bale.chatIds.join("\n"));
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [results, setResults] = useState<TargetResult[]>([]);

  function payload() {
    return { enabled, appointments, consults, telegramEnabled, baleEnabled, telegramIds, baleIds };
  }

  async function save(event?: FormEvent) {
    event?.preventDefault();
    setPending("save");
    setError("");
    setSaved("");
    setResults([]);
    try {
      const response = await fetch("/api/clinic/messenger", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload()),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const rejected = [...(data.telegram ?? []), ...(data.bale ?? [])];
        setError(
          rejected.length
            ? `این شناسه‌ها قبول نشد: ${rejected.join("، ")}`
            : "ذخیره انجام نشد."
        );
        return false;
      }
      setTelegramIds((data.settings?.telegram?.chatIds ?? []).join("\n"));
      setBaleIds((data.settings?.bale?.chatIds ?? []).join("\n"));
      setSaved("ذخیره شد.");
      return true;
    } catch {
      setError("ارتباط با سرور قطع شد.");
      return false;
    } finally {
      setPending("");
    }
  }

  async function sendTest() {
    const ok = await save();
    if (!ok) return;
    setPending("test");
    setSaved("");
    try {
      const response = await fetch("/api/clinic/messenger", { method: "POST" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error === "no_targets" ? "هنوز شناسه‌ای برای ارسال نیست." : "پیام آزمایشی فرستاده نشد.");
        return;
      }
      setResults(data.results ?? []);
      setSaved("پیام آزمایشی برای شناسه‌های ذخیره‌شده فرستاده شد.");
    } catch {
      setError("ارتباط با سرور قطع شد.");
    } finally {
      setPending("");
    }
  }

  return (
    <form onSubmit={save} className="space-y-5">
      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6">
        <h2 className="text-base font-extrabold text-brand">چه وقت پیام برود</h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          نوبتی که از سایت ثبت شود و درخواست مشاوره آنلاین، جدا از لیست داخل برنامه، به تلگرام و بله هم می‌رود.
          می‌توانید چند شناسه بگذارید تا همان پیام برای چند نفر برود.
        </p>
        <div className="mt-4 space-y-3 text-sm font-bold text-brand">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={enabled} onChange={(event) => setEnabled(event.target.checked)} />
            اطلاع‌رسانی فعال باشد
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={appointments}
              onChange={(event) => setAppointments(event.target.checked)}
            />
            نوبت آنلاین
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={consults} onChange={(event) => setConsults(event.target.checked)} />
            مشاوره آنلاین
          </label>
        </div>
      </section>

      <ChannelCard
        title="تلگرام"
        enabled={telegramEnabled}
        onEnabled={setTelegramEnabled}
        ids={telegramIds}
        onIds={setTelegramIds}
        tokenReady={tokens.telegram}
        tokenName="TELEGRAM_BOT_TOKEN"
        hint="ربات را در BotFather بسازید. هر مدیر یک بار به ربات /start بزند. شناسه عددی را اینجا بنویسید؛ برای گروه معمولاً با علامت منفی شروع می‌شود."
      />
      <ChannelCard
        title="بله"
        enabled={baleEnabled}
        onEnabled={setBaleEnabled}
        ids={baleIds}
        onIds={setBaleIds}
        tokenReady={tokens.bale}
        tokenName="BALE_BOT_TOKEN"
        hint="بازو را در بله بسازید. هر مسئول یک بار به بازو پیام بدهد. شناسه گفتگو را هر کدام در یک خط بنویسید."
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending !== ""}
          className="inline-flex h-12 items-center rounded-2xl bg-[#14352A] px-5 text-sm font-extrabold text-white disabled:opacity-60"
        >
          {pending === "save" ? "در حال ذخیره..." : "ذخیره شناسه‌ها"}
        </button>
        <button
          type="button"
          disabled={pending !== ""}
          onClick={() => void sendTest()}
          className="inline-flex h-12 items-center rounded-2xl bg-[#F7F8F6] px-5 text-sm font-bold text-brand disabled:opacity-60"
        >
          {pending === "test" ? "در حال ارسال..." : "ارسال پیام آزمایشی"}
        </button>
      </div>
      {error ? <p className="text-sm font-medium text-rose-700">{error}</p> : null}
      {saved ? <p className="text-sm font-medium text-[#2F6B4F]">{saved}</p> : null}
      {results.length ? (
        <ul className="space-y-2">
          {results.map((item) => (
            <li key={`${item.channel}-${item.chatId}`} className="rounded-2xl bg-white px-4 py-3 text-sm">
              <span className="font-bold text-brand">{item.channel === "telegram" ? "تلگرام" : "بله"} · {item.chatId}</span>
              <span className={item.ok ? "text-[#2F6B4F]" : "text-rose-700"}>
                {item.ok ? " · رسید" : ` · ${item.error}`}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </form>
  );
}

function ChannelCard({
  title,
  enabled,
  onEnabled,
  ids,
  onIds,
  tokenReady,
  tokenName,
  hint,
}: {
  title: string;
  enabled: boolean;
  onEnabled: (value: boolean) => void;
  ids: string;
  onIds: (value: string) => void;
  tokenReady: boolean;
  tokenName: string;
  hint: string;
}) {
  return (
    <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-extrabold text-brand">{title}</h2>
        <p className={`text-xs font-bold ${tokenReady ? "text-[#2F6B4F]" : "text-[#9A6B10]"}`}>
          {tokenReady ? "توکن ربات روی سرور هست" : `توکن ${tokenName} روی سرور نیست`}
        </p>
      </div>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">{hint}</p>
      <label className="mt-4 flex items-center gap-2 text-sm font-bold text-brand">
        <input type="checkbox" checked={enabled} onChange={(event) => onEnabled(event.target.checked)} />
        ارسال به {title} فعال باشد
      </label>
      <label className="mt-4 block text-xs font-bold text-brand">
        شناسه‌ها، هر کدام یک خط
        <textarea value={ids} onChange={(event) => onIds(event.target.value)} rows={4} className={fieldClass} dir="ltr" />
      </label>
    </section>
  );
}

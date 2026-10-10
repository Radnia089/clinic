"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatJalaliDate } from "@/lib/jalali";
import {
  patientFullName,
  type Patient,
  type PatientInboxMessage,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const fieldClass =
  "rounded-xl border-[#D7E2D9] bg-[#F7F8F6] focus-visible:border-brand focus-visible:ring-brand/20";

export function PatientInboxManager({
  initialMessages,
  patients,
}: {
  initialMessages: PatientInboxMessage[];
  patients: Patient[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState<"all" | "selected">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const filteredPatients = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => {
      const name = patientFullName(p).toLowerCase();
      return name.includes(q) || p.phone.includes(q);
    });
  }, [patients, query]);

  function togglePatient(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setOk("");
    try {
      const res = await fetch("/api/patient-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          audience,
          patientIds: audience === "selected" ? selectedIds : [],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (data.error === "no_recipients") {
          throw new Error("حداقل یک مشتری انتخاب کنید.");
        }
        throw new Error("ارسال انجام نشد.");
      }
      setMessages((prev) => [data.message as PatientInboxMessage, ...prev]);
      setTitle("");
      setBody("");
      setSelectedIds([]);
      setAudience("all");
      setOk("پیام ارسال شد و در اپ مشتریان نمایش داده می‌شود.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال انجام نشد.");
    } finally {
      setSaving(false);
    }
  }

  function audienceLabel(message: PatientInboxMessage) {
    if (message.audience === "all") return "همه مشتریان";
    const n = message.patientIds?.length ?? 0;
    return `${new Intl.NumberFormat("fa-IR").format(n)} نفر`;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brand">پیام اپ مشتری</h1>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          پیام عمومی یا اختصاصی در صندوق پیام (زنگوله) اپ مشتری ارسال می‌شود.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-[1.75rem] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)]"
      >
        <div className="space-y-1.5">
          <Label>عنوان</Label>
          <Input
            className={cn(fieldClass, "h-11")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثلاً تعطیلی فردا"
          />
        </div>
        <div className="space-y-1.5">
          <Label>متن پیام</Label>
          <Textarea
            className={cn(fieldClass, "min-h-28")}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="متن پیام برای مشتری..."
          />
        </div>

        <div className="space-y-2">
          <Label>گیرندگان</Label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { id: "all", label: "همه مشتریان" },
                { id: "selected", label: "انتخاب افراد" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setAudience(item.id)}
                className={cn(
                  "h-11 rounded-xl text-sm font-bold transition",
                  audience === item.id
                    ? "bg-brand text-white"
                    : "bg-[#F7F8F6] text-brand"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {audience === "selected" ? (
          <div className="rounded-xl bg-[#F7F8F6] p-3">
            <Input
              className={cn(fieldClass, "mb-3 h-10")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو نام یا موبایل..."
            />
            <div className="max-h-48 space-y-1 overflow-y-auto">
              {filteredPatients.map((p) => {
                const checked = selectedIds.includes(p.id);
                const name = patientFullName(p) || "بدون نام";
                return (
                  <label
                    key={p.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 hover:bg-white"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePatient(p.id)}
                      className="size-4 accent-[#14352A]"
                    />
                    <span className="flex-1 text-sm font-medium">{name}</span>
                    <span className="text-xs text-muted-foreground" dir="ltr">
                      {p.phone}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {new Intl.NumberFormat("fa-IR").format(selectedIds.length)} نفر
              انتخاب شده
            </p>
          </div>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {ok ? <p className="text-sm text-[#2F6B4F]">{ok}</p> : null}

        <Button type="submit" disabled={saving} className="rounded-full">
          {saving ? (
            <>
              <Loader2 className="animate-spin" />
              در حال ارسال...
            </>
          ) : (
            <>
              <Send className="size-4" />
              ارسال پیام
            </>
          )}
        </Button>
      </form>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-brand">پیام‌های ارسال‌شده</h2>
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">هنوز پیامی ارسال نشده.</p>
        ) : (
          <ul className="space-y-3">
            {messages.map((message) => (
              <li
                key={message.id}
                className="rounded-2xl border border-[#EEF1EE] bg-white p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-extrabold text-brand">{message.title}</p>
                  <span className="rounded-full bg-[#E8F2EA] px-2.5 py-0.5 text-[10px] font-bold text-brand">
                    {audienceLabel(message)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {message.body}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {formatJalaliDate(message.createdAt, {
                    withMonthName: true,
                    withTime: true,
                  })}
                  {message.createdBy ? ` · ${message.createdBy}` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

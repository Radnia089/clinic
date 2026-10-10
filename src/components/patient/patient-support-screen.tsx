"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight, Headphones, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatJalaliDate } from "@/lib/jalali";
import {
  supportTicketCategoryLabel,
  supportTicketStatusLabel,
  type SupportTicket,
  type SupportTicketCategory,
} from "@/lib/types";
import { cn } from "@/lib/utils";

const CATEGORIES: SupportTicketCategory[] = [
  "appointment",
  "diet",
  "app",
  "billing",
  "other",
];

function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:+98${digits.replace(/^0/, "")}` : "tel:";
}

function statusTone(status: SupportTicket["status"]) {
  switch (status) {
    case "new":
      return "bg-[#F8E8E4] text-[#9A4E42]";
    case "in_progress":
      return "bg-[#E8F2EA] text-brand";
    case "resolved":
      return "bg-[#E7F3EA] text-[#2F6B4F]";
    case "closed":
      return "bg-[#EEF1EE] text-muted-foreground";
  }
}

export function PatientSupportScreen({
  clinicPhone,
}: {
  clinicPhone: string;
}) {
  const [items, setItems] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<SupportTicketCategory>("appointment");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function loadTickets() {
    const res = await fetch("/api/support-tickets", { cache: "no-store" });
    if (res.status === 401) {
      window.location.href = "/patient/login";
      return;
    }
    const data = await res.json().catch(() => ({}));
    setItems(data.items ?? []);
  }

  useEffect(() => {
    loadTickets()
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setOk("");
    try {
      const res = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, subject, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.error === "validation_failed"
            ? "موضوع و متن تیکت را کامل‌تر بنویسید."
            : "ارسال تیکت انجام نشد."
        );
      }
      setItems((prev) => [data.item as SupportTicket, ...prev]);
      setSubject("");
      setBody("");
      setCategory("appointment");
      setOk("تیکت ثبت شد. پشتیبانی کلینیک به‌زودی پاسخ می‌دهد.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "ارسال تیکت انجام نشد.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-[100svh] bg-[#F6F8F5]">
      <div className="mx-auto w-full max-w-[430px] space-y-5 px-4 pb-16 pt-6">
        <Link
          href="/patient"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#14352A]/70"
        >
          <ArrowRight className="size-4" />
          بازگشت
        </Link>

        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-10 items-center justify-center rounded-full bg-[#14352A] text-white">
              <Headphones className="size-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-brand">پشتیبانی</h1>
          </div>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            تماس تلفنی با کلینیک یا ثبت تیکت برای پیگیری در اپ مدیریت.
          </p>
        </div>

        <a
          href={telHref(clinicPhone)}
          className="flex items-center justify-between gap-3 rounded-[1.5rem] bg-[#E8F2EA] px-4 py-4 transition active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-white text-brand shadow-sm">
              <Phone className="size-5" />
            </span>
            <div>
              <p className="text-sm font-extrabold text-[#14352A]">تماس تلفنی</p>
              <p className="mt-0.5 text-xs text-[#1A2E26]/65" dir="ltr">
                {clinicPhone}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-brand">تماس</span>
        </a>

        <form
          onSubmit={onSubmit}
          className="space-y-3 rounded-[1.5rem] bg-white p-4 shadow-[0_6px_18px_rgba(35,70,55,0.06)]"
        >
          <p className="text-sm font-extrabold text-[#14352A]">ثبت تیکت پشتیبانی</p>
          <div className="space-y-1.5">
            <Label>موضوع</Label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as SupportTicketCategory)
              }
              className="h-11 w-full rounded-xl border border-[#D7E2D9] bg-[#F7F8F6] px-3 text-sm outline-none focus:border-brand"
            >
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {supportTicketCategoryLabel(item)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>عنوان</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="مثلاً مشکل رزرو نوبت"
              className="h-11 rounded-xl border-[#D7E2D9] bg-[#F7F8F6]"
              maxLength={120}
            />
          </div>
          <div className="space-y-1.5">
            <Label>توضیح</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="مشکل یا درخواستتان را بنویسید..."
              className="min-h-28 rounded-xl border-[#D7E2D9] bg-[#F7F8F6]"
              maxLength={2000}
            />
          </div>
          {error ? (
            <p className="text-sm text-rose-700">{error}</p>
          ) : null}
          {ok ? <p className="text-sm text-[#2F6B4F]">{ok}</p> : null}
          <Button
            type="submit"
            disabled={saving}
            className="h-11 w-full rounded-full bg-[#14352A] text-white hover:bg-[#1f4a3a]"
          >
            {saving ? "در حال ارسال..." : "ارسال تیکت"}
          </Button>
        </form>

        <section>
          <h2 className="text-base font-extrabold text-[#14352A]">تیکت‌های من</h2>
          {loading ? (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              در حال بارگذاری...
            </p>
          ) : items.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-white p-6 text-center text-sm text-muted-foreground">
              هنوز تیکتی ثبت نکرده‌اید.
            </p>
          ) : (
            <ul className="mt-3 space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-2xl bg-white p-4 shadow-[0_6px_18px_rgba(35,70,55,0.06)]"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-bold",
                        statusTone(item.status)
                      )}
                    >
                      {supportTicketStatusLabel(item.status)}
                    </span>
                    <span className="rounded-full bg-[#F7F8F6] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {supportTicketCategoryLabel(item.category)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-extrabold text-[#14352A]">
                    {item.subject}
                  </p>
                  <p className="mt-1 text-sm leading-7 text-[#1A2E26]/70">
                    {item.body}
                  </p>
                  {item.clinicReply ? (
                    <div className="mt-3 rounded-xl bg-[#E8F2EA] px-3 py-2.5">
                      <p className="text-[11px] font-bold text-brand">
                        پاسخ کلینیک
                      </p>
                      <p className="mt-1 text-sm leading-7 text-[#1A2E26]/75">
                        {item.clinicReply}
                      </p>
                    </div>
                  ) : null}
                  <p className="mt-3 text-[11px] text-muted-foreground">
                    {formatJalaliDate(item.createdAt, {
                      withMonthName: true,
                      withTime: true,
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

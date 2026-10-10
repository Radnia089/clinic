"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { formatJalaliDate } from "@/lib/jalali";
import type { PatientInboxMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

type InboxItem = PatientInboxMessage & { read: boolean };

export default function PatientInboxPage() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patient-auth/notifications", { cache: "no-store" })
      .then(async (r) => {
        if (r.status === 401) {
          window.location.href = "/patient/login";
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data) setItems(data.messages ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  async function markRead(messageId: string) {
    await fetch("/api/patient-auth/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId }),
    });
    setItems((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, read: true } : m))
    );
  }

  return (
    <div className="min-h-[100svh] bg-[#F6F8F5]">
      <div className="mx-auto w-full max-w-[430px] px-4 pb-16 pt-6">
        <Link
          href="/patient"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#14352A]/70"
        >
          <ArrowRight className="size-4" />
          بازگشت
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold text-brand">صندوق پیام</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          اطلاعیه‌ها و پیام‌های کلینیک
        </p>

        {loading ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            در حال بارگذاری...
          </p>
        ) : items.length === 0 ? (
          <p className="mt-8 rounded-2xl bg-white p-8 text-center text-sm text-muted-foreground">
            هنوز پیامی ندارید.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "rounded-2xl bg-white p-4 shadow-[0_6px_18px_rgba(35,70,55,0.06)]",
                  !item.read && "ring-2 ring-[#F0B429]/35"
                )}
                onClick={() => {
                  if (!item.read) void markRead(item.id);
                }}
              >
                <p className="font-extrabold text-[#14352A]">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-[#1A2E26]/70">
                  {item.body}
                </p>
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
      </div>
    </div>
  );
}

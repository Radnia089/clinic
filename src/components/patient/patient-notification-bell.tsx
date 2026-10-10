"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { formatJalaliDate } from "@/lib/jalali";
import type { PatientInboxMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

type InboxItem = PatientInboxMessage & { read: boolean };

export function PatientNotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InboxItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const rootRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch("/api/patient-auth/notifications", {
        cache: "no-store",
      });
      if (res.status === 401) return;
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.messages ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    function onVisible() {
      if (document.visibilityState === "visible") void load();
    }
    window.addEventListener("focus", load);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", load);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open]);

  async function markRead(messageId: string) {
    await fetch("/api/patient-auth/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId }),
    });
    setItems((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, read: true } : m))
    );
    setUnreadCount((n) => Math.max(0, n - 1));
  }

  async function markAllRead() {
    await fetch("/api/patient-auth/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setItems((prev) => prev.map((m) => ({ ...m, read: true })));
    setUnreadCount(0);
  }

  const badge =
    unreadCount > 0
      ? unreadCount > 9
        ? "۹+"
        : new Intl.NumberFormat("fa-IR").format(unreadCount)
      : null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          if (!open) void load();
        }}
        className={cn(
          "relative flex size-11 items-center justify-center rounded-2xl transition",
          open ? "bg-[#E8F2EA]" : "bg-white shadow-sm ring-1 ring-[#14352A]/08"
        )}
        aria-label="صندوق پیام"
        aria-expanded={open}
      >
        <Bell className="size-5 text-brand" />
        {badge ? (
          <span className="absolute -left-0.5 -top-0.5 flex min-w-[1.125rem] items-center justify-center rounded-full bg-[#D86B5C] px-1 text-[10px] font-bold text-white">
            {badge}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-[min(100vw-2rem,20rem)] origin-top-left rounded-[1.5rem] bg-white p-3 shadow-[0_14px_40px_rgba(20,53,42,0.18)] ring-1 ring-[#14352A]/08">
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <p className="text-sm font-extrabold text-brand">پیام‌ها</p>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-[11px] font-bold text-[#14352A]/55"
              >
                همه خوانده شد
              </button>
            ) : null}
          </div>

          {loading ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              ...
            </p>
          ) : items.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              پیامی ندارید.
            </p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {items.slice(0, 8).map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!item.read) void markRead(item.id);
                    }}
                    className={cn(
                      "w-full rounded-xl px-3 py-2.5 text-right transition hover:bg-[#F7F8F6]",
                      !item.read && "bg-[#E8F2EA]/60"
                    )}
                  >
                    <p className="text-sm font-bold text-[#14352A]">
                      {item.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-6 text-[#1A2E26]/65">
                      {item.body}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatJalaliDate(item.createdAt, {
                        withMonthName: true,
                        withTime: true,
                      })}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/patient/inbox"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-xl py-2.5 text-center text-sm font-bold text-brand hover:bg-[#F7F8F6]"
          >
            مشاهده همه
          </Link>
        </div>
      ) : null}
    </div>
  );
}

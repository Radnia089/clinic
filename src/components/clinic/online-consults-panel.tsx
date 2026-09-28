"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Phone, Check, X, CalendarClock } from "lucide-react";
import { EmptyState, StatusBadge } from "@/components/clinic/page-header";
import { ShamsiDateInput } from "@/components/ui/shamsi-date-input";
import { Button } from "@/components/ui/button";
import {
  formatDateFa,
  genderLabel,
  onlineConsultStatusLabel,
  type OnlineConsultRequest,
} from "@/lib/types";
import { jalaliPartsToIsoDate, todayJalaliParts } from "@/lib/jalali";
import { cn } from "@/lib/utils";

function toneForStatus(status: OnlineConsultRequest["status"]) {
  switch (status) {
    case "new":
      return "warning" as const;
    case "scheduled":
      return "info" as const;
    case "completed":
      return "success" as const;
    case "cancelled":
      return "danger" as const;
  }
}

export function OnlineConsultsPanel({
  initialItems,
}: {
  initialItems: OnlineConsultRequest[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [scheduleDraft, setScheduleDraft] = useState<
    Record<string, { date: string; time: string }>
  >({});

  function draftFor(id: string) {
    return (
      scheduleDraft[id] ?? {
        date: jalaliPartsToIsoDate(todayJalaliParts()),
        time: "17:30",
      }
    );
  }

  async function runAction(
    id: string,
    body: Record<string, unknown>,
    optimistic?: Partial<OnlineConsultRequest>
  ) {
    setBusyId(id);
    setMessage("");
    const previous = items;
    if (optimistic) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...optimistic } : item))
      );
    }
    try {
      const res = await fetch("/api/online-consults", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "failed");
      if (data.item) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? data.item : item))
        );
      }
      if (body.action === "schedule") {
        setMessage(
          data.sms?.ok
            ? "نوبت رزرو شد و پیامک تأیید ارسال شد."
            : "نوبت رزرو شد؛ ارسال پیامک با مشکل روبه‌رو شد."
        );
      }
      router.refresh();
    } catch {
      setItems(previous);
      setMessage("عملیات انجام نشد. دوباره تلاش کنید.");
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="درخواست مشاوره آنلاینی نیست"
        hint="وقتی مشتری از اپ درخواست بدهد، اینجا برای رزرو وقت و تماس می‌آید."
      />
    );
  }

  return (
    <div className="space-y-4">
      {message ? (
        <p className="rounded-2xl bg-[#E8F2EA] px-4 py-3 text-sm text-brand">
          {message}
        </p>
      ) : null}

      {items.map((item) => {
        const draft = draftFor(item.id);
        const busy = busyId === item.id;
        return (
          <article
            key={item.id}
            className={cn(
              "rounded-[28px] border border-border/80 bg-card/95 p-5 shadow-sm",
              busy && "opacity-70"
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-lg font-extrabold text-brand">{item.name}</p>
                <a
                  href={`tel:${item.phone}`}
                  className="mt-1 inline-block dir-ltr text-sm text-muted-foreground hover:text-brand"
                  dir="ltr"
                >
                  {item.phone}
                </a>
              </div>
              <StatusBadge tone={toneForStatus(item.status)}>
                {onlineConsultStatusLabel(item.status)}
              </StatusBadge>
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-muted-foreground">سن</dt>
                <dd className="font-medium">{item.age ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">جنسیت</dt>
                <dd className="font-medium">
                  {item.gender ? genderLabel(item.gender) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">قد</dt>
                <dd className="font-medium">
                  {item.heightCm ? `${item.heightCm} سانتی‌متر` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">وزن</dt>
                <dd className="font-medium">
                  {item.weightKg ? `${item.weightKg} کیلوگرم` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">دور کمر</dt>
                <dd className="font-medium">
                  {item.waistCm ? `${item.waistCm} سانتی‌متر` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">دور باسن</dt>
                <dd className="font-medium">
                  {item.hipCm ? `${item.hipCm} سانتی‌متر` : "—"}
                </dd>
              </div>
            </dl>

            {item.note ? (
              <p className="mt-3 rounded-2xl bg-[#F7F8F6] px-3 py-2 text-sm leading-7 text-foreground/80">
                {item.note}
              </p>
            ) : null}

            {item.preferredDate ? (
              <p className="mt-2 text-xs text-muted-foreground">
                تاریخ پیشنهادی مشتری: {formatDateFa(item.preferredDate)}
              </p>
            ) : null}

            {item.scheduledDate && item.scheduledTime ? (
              <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-brand">
                <CalendarClock className="size-4" />
                نوبت رزرو شده: {formatDateFa(item.scheduledDate)} • ساعت{" "}
                {item.scheduledTime}
                {item.smsNotifiedAt ? " · پیامک ارسال شد" : ""}
              </p>
            ) : null}

            {item.status !== "completed" && item.status !== "cancelled" ? (
              <div className="mt-4 space-y-3 rounded-2xl bg-[#F7F8F6] p-3">
                <p className="text-xs font-bold text-brand">رزرو وقت تماس</p>
                <div className="grid gap-3 sm:grid-cols-[1fr_7rem_auto]">
                  <ShamsiDateInput
                    value={draft.date}
                    onChange={(date) =>
                      setScheduleDraft((prev) => ({
                        ...prev,
                        [item.id]: { ...draftFor(item.id), date },
                      }))
                    }
                  />
                  <input
                    type="time"
                    value={draft.time}
                    onChange={(e) =>
                      setScheduleDraft((prev) => ({
                        ...prev,
                        [item.id]: {
                          ...draftFor(item.id),
                          time: e.target.value,
                        },
                      }))
                    }
                    className="h-12 rounded-2xl border border-[#D7E2D9] bg-white px-3 text-sm"
                  />
                  <Button
                    type="button"
                    disabled={busy}
                    className="h-12 rounded-2xl bg-brand text-white"
                    onClick={() =>
                      runAction(
                        item.id,
                        {
                          action: "schedule",
                          scheduledDate: draft.date,
                          scheduledTime: draft.time,
                        },
                        {
                          status: "scheduled",
                          scheduledDate: draft.date,
                          scheduledTime: draft.time,
                        }
                      )
                    }
                  >
                    رزرو و پیامک
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <a
                href={`tel:${item.phone}`}
                onClick={() => {
                  void runAction(item.id, { action: "start_call" }, {
                    callStartedAt: new Date().toISOString(),
                  });
                }}
                className="inline-flex h-10 items-center gap-1.5 rounded-2xl bg-[#E8F2EA] px-3 text-sm font-bold text-brand"
              >
                <Phone className="size-4" />
                تماس از کلینیک
              </a>
              <button
                type="button"
                disabled={busy}
                className="inline-flex h-10 items-center gap-1.5 rounded-2xl bg-[#2F9E5A] px-3 text-sm font-bold text-white"
                onClick={() =>
                  runAction(
                    item.id,
                    { action: "set_status", status: "completed" },
                    { status: "completed" }
                  )
                }
              >
                <Check className="size-4" />
                انجام شد
              </button>
              <button
                type="button"
                disabled={busy}
                className="inline-flex h-10 items-center gap-1.5 rounded-2xl bg-white px-3 text-sm font-bold text-[#C45C5C] ring-1 ring-[#C45C5C]/30"
                onClick={() =>
                  runAction(
                    item.id,
                    { action: "set_status", status: "cancelled" },
                    { status: "cancelled" }
                  )
                }
              >
                <X className="size-4" />
                لغو
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

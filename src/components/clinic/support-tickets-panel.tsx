"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Phone } from "lucide-react";
import { EmptyState, StatusBadge } from "@/components/clinic/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatJalaliDate } from "@/lib/jalali";
import {
  supportTicketCategoryLabel,
  supportTicketStatusLabel,
  type SupportTicket,
  type SupportTicketStatus,
} from "@/lib/types";
import { cn } from "@/lib/utils";

function toneForStatus(status: SupportTicketStatus) {
  switch (status) {
    case "new":
      return "warning" as const;
    case "in_progress":
      return "info" as const;
    case "resolved":
      return "success" as const;
    case "closed":
      return "default" as const;
  }
}

function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `tel:+98${digits.replace(/^0/, "")}` : "tel:";
}

export function SupportTicketsPanel({
  initialItems,
}: {
  initialItems: SupportTicket[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [filter, setFilter] = useState<"open" | "all">("open");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  const visible = useMemo(() => {
    if (filter === "all") return items;
    return items.filter(
      (item) => item.status === "new" || item.status === "in_progress"
    );
  }, [items, filter]);

  async function patchTicket(
    id: string,
    body: Record<string, unknown>,
    optimistic?: Partial<SupportTicket>
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
      const res = await fetch("/api/support-tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "failed");
      if (data.item) {
        setItems((prev) =>
          prev.map((item) => (item.id === id ? data.item : item))
        );
      }
      setMessage("ذخیره شد.");
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
        title="تیکت پشتیبانی نیست"
        hint="وقتی مشتری از اپ تیکت بزند، اینجا دیده می‌شود."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("open")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-bold",
            filter === "open"
              ? "bg-brand text-white"
              : "border border-[#D7E2D9] bg-white text-brand"
          )}
        >
          بازها
        </button>
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full px-3 py-1.5 text-xs font-bold",
            filter === "all"
              ? "bg-brand text-white"
              : "border border-[#D7E2D9] bg-white text-brand"
          )}
        >
          همه
        </button>
        {message ? (
          <p className="text-xs text-muted-foreground">{message}</p>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <EmptyState title="تیکت بازی نیست" hint="همه تیکت‌ها بسته یا حل شده‌اند." />
      ) : (
        <ul className="space-y-4">
          {visible.map((item) => {
            const busy = busyId === item.id;
            return (
              <li
                key={item.id}
                className="rounded-[1.75rem] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge tone={toneForStatus(item.status)}>
                        {supportTicketStatusLabel(item.status)}
                      </StatusBadge>
                      <span className="rounded-full bg-[#F7F8F6] px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                        {supportTicketCategoryLabel(item.category)}
                      </span>
                    </div>
                    <p className="mt-2 text-base font-extrabold text-brand">
                      {item.subject}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.patientName} ·{" "}
                      <span dir="ltr">{item.phone}</span>
                    </p>
                  </div>
                  <a
                    href={telHref(item.phone)}
                    className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#E8F2EA] px-3 text-xs font-bold text-brand"
                  >
                    <Phone className="size-3.5" />
                    تماس با مشتری
                  </a>
                </div>

                <p className="mt-3 text-sm leading-7 text-[#1A2E26]/75">
                  {item.body}
                </p>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {formatJalaliDate(item.createdAt, {
                    withMonthName: true,
                    withTime: true,
                  })}
                </p>

                <div className="mt-4 space-y-2">
                  <Textarea
                    value={replies[item.id] ?? item.clinicReply ?? ""}
                    onChange={(e) =>
                      setReplies((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    placeholder="پاسخ کوتاه برای مشتری..."
                    className="min-h-20 rounded-xl border-[#D7E2D9] bg-[#F7F8F6]"
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      disabled={busy}
                      className="rounded-full"
                      onClick={() =>
                        patchTicket(item.id, {
                          clinicReply: replies[item.id] ?? item.clinicReply ?? "",
                          status:
                            item.status === "new" ? "in_progress" : item.status,
                        })
                      }
                    >
                      ذخیره پاسخ
                    </Button>
                    {item.status === "new" ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        className="rounded-full"
                        onClick={() =>
                          patchTicket(
                            item.id,
                            { status: "in_progress" },
                            { status: "in_progress" }
                          )
                        }
                      >
                        شروع پیگیری
                      </Button>
                    ) : null}
                    {item.status !== "resolved" ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={busy}
                        className="rounded-full"
                        onClick={() =>
                          patchTicket(
                            item.id,
                            {
                              status: "resolved",
                              clinicReply:
                                replies[item.id] ?? item.clinicReply ?? "",
                            },
                            { status: "resolved" }
                          )
                        }
                      >
                        حل‌شده
                      </Button>
                    ) : null}
                    {item.status !== "closed" ? (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={busy}
                        className="rounded-full"
                        onClick={() =>
                          patchTicket(
                            item.id,
                            { status: "closed" },
                            { status: "closed" }
                          )
                        }
                      >
                        بستن
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VisitStatus } from "@/lib/types";

export function AttendanceButtons({
  status,
  onChange,
  size = "md",
  withLabels = false,
}: {
  status: VisitStatus;
  onChange: (status: VisitStatus) => void;
  size?: "xs" | "sm" | "md";
  /** برچسب متنی کنار دکمه‌ها برای وضوح بیشتر در لیست‌ها */
  withLabels?: boolean;
}) {
  const attended = status === "completed" || status === "admitted";
  const cancelled = status === "cancelled";
  const btn = size === "xs" ? "size-6" : size === "sm" ? "size-7" : "size-8";
  const icon = size === "xs" ? "size-3" : size === "sm" ? "size-3.5" : "size-4";

  return (
    <div className="flex flex-wrap items-center gap-1.5" data-attend-btn>
      <button
        type="button"
        title="مراجعه کرد"
        className={cn(
          "inline-flex items-center justify-center gap-1 rounded-xl transition",
          withLabels ? "h-8 px-2.5" : btn,
          attended
            ? "bg-[#2F9E5A] text-white"
            : "bg-white text-[#2F9E5A] ring-1 ring-[#2F9E5A]/35 hover:bg-[#2F9E5A] hover:text-white"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onChange("completed");
        }}
      >
        <Check className={cn(icon, "stroke-[3]")} />
        {withLabels ? (
          <span className="text-[11px] font-bold">مراجعه کرد</span>
        ) : null}
      </button>
      <button
        type="button"
        title="لغو / نیامد"
        className={cn(
          "inline-flex items-center justify-center gap-1 rounded-xl transition",
          withLabels ? "h-8 px-2.5" : btn,
          cancelled
            ? "bg-[#C45C5C] text-white"
            : "bg-white text-[#C45C5C] ring-1 ring-[#C45C5C]/35 hover:bg-[#C45C5C] hover:text-white"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onChange("cancelled");
        }}
      >
        <X className={cn(icon, "stroke-[3]")} />
        {withLabels ? (
          <span className="text-[11px] font-bold">نیامد</span>
        ) : null}
      </button>
    </div>
  );
}

export function AttendanceMark({ status }: { status: VisitStatus }) {
  const attended = status === "completed" || status === "admitted";
  const cancelled = status === "cancelled";
  if (attended) {
    return (
      <span
        className="inline-flex size-5 items-center justify-center rounded-full bg-[#2F9E5A] text-white"
        title="مراجعه کرد"
      >
        <Check className="size-3.5 stroke-[3]" />
      </span>
    );
  }
  if (cancelled) {
    return (
      <span
        className="inline-flex size-5 items-center justify-center rounded-full bg-[#C45C5C] text-white"
        title="لغو / نیامد"
      >
        <X className="size-3.5 stroke-[3]" />
      </span>
    );
  }
  return null;
}

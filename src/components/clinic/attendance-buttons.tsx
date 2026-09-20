"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { VisitStatus } from "@/lib/types";

export function AttendanceButtons({
  status,
  onChange,
  size = "md",
}: {
  status: VisitStatus;
  onChange: (status: VisitStatus) => void;
  size?: "sm" | "md";
}) {
  const attended = status === "completed" || status === "admitted";
  const cancelled = status === "cancelled";
  const btn = size === "sm" ? "size-6" : "size-7";
  const icon = size === "sm" ? "size-3.5" : "size-4";

  return (
    <div className="flex items-center gap-1.5" data-attend-btn>
      <button
        type="button"
        title="مراجعه کرد"
        className={cn(
          "inline-flex items-center justify-center rounded-lg transition",
          btn,
          attended
            ? "bg-[#2F9E5A] text-white"
            : "bg-white text-[#2F9E5A] ring-1 ring-[#2F9E5A]/30 hover:bg-[#2F9E5A] hover:text-white"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onChange("completed");
        }}
      >
        <Check className={cn(icon, "stroke-[3]")} />
      </button>
      <button
        type="button"
        title="لغو / نیامد"
        className={cn(
          "inline-flex items-center justify-center rounded-lg transition",
          btn,
          cancelled
            ? "bg-[#C45C5C] text-white"
            : "bg-white text-[#C45C5C] ring-1 ring-[#C45C5C]/30 hover:bg-[#C45C5C] hover:text-white"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onChange("cancelled");
        }}
      >
        <X className={cn(icon, "stroke-[3]")} />
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

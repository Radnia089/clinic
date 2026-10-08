"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogOut, PencilLine } from "lucide-react";
import {
  patientAvatarSrc,
  patientFullName,
  type Patient,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function PatientUserMenu({ patient }: { patient: Patient | null }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstName = patient?.firstName?.trim() || "دوست";
  const fullName = patient ? patientFullName(patient) : "";
  const phone = patient?.phone || "";
  const avatarSrc = patient
    ? patientAvatarSrc(patient)
    : "/avatars/female.svg";

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (rootRef.current && target && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function logout() {
    await fetch("/api/patient-auth/logout", { method: "POST" });
    window.location.href = "/patient/login";
  }

  return (
    <div ref={rootRef} className="relative text-left">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "rounded-full px-2 py-1 transition",
          open ? "bg-[#E8F2EA]" : "hover:bg-[#E8F2EA]/70"
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <p className="text-sm font-bold text-brand">سلام {firstName} 🍃</p>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute left-0 top-[calc(100%+0.45rem)] z-50 w-[13.5rem] origin-top-left animate-in fade-in-0 zoom-in-95"
        >
          <div className="relative rounded-[1.75rem] bg-white p-3 shadow-[0_14px_40px_rgba(20,53,42,0.18)] ring-1 ring-[#14352A]/08">
            <span className="absolute -top-1.5 left-6 size-3 rotate-45 rounded-sm bg-white ring-1 ring-[#14352A]/08" />

            <div className="relative z-10 mb-2 flex flex-col items-center px-1 pb-2 pt-1 text-center">
              <div className="relative size-16 overflow-hidden rounded-full bg-[#E8F2EA] ring-2 ring-[#F0B429]/35">
                <Image
                  src={avatarSrc}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized={avatarSrc.endsWith(".svg")}
                />
              </div>
              {fullName ? (
                <p className="mt-2 text-sm font-extrabold text-[#14352A]">
                  {fullName}
                </p>
              ) : null}
              {phone ? (
                <p className="mt-0.5 text-xs font-semibold text-[#14352A]/65" dir="ltr">
                  {phone}
                </p>
              ) : null}
            </div>

            <div className="relative z-10 border-t border-[#EEF1EE] pt-2">
              <Link
                href="/patient/profile"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-bold text-[#14352A] transition hover:bg-[#E8F2EA]"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-[#E8F2EA]">
                  <PencilLine className="size-3.5" />
                </span>
                ویرایش اطلاعات
              </Link>
              <button
                type="button"
                role="menuitem"
                onClick={() => void logout()}
                className="mt-1 flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-bold text-[#9A4E42] transition hover:bg-[#FBEFE8]"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-[#FBEFE8]">
                  <LogOut className="size-3.5" />
                </span>
                خروج
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

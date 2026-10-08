"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Smartphone, CheckCircle2, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatDateFa,
  genderLabel,
  patientFullName,
  type Patient,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function AppSignupsPanel() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/patients?source=app");
      const data = await res.json();
      setPatients(data.patients ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => undefined);
  }, []);

  async function markReviewed(id: string) {
    setSavingId(id);
    try {
      const res = await fetch("/api/patients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, appReviewed: true }),
      });
      if (!res.ok) throw new Error("fail");
      await load();
    } finally {
      setSavingId("");
    }
  }

  const pending = patients.filter((p) => !p.appReviewedAt);
  const done = patients.filter((p) => p.appReviewedAt);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium text-muted-foreground">مدیریت مشتریان اپ</p>
        <h1 className="mt-1 text-2xl font-extrabold text-brand">ثبت‌نام از اپ</h1>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
          کسانی که بدون مراجعه حضوری اپ را نصب کرده‌اند و با OTP ثبت‌نام کرده‌اند اینجا
          دیده می‌شوند. اطلاعات تکمیلی‌شان هم در همین پرونده ذخیره می‌شود.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="کل ثبت‌نام اپ"
          value={patients.length}
          tone="green"
          icon={Smartphone}
        />
        <StatCard
          label="در انتظار بررسی"
          value={pending.length}
          tone="amber"
          icon={Clock3}
        />
        <StatCard
          label="بررسی‌شده"
          value={done.length}
          tone="mint"
          icon={CheckCircle2}
        />
      </div>

      {loading ? (
        <div className="rounded-[28px] bg-white p-8 text-center text-sm text-muted-foreground">
          در حال بارگذاری...
        </div>
      ) : patients.length === 0 ? (
        <div className="rounded-[28px] bg-white p-8 text-center">
          <p className="text-sm font-bold text-brand">هنوز ثبت‌نام اپی نیست</p>
          <p className="mt-2 text-sm text-muted-foreground">
            وقتی کسی از مسیر OTP اپ وارد شود، اینجا ظاهر می‌شود.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {patients.map((patient) => {
            const incomplete = !patient.profileComplete;
            const reviewed = Boolean(patient.appReviewedAt);
            return (
              <li
                key={patient.id}
                className={cn(
                  "rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)]",
                  incomplete && "ring-1 ring-[#F0B429]/35"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-extrabold text-brand">
                        {patientFullName(patient) || "بدون نام"}
                      </h2>
                      <span className="rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-[10px] font-bold text-[#3B5BDB]">
                        ثبت‌نام اپ
                      </span>
                      {incomplete ? (
                        <span className="rounded-full bg-[#FFF4D6] px-2.5 py-0.5 text-[10px] font-bold text-[#9A6B10]">
                          پروفایل ناقص
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#E8F2EA] px-2.5 py-0.5 text-[10px] font-bold text-[#2F6B4F]">
                          پروفایل کامل
                        </span>
                      )}
                      {reviewed ? (
                        <span className="rounded-full bg-[#F7F8F6] px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                          بررسی‌شده
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#FBEFE8] px-2.5 py-0.5 text-[10px] font-bold text-[#D86B5C]">
                          نیاز به بررسی
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground" dir="ltr">
                      {patient.phone}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      ثبت: {formatDateFa(patient.createdAt)}
                      {" · "}
                      آخرین تغییر: {formatDateFa(patient.updatedAt)}
                      {patient.age != null ? ` · سن ${patient.age}` : ""}
                      {` · ${genderLabel(patient.gender)}`}
                      {patient.heightCm != null ? ` · قد ${patient.heightCm} cm` : ""}
                      {patient.goalWeightKg != null
                        ? ` · هدف ${patient.goalWeightKg} kg`
                        : ""}
                    </p>
                    {patient.address ? (
                      <p className="mt-1 text-xs text-muted-foreground">{patient.address}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/clinic/reception/customers/${patient.id}`}
                      className="inline-flex h-10 items-center rounded-full bg-[#14352A] px-4 text-sm font-bold text-white"
                    >
                      باز کردن پرونده
                    </Link>
                    {!reviewed ? (
                      <Button
                        type="button"
                        variant="outline"
                        disabled={savingId === patient.id}
                        className="h-10 rounded-full"
                        onClick={() => markReviewed(patient.id)}
                      >
                        {savingId === patient.id ? "..." : "علامت بررسی‌شد"}
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

function StatCard({
  label,
  value,
  tone,
  icon: Icon,
}: {
  label: string;
  value: number;
  tone: "green" | "amber" | "mint";
  icon: typeof Smartphone;
}) {
  return (
    <div
      className={cn(
        "rounded-[24px] p-4",
        tone === "green" && "bg-[#E8F2EA]",
        tone === "amber" && "bg-[#FFF4D6]",
        tone === "mint" && "bg-[#F0F7F3]"
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <Icon className="size-4 text-brand/70" />
      </div>
      <p className="mt-2 text-2xl font-extrabold text-brand">
        {new Intl.NumberFormat("fa-IR").format(value)}
      </p>
    </div>
  );
}

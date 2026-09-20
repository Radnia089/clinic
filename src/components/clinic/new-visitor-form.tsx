"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Gender, VisitType } from "@/lib/types";

const fieldClass =
  "h-12 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6] px-3 text-base focus-visible:border-brand focus-visible:ring-brand/20";

export function NewVisitorForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>("female");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [visitDate, setVisitDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [visitType, setVisitType] = useState<VisitType>("consultation");
  const [packageName, setPackageName] = useState("پکیج لاغری استاندارد");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const patientRes = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          age: Number(age),
          gender,
          phone,
          address,
          notes,
        }),
      });

      let patientId: string | null = null;

      if (patientRes.status === 409) {
        const data = await patientRes.json();
        patientId = data.patient?.id ?? null;
      } else if (!patientRes.ok) {
        throw new Error("patient");
      } else {
        const data = await patientRes.json();
        patientId = data.patient.id;
      }

      if (!patientId) throw new Error("patient");

      const visitRes = await fetch("/api/visits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          visitDate,
          visitType,
          packageName: visitType === "package" ? packageName : undefined,
          status: "visitor",
        }),
      });

      if (!visitRes.ok) throw new Error("visit");
      const visitData = await visitRes.json();
      router.push(`/clinic/reception/admission/${visitData.visit.id}`);
      router.refresh();
    } catch {
      setError("ثبت اطلاعات انجام نشد. لطفاً فیلدها را بررسی و دوباره تلاش کنید.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6">
        <div className="mb-4 rounded-2xl bg-[#E8F2EA] px-4 py-3">
          <p className="text-sm font-bold text-brand">۱ · اطلاعات عمومی مشتری</p>
          <p className="mt-1 text-xs text-muted-foreground">
            اگر اولین مراجعه است، این مشخصات را کامل ثبت کنید.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>نام</Label>
            <Input className={fieldClass} value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>نام خانوادگی</Label>
            <Input className={fieldClass} value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>سن</Label>
            <Input className={fieldClass} type="number" min={1} max={120} value={age} onChange={(e) => setAge(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>جنسیت</Label>
            <select
              className={`w-full ${fieldClass}`}
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
            >
              <option value="female">زن</option>
              <option value="male">مرد</option>
              <option value="other">سایر</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label>شماره موبایل</Label>
            <Input
              dir="ltr"
              className={`${fieldClass} text-left`}
              placeholder="0913xxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>آدرس</Label>
            <Textarea
              className="min-h-20 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6] focus-visible:border-brand focus-visible:ring-brand/20"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>توضیح عمومی (اختیاری)</Label>
            <Textarea
              className="min-h-20 rounded-2xl border-[#D7E2D9] bg-[#F7F8F6] focus-visible:border-brand focus-visible:ring-brand/20"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6">
        <div className="mb-4 rounded-2xl bg-[#F6E6E1] px-4 py-3">
          <p className="text-sm font-bold text-[#9A4E42]">۲ · ثبت مراجعه امروز</p>
          <p className="mt-1 text-xs text-[#9A4E42]/80">تاریخ و نوع خدمت را مشخص کنید.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>تاریخ مراجعه</Label>
            <Input
              type="date"
              className={fieldClass}
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label>نوع مراجعه</Label>
            <select
              className={`w-full ${fieldClass}`}
              value={visitType}
              onChange={(e) => setVisitType(e.target.value as VisitType)}
            >
              <option value="consultation">ویزیت</option>
              <option value="package">پکیج لاغری</option>
            </select>
          </div>
          {visitType === "package" ? (
            <div className="space-y-2 sm:col-span-2">
              <Label>نام پکیج</Label>
              <Input
                className={fieldClass}
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                required
              />
            </div>
          ) : null}
        </div>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-2xl bg-[#D86B5C] text-base font-semibold text-white hover:bg-[#D86B5C]/90 sm:w-auto sm:px-8"
      >
        {loading ? "در حال ثبت..." : "ثبت و ادامه فرم پذیرش"}
      </Button>
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Gender, VisitType } from "@/lib/types";

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
  const [visitDate, setVisitDate] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
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
    <form
      onSubmit={onSubmit}
      className="space-y-8 rounded-3xl border border-border/80 bg-card/90 p-5 shadow-sm sm:p-8"
    >
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-brand">اطلاعات عمومی مشتری</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">نام</Label>
            <Input
              id="firstName"
              className="h-11 rounded-xl"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">نام خانوادگی</Label>
            <Input
              id="lastName"
              className="h-11 rounded-xl"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="age">سن</Label>
            <Input
              id="age"
              type="number"
              min={1}
              max={120}
              className="h-11 rounded-xl"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">جنسیت</Label>
            <select
              id="gender"
              className="h-11 w-full rounded-xl border border-input bg-transparent px-3"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
            >
              <option value="female">زن</option>
              <option value="male">مرد</option>
              <option value="other">سایر</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">شماره موبایل</Label>
            <Input
              id="phone"
              dir="ltr"
              className="h-11 rounded-xl text-left"
              placeholder="0913xxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address">آدرس</Label>
            <Textarea
              id="address"
              className="min-h-20 rounded-xl"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">توضیح عمومی (اختیاری)</Label>
            <Textarea
              id="notes"
              className="min-h-20 rounded-xl"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 border-t border-border/70 pt-6">
        <h3 className="text-lg font-semibold text-brand">ثبت مراجعه</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="visitDate">تاریخ مراجعه</Label>
            <Input
              id="visitDate"
              type="date"
              className="h-11 rounded-xl"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visitType">نوع مراجعه</Label>
            <select
              id="visitType"
              className="h-11 w-full rounded-xl border border-input bg-transparent px-3"
              value={visitType}
              onChange={(e) => setVisitType(e.target.value as VisitType)}
            >
              <option value="consultation">ویزیت</option>
              <option value="package">پکیج لاغری</option>
            </select>
          </div>
          {visitType === "package" ? (
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="packageName">نام پکیج</Label>
              <Input
                id="packageName"
                className="h-11 rounded-xl"
                value={packageName}
                onChange={(e) => setPackageName(e.target.value)}
                required
              />
            </div>
          ) : null}
        </div>
      </section>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        disabled={loading}
        className="h-12 w-full rounded-xl bg-cta text-base text-cta-foreground hover:bg-cta/90 sm:w-auto sm:px-8"
      >
        {loading ? "در حال ثبت..." : "ثبت و ادامه فرم پذیرش"}
      </Button>
    </form>
  );
}

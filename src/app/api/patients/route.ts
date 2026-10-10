import { NextResponse } from "next/server";
import {
  createPatient,
  findPatientByPhone,
  listAppSignups,
  listPatients,
  updatePatient,
} from "@/lib/store";
import { normalizeIntegerInput, parseNormalizedNumber } from "@/lib/digits";
import { citiesForProvince } from "@/lib/iran-locations";
import { ageFromIsoBirthDate } from "@/lib/jalali";
import {
  isValidNationalId,
  normalizeNationalId,
} from "@/lib/national-id";
import { sendWelcomeSms } from "@/lib/welcome-sms";
import type { Gender, Patient } from "@/lib/types";

function parseOptionalNumber(raw: unknown) {
  if (raw === undefined || raw === null || raw === "") return undefined;
  const n = parseNormalizedNumber(String(raw));
  return Number.isFinite(n) ? n : NaN;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const source = searchParams.get("source");
  if (source === "app") {
    const patients = await listAppSignups();
    return NextResponse.json({ patients });
  }
  const patients = await listPatients();
  if (id) {
    const patient = patients.find((p) => p.id === id) ?? null;
    if (!patient) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ patient });
  }
  return NextResponse.json({ patients });
}

export async function POST(request: Request) {
  const body = await request.json();
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();
  const ageRaw = String(body.age ?? "").trim();
  const ageParsed = ageRaw ? parseNormalizedNumber(ageRaw) : undefined;
  const gender = (body.gender as Gender) || "female";
  const phone = normalizeIntegerInput(String(body.phone ?? ""));
  const nationalIdRaw = String(body.nationalId ?? "").trim();
  const nationalId = nationalIdRaw
    ? normalizeNationalId(nationalIdRaw)
    : undefined;
  const address = String(body.address ?? "").trim();
  const notes = String(body.notes ?? "").trim();
  const heightCm = parseOptionalNumber(body.heightCm);
  const goalWeightKg = parseOptionalNumber(body.goalWeightKg);

  // فقط نام‌خانوادگی و موبایل اجباری‌اند
  if (!lastName || !/^09\d{9}$/.test(phone)) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }
  if (nationalId && !isValidNationalId(nationalId)) {
    return NextResponse.json({ error: "invalid_national_id" }, { status: 400 });
  }

  if (
    ageParsed != null &&
    (!Number.isFinite(ageParsed) || ageParsed < 1 || ageParsed > 120)
  ) {
    return NextResponse.json({ error: "invalid_age" }, { status: 400 });
  }

  if (!["female", "male", "other"].includes(gender)) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  if (heightCm !== undefined && (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 230)) {
    return NextResponse.json({ error: "invalid_height" }, { status: 400 });
  }
  if (
    goalWeightKg !== undefined &&
    (!Number.isFinite(goalWeightKg) || goalWeightKg < 30 || goalWeightKg > 250)
  ) {
    return NextResponse.json({ error: "invalid_goal" }, { status: 400 });
  }

  const existing = await findPatientByPhone(phone);
  if (existing) {
    return NextResponse.json(
      { error: "phone_exists", patient: existing },
      { status: 409 }
    );
  }

  const patient = await createPatient({
    firstName,
    lastName,
    age: ageParsed,
    gender,
    phone,
    nationalId,
    address,
    notes: notes || undefined,
    heightCm: heightCm !== undefined && Number.isFinite(heightCm) ? heightCm : undefined,
    goalWeightKg:
      goalWeightKg !== undefined && Number.isFinite(goalWeightKg)
        ? goalWeightKg
        : undefined,
    source: "clinic",
    profileComplete: Boolean(firstName && lastName),
  });

  // خوشامدگویی + لینک اپ برای مراجع حضوری
  const welcome = await sendWelcomeSms(patient, request.url);
  const fresh = welcome.skipped
    ? patient
    : (await listPatients()).find((p) => p.id === patient.id) ?? patient;

  return NextResponse.json({ patient: fresh, welcomeSms: welcome }, { status: 201 });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const id = String(body.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "missing_id" }, { status: 400 });
  }

  const patch: Partial<Omit<Patient, "id" | "createdAt">> = {};

  if (body.firstName !== undefined) patch.firstName = String(body.firstName).trim();
  if (body.lastName !== undefined) patch.lastName = String(body.lastName).trim();
  if (body.address !== undefined) patch.address = String(body.address).trim();
  if (body.notes !== undefined) {
    const notes = String(body.notes).trim();
    patch.notes = notes || undefined;
  }
  if (body.gender !== undefined) {
    const gender = body.gender as Gender;
    if (!["female", "male", "other"].includes(gender)) {
      return NextResponse.json({ error: "validation_failed" }, { status: 400 });
    }
    patch.gender = gender;
  }
  if (body.phone !== undefined) {
    const phone = normalizeIntegerInput(String(body.phone));
    if (!/^09\d{9}$/.test(phone)) {
      return NextResponse.json({ error: "invalid_phone" }, { status: 400 });
    }
    const existing = await findPatientByPhone(phone);
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "phone_exists" }, { status: 409 });
    }
    patch.phone = phone;
  }
  if (body.nationalId !== undefined) {
    const raw = String(body.nationalId ?? "").trim();
    if (!raw) {
      patch.nationalId = undefined;
    } else {
      const nationalId = normalizeNationalId(raw);
      if (!isValidNationalId(nationalId)) {
        return NextResponse.json(
          { error: "invalid_national_id" },
          { status: 400 }
        );
      }
      patch.nationalId = nationalId;
    }
  }
  if (body.age !== undefined) {
    if (body.age === "" || body.age === null) {
      patch.age = undefined;
    } else {
      const age = parseNormalizedNumber(String(body.age));
      if (!Number.isFinite(age) || age < 1 || age > 120) {
        return NextResponse.json({ error: "invalid_age" }, { status: 400 });
      }
      patch.age = age;
    }
  }
  if (body.province !== undefined) {
    const province = String(body.province ?? "").trim();
    patch.province = province || undefined;
    if (!province) patch.city = undefined;
  }
  if (body.city !== undefined && patch.city === undefined) {
    const city = String(body.city ?? "").trim();
    patch.city = city || undefined;
  }
  if (body.birthDate !== undefined) {
    const birthDate = String(body.birthDate ?? "").trim();
    if (!birthDate) {
      patch.birthDate = undefined;
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
      return NextResponse.json({ error: "invalid_birth_date" }, { status: 400 });
    } else {
      const parsed = new Date(`${birthDate}T12:00:00`);
      if (Number.isNaN(parsed.getTime()) || parsed.getTime() > Date.now()) {
        return NextResponse.json({ error: "invalid_birth_date" }, { status: 400 });
      }
      patch.birthDate = birthDate;
      const fromBirth = ageFromIsoBirthDate(birthDate);
      if (fromBirth != null) patch.age = fromBirth;
    }
  }
  if (body.province !== undefined || body.city !== undefined) {
    const current = (await listPatients()).find((p) => p.id === id);
    const nextProvince =
      patch.province !== undefined ? patch.province : current?.province;
    const nextCity = patch.city !== undefined ? patch.city : current?.city;
    if (nextProvince) {
      const cities = citiesForProvince(nextProvince);
      if (cities.length === 0) {
        return NextResponse.json({ error: "invalid_province" }, { status: 400 });
      }
      if (nextCity && !cities.includes(nextCity)) {
        return NextResponse.json({ error: "invalid_city" }, { status: 400 });
      }
    }
  }
  if (body.heightCm !== undefined) {
    if (body.heightCm === "" || body.heightCm === null) {
      patch.heightCm = undefined;
    } else {
      const heightCm = parseNormalizedNumber(String(body.heightCm));
      if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 230) {
        return NextResponse.json({ error: "invalid_height" }, { status: 400 });
      }
      patch.heightCm = heightCm;
    }
  }
  if (body.goalWeightKg !== undefined) {
    if (body.goalWeightKg === "" || body.goalWeightKg === null) {
      patch.goalWeightKg = undefined;
    } else {
      const goalWeightKg = parseNormalizedNumber(String(body.goalWeightKg));
      if (!Number.isFinite(goalWeightKg) || goalWeightKg < 30 || goalWeightKg > 250) {
        return NextResponse.json({ error: "invalid_goal" }, { status: 400 });
      }
      patch.goalWeightKg = goalWeightKg;
    }
  }

  if (patch.lastName !== undefined && !patch.lastName) {
    return NextResponse.json({ error: "validation_failed" }, { status: 400 });
  }

  if (body.appReviewed === true) {
    patch.appReviewedAt = new Date().toISOString();
  }
  if (body.profileComplete !== undefined) {
    patch.profileComplete = Boolean(body.profileComplete);
  }
  if (body.firstName !== undefined || body.lastName !== undefined) {
    // بعد از تکمیل نام در پرونده، پروفایل را کامل علامت بزن اگر نام کامل شد
    const current = (await listPatients()).find((p) => p.id === id);
    const nextFirst =
      patch.firstName !== undefined ? patch.firstName : current?.firstName ?? "";
    const nextLast =
      patch.lastName !== undefined ? patch.lastName : current?.lastName ?? "";
    if (nextFirst && nextLast) patch.profileComplete = true;
  }

  const patient = await updatePatient(id, patch);
  if (!patient) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ patient });
}

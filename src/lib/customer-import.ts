import ExcelJS from "exceljs";
import { toEnglishDigits } from "@/lib/digits";
import { jalaliPartsToIsoDate } from "@/lib/jalali";
import { isValidNationalId, normalizeNationalId } from "@/lib/national-id";
import type { Gender, Patient } from "@/lib/types";

export const IMPORT_ROW_LIMIT = 3000;

const FIELD_KEYS = [
  "firstName",
  "lastName",
  "fullName",
  "phone",
  "nationalId",
  "age",
  "gender",
  "province",
  "city",
  "address",
  "birthDate",
  "heightCm",
  "goalWeightKg",
  "weightKg",
  "waistCm",
  "hipCm",
  "bloodPressure",
  "medicalHistory",
  "medications",
  "allergies",
  "chiefComplaint",
  "therapistNotes",
  "previousDiets",
  "notes",
] as const;

export type ImportField = (typeof FIELD_KEYS)[number];
export type ImportRecord = Partial<Record<ImportField, string>>;

const HEADER_ALIASES: Array<[string, ImportField]> = [
  ["نام خانوادگی", "lastName"],
  ["نام‌خانوادگی", "lastName"],
  ["فامیلی", "lastName"],
  ["نام کامل", "fullName"],
  ["شماره موبایل", "phone"],
  ["شماره تماس", "phone"],
  ["موبایل", "phone"],
  ["تلفن", "phone"],
  ["کد ملی", "nationalId"],
  ["تاریخ تولد", "birthDate"],
  ["سوابق پزشکی", "medicalHistory"],
  ["سوابق", "medicalHistory"],
  ["دور کمر", "waistCm"],
  ["دور باسن", "hipCm"],
  ["فشار خون", "bloodPressure"],
  ["وزن هدف", "goalWeightKg"],
  ["قد سانتی‌متر", "heightCm"],
  ["قد سانتیمتر", "heightCm"],
  ["قد", "heightCm"],
  ["وزن", "weightKg"],
  ["شکایت اصلی", "chiefComplaint"],
  ["شکایت", "chiefComplaint"],
  ["یادداشت درمانگر", "therapistNotes"],
  ["یادداشت", "therapistNotes"],
  ["حساسیت", "allergies"],
  ["داروها", "medications"],
  ["دارو", "medications"],
  ["رژیم‌های قبلی", "previousDiets"],
  ["رژیم", "previousDiets"],
  ["آدرس", "address"],
  ["استان", "province"],
  ["شهر", "city"],
  ["جنسیت", "gender"],
  ["سن", "age"],
  ["نام", "firstName"],
  ["توضیحات", "notes"],
];

export type ImportDraft = {
  firstName: string;
  lastName: string;
  phone: string;
  nationalId?: string;
  age?: number;
  gender: Gender;
  province?: string;
  city?: string;
  address: string;
  birthDate?: string;
  heightCm?: number;
  goalWeightKg?: number;
  weightKg?: number;
  waistCm?: number;
  hipCm?: number;
  bloodPressure?: string;
  medicalHistory?: string;
  medications?: string;
  allergies?: string;
  chiefComplaint?: string;
  therapistNotes?: string;
  previousDiets?: string;
  notes?: string;
};

export type ImportPlanItem = {
  row: number;
  action: "create" | "fill" | "skip";
  name: string;
  phone: string;
  missing: string[];
  warnings: string[];
  existingId: string | null;
  record: ImportRecord;
  addMeasurement: boolean;
  unchanged: boolean;
};

export type ExistingImportPatient = Pick<
  Patient,
  | "id"
  | "firstName"
  | "lastName"
  | "phone"
  | "nationalId"
  | "age"
  | "gender"
  | "address"
  | "province"
  | "city"
  | "birthDate"
  | "notes"
  | "heightCm"
  | "goalWeightKg"
>;

function cleanText(value: string) {
  return toEnglishDigits(value)
    .replace(/\u200c/g, " ")
    .replace(/[ي]/g, "ی")
    .replace(/[ك]/g, "ک")
    .replace(/\s+/g, " ")
    .trim();
}

function headerLabel(value: string) {
  return cleanText(value)
    .replace(/[()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function fieldForHeader(header: string): ImportField | null {
  const label = headerLabel(header);
  const hit = HEADER_ALIASES.find(([alias]) => headerLabel(alias) === label);
  return hit?.[1] ?? null;
}

function clip(value: string, max: number) {
  return value.length > max ? value.slice(0, max) : value;
}

function labeledNote(label: string, value: string | undefined) {
  return value ? `${label}: ${value}` : undefined;
}

function optionalText(value: string | undefined, max: number) {
  const text = clip(cleanText(value ?? ""), max);
  return text || undefined;
}

function parseLooseNumber(value: string | undefined) {
  if (!value) return undefined;
  const match = cleanText(value).replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  if (!match) return undefined;
  const number = Number(match[0]);
  return Number.isFinite(number) ? number : undefined;
}

function inRange(value: number | undefined, min: number, max: number) {
  if (value == null) return undefined;
  return value >= min && value <= max ? value : undefined;
}

export function normalizeMobile(value: string | undefined) {
  let digits = cleanText(value ?? "").replace(/\D/g, "");
  if (digits.startsWith("0098")) digits = digits.slice(4);
  else if (digits.startsWith("98") && digits.length >= 12) digits = digits.slice(2);
  if (digits.length === 10 && digits.startsWith("9")) digits = `0${digits}`;
  return /^09\d{9}$/.test(digits) ? digits : "";
}

function parseGender(value: string | undefined, warnings: string[]): Gender {
  const text = cleanText(value ?? "");
  if (!text) {
    warnings.push("جنسیت خالی بود و زن ثبت می‌شود.");
    return "female";
  }
  if (/(خانم|زن|female)/i.test(text)) return "female";
  if (/(آقا|مرد|male)/i.test(text)) return "male";
  warnings.push("جنسیت خوانده نشد و زن ثبت می‌شود.");
  return "female";
}

export function parseImportDate(value: string | undefined) {
  const text = cleanText(value ?? "").replace(/-/g, "/");
  const match = text.match(/(\d{4})\/(\d{1,2})\/(\d{1,2})/);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  if (year >= 1300 && year <= 1500) {
    return jalaliPartsToIsoDate({ jy: year, jm: month, jd: day });
  }
  if (year >= 1900 && year <= 2100) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }
  return undefined;
}

function splitName(record: ImportRecord) {
  let firstName = cleanText(record.firstName ?? "");
  let lastName = cleanText(record.lastName ?? "");
  const fullName = cleanText(record.fullName ?? "");
  if (!firstName && !lastName && fullName) {
    const parts = fullName.split(" ").filter(Boolean);
    if (parts.length === 1) lastName = parts[0];
    else {
      firstName = parts[0];
      lastName = parts.slice(1).join(" ");
    }
  } else if (!lastName && firstName.includes(" ")) {
    const parts = firstName.split(" ").filter(Boolean);
    firstName = parts[0];
    lastName = parts.slice(1).join(" ");
  }
  return {
    firstName: clip(firstName, 80),
    lastName: clip(lastName, 80),
  };
}

export function draftFromRecord(record: ImportRecord) {
  const warnings: string[] = [];
  const names = splitName(record);
  const phone = normalizeMobile(record.phone);
  if (cleanText(record.phone ?? "") && !phone) {
    warnings.push("شماره موبایل معتبر نیست و خالی می‌ماند.");
  }
  let nationalId: string | undefined;
  const rawNationalId = cleanText(record.nationalId ?? "");
  if (rawNationalId) {
    const normalized = normalizeNationalId(rawNationalId);
    if (isValidNationalId(normalized)) nationalId = normalized;
    else warnings.push("کد ملی معتبر نیست و در توضیحات پرونده می‌ماند.");
  }
  const age = inRange(parseLooseNumber(record.age), 1, 120);
  if (cleanText(record.age ?? "") && age == null) warnings.push("سن خارج از محدوده است.");
  const heightCm = inRange(parseLooseNumber(record.heightCm), 100, 230);
  const goalWeightKg = inRange(parseLooseNumber(record.goalWeightKg), 30, 250);
  const weightKg = inRange(parseLooseNumber(record.weightKg), 25, 300);
  const waistCm = inRange(parseLooseNumber(record.waistCm), 30, 200);
  const hipCm = inRange(parseLooseNumber(record.hipCm), 30, 200);
  const birthDate = parseImportDate(record.birthDate);
  if (cleanText(record.birthDate ?? "") && !birthDate) {
    warnings.push("تاریخ تولد خوانده نشد.");
  }

  const noteParts = [
    optionalText(record.notes, 2000),
    labeledNote("شکایت", optionalText(record.chiefComplaint, 2000)),
    labeledNote("سوابق پزشکی", optionalText(record.medicalHistory, 2000)),
    labeledNote("داروها", optionalText(record.medications, 2000)),
    labeledNote("حساسیت", optionalText(record.allergies, 1000)),
    labeledNote("رژیم‌های قبلی", optionalText(record.previousDiets, 2000)),
    labeledNote("وزن", optionalText(record.weightKg, 20)),
    labeledNote("دور کمر", optionalText(record.waistCm, 20)),
    labeledNote("دور باسن", optionalText(record.hipCm, 20)),
    labeledNote("فشار خون", optionalText(record.bloodPressure, 40)),
    labeledNote("یادداشت درمانگر", optionalText(record.therapistNotes, 2000)),
  ];
  if (rawNationalId && !nationalId) noteParts.push(`کد ملی پرونده کاغذی: ${rawNationalId}`);
  if (cleanText(record.phone ?? "") && !phone) {
    noteParts.push(`شماره پرونده کاغذی: ${cleanText(record.phone ?? "")}`);
  }

  const draft: ImportDraft = {
    firstName: names.firstName,
    lastName: names.lastName,
    phone,
    nationalId,
    age,
    gender: parseGender(record.gender, warnings),
    province: optionalText(record.province, 80),
    city: optionalText(record.city, 80),
    address: clip(cleanText(record.address ?? ""), 300),
    birthDate,
    heightCm,
    goalWeightKg,
    weightKg,
    waistCm,
    hipCm,
    bloodPressure: optionalText(record.bloodPressure, 40),
    medicalHistory: optionalText(record.medicalHistory, 2000),
    medications: optionalText(record.medications, 2000),
    allergies: optionalText(record.allergies, 1000),
    chiefComplaint: optionalText(record.chiefComplaint, 2000),
    therapistNotes: optionalText(record.therapistNotes, 2000),
    previousDiets: optionalText(record.previousDiets, 2000),
    notes: noteParts.filter(Boolean).join("\n") || undefined,
  };
  return { draft, warnings };
}

export function isExampleRecord(record: ImportRecord) {
  const notes = cleanText(record.notes ?? "");
  return notes.includes("ردیف نمونه");
}

function personName(draft: ImportDraft) {
  return `${draft.firstName} ${draft.lastName}`.trim();
}

function sameName(patient: ExistingImportPatient, draft: ImportDraft) {
  const left = cleanText(`${patient.firstName} ${patient.lastName}`);
  const right = cleanText(personName(draft));
  return Boolean(right) && left === right;
}

function missingLabels(draft: ImportDraft) {
  const missing: string[] = [];
  if (!draft.lastName) missing.push("نام خانوادگی");
  if (!draft.phone) missing.push("موبایل");
  if (!draft.nationalId) missing.push("کد ملی");
  return missing;
}

export function fillPatch(existing: ExistingImportPatient, draft: ImportDraft) {
  const patch: Partial<Patient> = {};
  if (!existing.firstName && draft.firstName) patch.firstName = draft.firstName;
  if (!existing.lastName && draft.lastName) patch.lastName = draft.lastName;
  if (!normalizeMobile(existing.phone) && draft.phone) patch.phone = draft.phone;
  if (!existing.nationalId && draft.nationalId) patch.nationalId = draft.nationalId;
  if (existing.age == null && draft.age != null) patch.age = draft.age;
  if (!existing.province && draft.province) patch.province = draft.province;
  if (!existing.city && draft.city) patch.city = draft.city;
  if (!cleanText(existing.address ?? "") && draft.address) patch.address = draft.address;
  if (!existing.birthDate && draft.birthDate) patch.birthDate = draft.birthDate;
  if (existing.heightCm == null && draft.heightCm != null) patch.heightCm = draft.heightCm;
  if (existing.goalWeightKg == null && draft.goalWeightKg != null) {
    patch.goalWeightKg = draft.goalWeightKg;
  }
  if (draft.notes && !cleanText(existing.notes ?? "").includes(cleanText(draft.notes))) {
    patch.notes = [existing.notes, draft.notes].filter(Boolean).join("\n");
  }
  const nextFirst = patch.firstName ?? existing.firstName;
  const nextLast = patch.lastName ?? existing.lastName;
  const nextPhone = patch.phone ?? existing.phone;
  if (
    Object.keys(patch).length > 0 &&
    nextFirst &&
    nextLast &&
    normalizeMobile(nextPhone)
  ) {
    patch.profileComplete = true;
  }
  return patch;
}

export function buildImportPlan(
  records: ImportRecord[],
  existing: ExistingImportPatient[],
  patientsWithMeasurements: Set<string>
) {
  const items: ImportPlanItem[] = [];
  const claimed = new Set<string>();

  records.slice(0, IMPORT_ROW_LIMIT).forEach((record, index) => {
    if (isExampleRecord(record)) return;
    const { draft, warnings } = draftFromRecord(record);
    const name = personName(draft);
    if (!draft.firstName && !draft.lastName) {
      items.push({
        row: index + 2,
        action: "skip",
        name: "بدون نام",
        phone: draft.phone,
        missing: ["نام"],
        warnings: ["نامی برای این ردیف پیدا نشد."],
        existingId: null,
        record,
        addMeasurement: false,
        unchanged: false,
      });
      return;
    }

    let match: ExistingImportPatient | undefined;
    if (draft.nationalId) {
      const hits = existing.filter(
        (patient) => patient.nationalId && normalizeNationalId(patient.nationalId) === draft.nationalId
      );
      if (hits.length === 1) match = hits[0];
      else if (hits.length > 1) warnings.push("چند پرونده با این کد ملی هست؛ ردیف جدید ساخته می‌شود.");
    }
    if (!match && draft.phone) {
      const hits = existing.filter((patient) => normalizeMobile(patient.phone) === draft.phone);
      if (hits.length === 1) match = hits[0];
      else if (hits.length > 1) warnings.push("چند پرونده با این موبایل هست؛ ردیف جدید ساخته می‌شود.");
    }
    if (!match && !draft.phone && !draft.nationalId) {
      const hits = existing.filter((patient) => sameName(patient, draft));
      if (hits.length === 1) match = hits[0];
      else if (hits.length > 1) {
        warnings.push("چند پرونده هم‌نام بدون موبایل هست؛ ردیف جدید ساخته می‌شود.");
      }
    }
    if (match && claimed.has(match.id)) {
      warnings.push("این مشتری در همین فایل تکرار شده و دوباره ادغام نمی‌شود.");
      match = undefined;
    }

    const measured = draft.weightKg != null;
    const addMeasurement = measured && (!match || !patientsWithMeasurements.has(match.id));
    const patch = match ? fillPatch(match, draft) : {};
    const unchanged = Boolean(match) && Object.keys(patch).length === 0 && !addMeasurement;
    if (unchanged) warnings.push("اطلاعات تازه‌ای نسبت به پرونده موجود نیست.");
    if (match) claimed.add(match.id);
    items.push({
      row: index + 2,
      action: match ? "fill" : "create",
      name,
      phone: draft.phone,
      missing: missingLabels(draft),
      warnings,
      existingId: match?.id ?? null,
      record,
      addMeasurement,
      unchanged,
    });
  });

  return items;
}

export function parseSpokenRecord(text: string): ImportRecord {
  const source = cleanText(text);
  const hits: Array<{ start: number; end: number; key: ImportField; label: string }> = [];
  for (const [label, key] of HEADER_ALIASES) {
    const pattern = new RegExp(
      `(?:^|\\s)${label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[:：]?\\s*`,
      "g"
    );
    const match = pattern.exec(source);
    if (!match || match.index == null) continue;
    const valueStart = match.index + match[0].length;
    if (
      ["weightKg", "heightCm", "age", "waistCm", "hipCm", "goalWeightKg"].includes(key) &&
      !/^(?:حدود\s+|تقریبا\s+)?\d/.test(source.slice(valueStart))
    ) {
      continue;
    }
    hits.push({
      start: match.index,
      end: match.index + match[0].length,
      key,
      label,
    });
  }
  hits.sort((a, b) => a.start - b.start || b.label.length - a.label.length);
  const kept: typeof hits = [];
  let coveredUntil = -1;
  for (const hit of hits) {
    if (hit.start < coveredUntil) continue;
    kept.push(hit);
    coveredUntil = hit.end;
  }

  const record: ImportRecord = {};
  for (let index = 0; index < kept.length; index += 1) {
    const hit = kept[index];
    const next = kept[index + 1]?.start ?? source.length;
    const value = source.slice(hit.end, next).trim();
    if (value && !record[hit.key]) record[hit.key] = value;
  }

  const phoneMatch = source.match(/(?:\+98|0098|0)?9\d{9}/);
  if (!record.phone && phoneMatch) record.phone = phoneMatch[0];
  const withoutPhone = phoneMatch ? source.replace(phoneMatch[0], " ") : source;
  const nationalMatch = withoutPhone.match(/(?<!\d)\d{10}(?!\d)/);
  if (!record.nationalId && nationalMatch && isValidNationalId(nationalMatch[0])) {
    record.nationalId = nationalMatch[0];
  }
  const ageMatch = source.match(/(\d{1,3})\s*ساله/);
  if (!record.age && ageMatch) record.age = ageMatch[1];
  if (!record.gender) {
    if (/(خانم|\bزن\b)/.test(source)) record.gender = "زن";
    else if (/(آقا|\bمرد\b)/.test(source)) record.gender = "مرد";
  }

  if (!record.firstName && !record.lastName && !record.fullName) {
    let leftover = source;
    for (const hit of kept) {
      const next = kept[kept.indexOf(hit) + 1]?.start ?? source.length;
      leftover = leftover.replace(source.slice(hit.start, next), " ");
    }
    leftover = leftover
      .replace(phoneMatch?.[0] ?? "", " ")
      .replace(nationalMatch?.[0] ?? "", " ")
      .replace(/(\d{1,3})\s*ساله/g, " ")
      .replace(/خانم|آقا/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (leftover) record.fullName = leftover;
  }
  return record;
}

function cellText(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  if (typeof value === "object" && "text" in value && value.text) return String(value.text);
  if (typeof value === "object" && "result" in value) return cellText(value.result as ExcelJS.CellValue);
  if (typeof value === "object" && "richText" in value && Array.isArray(value.richText)) {
    return value.richText.map((part) => part.text).join("");
  }
  return String(value);
}

export async function recordsFromWorkbook(buffer: Buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as unknown as Parameters<ExcelJS.Xlsx["load"]>[0]);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("empty_workbook");
  const headers: Array<{ col: number; key: ImportField }> = [];
  sheet.getRow(1).eachCell((cell, col) => {
    const key = fieldForHeader(cellText(cell.value));
    if (key) headers.push({ col, key });
  });
  if (headers.length === 0) throw new Error("unknown_headers");

  const records: ImportRecord[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: ImportRecord = {};
    let any = false;
    for (const header of headers) {
      const value = cleanText(cellText(row.getCell(header.col).value));
      if (!value) continue;
      record[header.key] = value;
      any = true;
    }
    if (any) records.push(record);
  });
  return records.slice(0, IMPORT_ROW_LIMIT);
}

export async function buildImportTemplate() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "کلینیک تندیس";
  const sheet = workbook.addWorksheet("پرونده‌ها", {
    views: [{ rightToLeft: true, state: "frozen", ySplit: 1 }],
  });
  const columns: Array<{ header: string; key: string; width: number }> = [
    { header: "نام", key: "firstName", width: 16 },
    { header: "نام خانوادگی", key: "lastName", width: 18 },
    { header: "موبایل", key: "phone", width: 16 },
    { header: "کد ملی", key: "nationalId", width: 16 },
    { header: "سن", key: "age", width: 10 },
    { header: "جنسیت", key: "gender", width: 12 },
    { header: "استان", key: "province", width: 14 },
    { header: "شهر", key: "city", width: 14 },
    { header: "آدرس", key: "address", width: 28 },
    { header: "تاریخ تولد", key: "birthDate", width: 16 },
    { header: "قد", key: "heightCm", width: 12 },
    { header: "وزن", key: "weightKg", width: 12 },
    { header: "وزن هدف", key: "goalWeightKg", width: 14 },
    { header: "دور کمر", key: "waistCm", width: 12 },
    { header: "دور باسن", key: "hipCm", width: 12 },
    { header: "فشار خون", key: "bloodPressure", width: 14 },
    { header: "سوابق پزشکی", key: "medicalHistory", width: 28 },
    { header: "داروها", key: "medications", width: 20 },
    { header: "حساسیت", key: "allergies", width: 18 },
    { header: "شکایت اصلی", key: "chiefComplaint", width: 24 },
    { header: "رژیم‌های قبلی", key: "previousDiets", width: 20 },
    { header: "یادداشت", key: "therapistNotes", width: 24 },
    { header: "توضیحات", key: "notes", width: 28 },
  ];
  sheet.columns = columns;
  sheet.addRow({
    firstName: "فاطمه",
    lastName: "نمونه",
    phone: "09120000000",
    nationalId: "",
    age: 34,
    gender: "زن",
    province: "یزد",
    city: "یزد",
    address: "این ردیف نمونه است و وارد نمی‌شود",
    birthDate: "1370/02/15",
    heightCm: 162,
    weightKg: 78,
    goalWeightKg: 65,
    waistCm: 92,
    hipCm: 108,
    bloodPressure: "12/8",
    medicalHistory: "کم‌کاری تیروئید",
    medications: "",
    allergies: "",
    chiefComplaint: "کاهش وزن",
    previousDiets: "",
    therapistNotes: "",
    notes: "ردیف نمونه؛ پاک کنید و پرونده‌های واقعی را زیر همین ستون‌ها بنویسید",
  });
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" }, name: "Calibri" };
  header.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF14352A" } };
  header.alignment = { vertical: "middle", horizontal: "right" };
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export function todayIsoInTehran(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

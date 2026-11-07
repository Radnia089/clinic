import ExcelJS from "exceljs";
import { toJalaali } from "jalaali-js";
import { prisma } from "@/lib/db";
import type { AdmissionForm, Gender, PaymentMethod, PaymentStatus, VisitStatus, VisitType } from "@/lib/types";
import {
  genderLabel,
  onlineConsultStatusLabel,
  paymentMethodLabel,
  paymentStatusLabel,
  supportTicketCategoryLabel,
  supportTicketStatusLabel,
  visitChannelLabel,
  visitStatusLabel,
  visitTypeLabel,
} from "@/lib/types";
import type { OnlineConsultStatus, SupportTicketCategory, SupportTicketStatus } from "@/lib/types";

type SheetColumn = { header: string; key: string; width: number };

export async function customerBackupCounts() {
  const [patients, visits, measurements, payments, appointments, consults, tickets, sms] =
    await Promise.all([
      prisma.patient.count(),
      prisma.visit.count(),
      prisma.measurement.count(),
      prisma.payment.count(),
      prisma.appointment.count(),
      prisma.onlineConsult.count(),
      prisma.supportTicket.count(),
      prisma.smsLog.count(),
    ]);
  return { patients, visits, measurements, payments, appointments, consults, tickets, sms };
}

export function customerBackupFilename(now = new Date()) {
  const parts = tehranParts(now);
  const { jy, jm, jd } = toJalaali(parts.year, parts.month, parts.day);
  const stamp = `${jy}${pad(jm)}${pad(jd)}-${parts.hour}${parts.minute}`;
  return `tandis-customers-${stamp}.xlsx`;
}

export async function buildCustomerBackupWorkbook(now = new Date()) {
  const [patients, visits, measurements, payments, appointments, consults, tickets, sms] =
    await Promise.all([
      prisma.patient.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.visit.findMany({ orderBy: [{ visitDate: "asc" }, { visitTime: "asc" }] }),
      prisma.measurement.findMany({ orderBy: { recordedAt: "asc" } }),
      prisma.payment.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.appointment.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.onlineConsult.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.supportTicket.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.smsLog.findMany({ orderBy: { createdAt: "asc" } }),
    ]);

  const people = new Map(
    patients.map((patient) => [
      patient.id,
      {
        name: `${patient.firstName} ${patient.lastName}`.trim(),
        phone: patient.phone,
      },
    ])
  );

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "کلینیک تندیس";
  workbook.created = now;
  workbook.title = "بکاپ مشتریان کلینیک تندیس";

  const counts = {
    patients: patients.length,
    visits: visits.length,
    measurements: measurements.length,
    payments: payments.length,
    appointments: appointments.length,
    consults: consults.length,
    tickets: tickets.length,
    sms: sms.length,
  };

  addSheet(
    workbook,
    "خلاصه",
    [
      { header: "موضوع", key: "label", width: 28 },
      { header: "مقدار", key: "value", width: 42 },
    ],
    [
      { label: "زمان تهیه بکاپ", value: formatDateTime(now) },
      { label: "مشتریان", value: counts.patients },
      { label: "ویزیت‌ها", value: counts.visits },
      { label: "اندازه‌ها", value: counts.measurements },
      { label: "پرداخت‌ها", value: counts.payments },
      { label: "درخواست نوبت", value: counts.appointments },
      { label: "مشاوره آنلاین", value: counts.consults },
      { label: "پشتیبانی", value: counts.tickets },
      { label: "پیامک‌ها", value: counts.sms },
      {
        label: "توضیح",
        value: "رمز عبور و کلید اعلان گوشی در این فایل نیست.",
      },
    ]
  );

  addSheet(
    workbook,
    "مشتریان",
    [
      { header: "شناسه", key: "id", width: 28 },
      { header: "نام", key: "firstName", width: 16 },
      { header: "نام خانوادگی", key: "lastName", width: 18 },
      { header: "نام کامل", key: "fullName", width: 24 },
      { header: "سن", key: "age", width: 10 },
      { header: "جنسیت", key: "gender", width: 12 },
      { header: "موبایل", key: "phone", width: 16 },
      { header: "کد ملی", key: "nationalId", width: 16 },
      { header: "استان", key: "province", width: 16 },
      { header: "شهر", key: "city", width: 16 },
      { header: "آدرس", key: "address", width: 36 },
      { header: "تاریخ تولد", key: "birthDate", width: 16 },
      { header: "قد (سانتی‌متر)", key: "heightCm", width: 16 },
      { header: "وزن هدف (کیلوگرم)", key: "goalWeightKg", width: 18 },
      { header: "توضیحات", key: "notes", width: 36 },
      { header: "منبع پرونده", key: "source", width: 16 },
      { header: "پروفایل کامل", key: "profileComplete", width: 16 },
      { header: "تأیید موبایل", key: "phoneVerifiedAt", width: 20 },
      { header: "رمز ورود دارد", key: "hasPassword", width: 16 },
      { header: "زمان تنظیم رمز", key: "passwordSetAt", width: 20 },
      { header: "پیامک خوشامد", key: "welcomeSmsSentAt", width: 20 },
      { header: "بررسی ثبت‌نام اپ", key: "appReviewedAt", width: 20 },
      { header: "تاریخ ثبت", key: "createdAt", width: 20 },
      { header: "آخرین تغییر", key: "updatedAt", width: 20 },
    ],
    patients.map((patient) => ({
      id: patient.id,
      firstName: patient.firstName,
      lastName: patient.lastName,
      fullName: `${patient.firstName} ${patient.lastName}`.trim(),
      age: patient.age ?? "",
      gender: genderLabel(patient.gender as Gender),
      phone: patient.phone,
      nationalId: patient.nationalId ?? "",
      province: patient.province ?? "",
      city: patient.city ?? "",
      address: patient.address,
      birthDate: formatDateOnly(patient.birthDate),
      heightCm: patient.heightCm ?? "",
      goalWeightKg: patient.goalWeightKg ?? "",
      notes: patient.notes ?? "",
      source: patient.source === "app" ? "اپ مشتری" : "حضوری",
      profileComplete: yesNo(patient.profileComplete),
      phoneVerifiedAt: formatDateTime(patient.phoneVerifiedAt),
      hasPassword: yesNo(Boolean(patient.passwordSetAt)),
      passwordSetAt: formatDateTime(patient.passwordSetAt),
      welcomeSmsSentAt: formatDateTime(patient.welcomeSmsSentAt),
      appReviewedAt: formatDateTime(patient.appReviewedAt),
      createdAt: formatDateTime(patient.createdAt),
      updatedAt: formatDateTime(patient.updatedAt),
    }))
  );

  addSheet(
    workbook,
    "ویزیت‌ها",
    [
      { header: "شناسه ویزیت", key: "id", width: 28 },
      { header: "شناسه مشتری", key: "patientId", width: 28 },
      { header: "نام مشتری", key: "patientName", width: 24 },
      { header: "موبایل", key: "phone", width: 16 },
      { header: "تاریخ نوبت", key: "visitDate", width: 16 },
      { header: "ساعت", key: "visitTime", width: 12 },
      { header: "مدت (دقیقه)", key: "durationMinutes", width: 14 },
      { header: "نوع", key: "visitType", width: 16 },
      { header: "نحوه مراجعه", key: "channel", width: 14 },
      { header: "وضعیت", key: "status", width: 16 },
      { header: "نام پکیج", key: "packageName", width: 20 },
      { header: "قد", key: "heightCm", width: 10 },
      { header: "وزن", key: "weightKg", width: 10 },
      { header: "وزن هدف", key: "goalWeightKg", width: 12 },
      { header: "دور کمر", key: "waistCm", width: 12 },
      { header: "دور باسن", key: "hipCm", width: 12 },
      { header: "فشار خون", key: "bloodPressure", width: 14 },
      { header: "سطح فعالیت", key: "activityLevel", width: 14 },
      { header: "رژیم‌های قبلی", key: "previousDiets", width: 28 },
      { header: "سوابق پزشکی", key: "medicalHistory", width: 28 },
      { header: "داروها", key: "medications", width: 24 },
      { header: "حساسیت", key: "allergies", width: 24 },
      { header: "شکایت اصلی", key: "chiefComplaint", width: 28 },
      { header: "یادداشت درمانگر", key: "therapistNotes", width: 32 },
      { header: "تاریخ ثبت", key: "createdAt", width: 20 },
      { header: "آخرین تغییر", key: "updatedAt", width: 20 },
    ],
    visits.map((visit) => {
      const person = people.get(visit.patientId);
      const admission = parseAdmission(visit.admissionJson);
      return {
        id: visit.id,
        patientId: visit.patientId,
        patientName: person?.name ?? "",
        phone: person?.phone ?? "",
        visitDate: formatDateOnly(visit.visitDate),
        visitTime: visit.visitTime ?? "",
        durationMinutes: visit.durationMinutes ?? "",
        visitType: visitTypeLabel(visit.visitType as VisitType),
        channel: visitChannelLabel(visit.channel === "phone" ? "phone" : "clinic"),
        status: visitStatusLabel(visit.status as VisitStatus),
        packageName: visit.packageName ?? "",
        heightCm: admission.heightCm ?? "",
        weightKg: admission.weightKg ?? "",
        goalWeightKg: admission.goalWeightKg ?? "",
        waistCm: admission.waistCm ?? "",
        hipCm: admission.hipCm ?? "",
        bloodPressure: admission.bloodPressure ?? "",
        activityLevel: activityLabel(admission.activityLevel),
        previousDiets: admission.previousDiets ?? "",
        medicalHistory: admission.medicalHistory ?? "",
        medications: admission.medications ?? "",
        allergies: admission.allergies ?? "",
        chiefComplaint: admission.chiefComplaint ?? "",
        therapistNotes: admission.therapistNotes ?? "",
        createdAt: formatDateTime(visit.createdAt),
        updatedAt: formatDateTime(visit.updatedAt),
      };
    })
  );

  addSheet(
    workbook,
    "اندازه‌ها",
    [
      { header: "شناسه", key: "id", width: 28 },
      { header: "شناسه مشتری", key: "patientId", width: 28 },
      { header: "نام مشتری", key: "patientName", width: 24 },
      { header: "موبایل", key: "phone", width: 16 },
      { header: "تاریخ اندازه‌گیری", key: "recordedAt", width: 20 },
      { header: "وزن (کیلوگرم)", key: "weightKg", width: 16 },
      { header: "دور کمر", key: "waistCm", width: 12 },
      { header: "دور باسن", key: "hipCm", width: 12 },
      { header: "دور بازو", key: "armCm", width: 12 },
      { header: "دور ران", key: "thighCm", width: 12 },
      { header: "دور ساق", key: "calfCm", width: 12 },
      { header: "یادداشت", key: "note", width: 28 },
      { header: "تاریخ ثبت", key: "createdAt", width: 20 },
    ],
    measurements.map((item) => {
      const person = people.get(item.patientId);
      return {
        id: item.id,
        patientId: item.patientId,
        patientName: person?.name ?? "",
        phone: person?.phone ?? "",
        recordedAt: formatDateTime(item.recordedAt),
        weightKg: item.weightKg,
        waistCm: item.waistCm ?? "",
        hipCm: item.hipCm ?? "",
        armCm: item.armCm ?? "",
        thighCm: item.thighCm ?? "",
        calfCm: item.calfCm ?? "",
        note: item.note ?? "",
        createdAt: formatDateTime(item.createdAt),
      };
    })
  );

  addSheet(
    workbook,
    "پرداخت‌ها",
    [
      { header: "شناسه", key: "id", width: 28 },
      { header: "شناسه مشتری", key: "patientId", width: 28 },
      { header: "نام مشتری", key: "patientName", width: 24 },
      { header: "موبایل", key: "phone", width: 16 },
      { header: "شناسه ویزیت", key: "visitId", width: 28 },
      { header: "عنوان", key: "title", width: 24 },
      { header: "مبلغ", key: "amount", width: 14 },
      { header: "پرداخت‌شده", key: "paidAmount", width: 14 },
      { header: "روش", key: "method", width: 14 },
      { header: "وضعیت", key: "status", width: 16 },
      { header: "یادداشت", key: "note", width: 28 },
      { header: "تاریخ ثبت", key: "createdAt", width: 20 },
    ],
    payments.map((payment) => {
      const person = people.get(payment.patientId);
      return {
        id: payment.id,
        patientId: payment.patientId,
        patientName: person?.name ?? "",
        phone: person?.phone ?? "",
        visitId: payment.visitId ?? "",
        title: payment.title,
        amount: payment.amount,
        paidAmount: payment.paidAmount,
        method: paymentMethodLabel(payment.method as PaymentMethod),
        status: paymentStatusLabel(payment.status as PaymentStatus),
        note: payment.note ?? "",
        createdAt: formatDateTime(payment.createdAt),
      };
    })
  );

  addSheet(
    workbook,
    "نوبت‌ها",
    [
      { header: "شناسه", key: "id", width: 28 },
      { header: "نام", key: "name", width: 24 },
      { header: "موبایل", key: "phone", width: 16 },
      { header: "تاریخ پیشنهادی", key: "preferredDate", width: 16 },
      { header: "ساعت پیشنهادی", key: "preferredTime", width: 16 },
      { header: "خدمت", key: "service", width: 20 },
      { header: "یادداشت", key: "note", width: 28 },
      { header: "نوع", key: "channel", width: 14 },
      { header: "وضعیت", key: "status", width: 16 },
      { header: "تاریخ ثبت", key: "createdAt", width: 20 },
    ],
    appointments.map((item) => ({
      id: item.id,
      name: item.name,
      phone: item.phone,
      preferredDate: formatDateOnly(item.preferredDate),
      preferredTime: item.preferredTime ?? "",
      service: item.service,
      note: item.note ?? "",
      channel: item.channel === "phone" ? "تلفنی" : "حضوری",
      status: appointmentStatusLabel(item.status),
      createdAt: formatDateTime(item.createdAt),
    }))
  );

  addSheet(
    workbook,
    "مشاوره آنلاین",
    [
      { header: "شناسه", key: "id", width: 28 },
      { header: "نام", key: "name", width: 24 },
      { header: "موبایل", key: "phone", width: 16 },
      { header: "سن", key: "age", width: 10 },
      { header: "جنسیت", key: "gender", width: 12 },
      { header: "قد", key: "heightCm", width: 10 },
      { header: "وزن", key: "weightKg", width: 10 },
      { header: "دور بازو", key: "armCm", width: 12 },
      { header: "دور کمر", key: "waistCm", width: 12 },
      { header: "دور باسن", key: "hipCm", width: 12 },
      { header: "دور ران", key: "thighCm", width: 12 },
      { header: "دور ساق", key: "calfCm", width: 12 },
      { header: "توضیح", key: "note", width: 28 },
      { header: "تاریخ پیشنهادی", key: "preferredDate", width: 16 },
      { header: "وضعیت", key: "status", width: 16 },
      { header: "تاریخ رزرو", key: "scheduledDate", width: 16 },
      { header: "ساعت رزرو", key: "scheduledTime", width: 14 },
      { header: "پیامک نوبت", key: "smsNotifiedAt", width: 20 },
      { header: "شروع تماس", key: "callStartedAt", width: 20 },
      { header: "تاریخ ثبت", key: "createdAt", width: 20 },
      { header: "آخرین تغییر", key: "updatedAt", width: 20 },
    ],
    consults.map((item) => ({
      id: item.id,
      name: item.name,
      phone: item.phone,
      age: item.age ?? "",
      gender: item.gender ? genderLabel(item.gender as Gender) : "",
      heightCm: item.heightCm ?? "",
      weightKg: item.weightKg ?? "",
      armCm: item.armCm ?? "",
      waistCm: item.waistCm ?? "",
      hipCm: item.hipCm ?? "",
      thighCm: item.thighCm ?? "",
      calfCm: item.calfCm ?? "",
      note: item.note ?? "",
      preferredDate: formatDateOnly(item.preferredDate),
      status: onlineConsultStatusLabel(item.status as OnlineConsultStatus),
      scheduledDate: formatDateOnly(item.scheduledDate),
      scheduledTime: item.scheduledTime ?? "",
      smsNotifiedAt: formatDateTime(item.smsNotifiedAt),
      callStartedAt: formatDateTime(item.callStartedAt),
      createdAt: formatDateTime(item.createdAt),
      updatedAt: formatDateTime(item.updatedAt),
    }))
  );

  addSheet(
    workbook,
    "پشتیبانی",
    [
      { header: "شناسه", key: "id", width: 28 },
      { header: "شناسه مشتری", key: "patientId", width: 28 },
      { header: "نام", key: "patientName", width: 24 },
      { header: "موبایل", key: "phone", width: 16 },
      { header: "دسته", key: "category", width: 16 },
      { header: "موضوع", key: "subject", width: 24 },
      { header: "متن", key: "body", width: 40 },
      { header: "وضعیت", key: "status", width: 16 },
      { header: "پاسخ کلینیک", key: "clinicReply", width: 36 },
      { header: "تاریخ ثبت", key: "createdAt", width: 20 },
      { header: "آخرین تغییر", key: "updatedAt", width: 20 },
    ],
    tickets.map((ticket) => ({
      id: ticket.id,
      patientId: ticket.patientId,
      patientName: ticket.patientName,
      phone: ticket.phone,
      category: supportTicketCategoryLabel(ticket.category as SupportTicketCategory),
      subject: ticket.subject,
      body: ticket.body,
      status: supportTicketStatusLabel(ticket.status as SupportTicketStatus),
      clinicReply: ticket.clinicReply ?? "",
      createdAt: formatDateTime(ticket.createdAt),
      updatedAt: formatDateTime(ticket.updatedAt),
    }))
  );

  addSheet(
    workbook,
    "پیامک‌ها",
    [
      { header: "شناسه", key: "id", width: 28 },
      { header: "شناسه مشتری", key: "patientId", width: 28 },
      { header: "نام", key: "patientName", width: 24 },
      { header: "موبایل", key: "phone", width: 16 },
      { header: "نوع", key: "kind", width: 16 },
      { header: "متن", key: "body", width: 48 },
      { header: "وضعیت", key: "status", width: 14 },
      { header: "سرویس", key: "provider", width: 14 },
      { header: "خطا", key: "error", width: 24 },
      { header: "تاریخ", key: "createdAt", width: 20 },
    ],
    sms.map((item) => ({
      id: item.id,
      patientId: item.patientId ?? "",
      patientName: item.patientName,
      phone: item.phone,
      kind: item.kind,
      body: item.body,
      status: item.status,
      provider: item.provider,
      error: item.error ?? "",
      createdAt: formatDateTime(item.createdAt),
    }))
  );

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function addSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  columns: SheetColumn[],
  rows: Record<string, string | number>[]
) {
  const sheet = workbook.addWorksheet(name, {
    views: [{ rightToLeft: true, state: "frozen", ySplit: 1 }],
  });
  sheet.columns = columns;
  if (rows.length > 0) sheet.addRows(rows);
  const header = sheet.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" }, name: "Calibri" };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF14352A" },
  };
  header.alignment = { vertical: "middle", horizontal: "right" };
  header.height = 22;
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };
  sheet.eachRow((row, rowNumber) => {
    row.alignment = { vertical: "middle", horizontal: "right", wrapText: true };
    if (rowNumber > 1) row.font = { name: "Calibri" };
  });
}

function yesNo(value: boolean) {
  return value ? "بله" : "خیر";
}

function activityLabel(value?: string) {
  if (value === "low") return "کم";
  if (value === "medium") return "متوسط";
  if (value === "high") return "زیاد";
  return value ?? "";
}

function appointmentStatusLabel(status: string) {
  if (status === "new") return "درخواست جدید";
  if (status === "confirmed") return "تأیید شده";
  if (status === "rejected") return "رد شده";
  return status;
}

function parseAdmission(raw: string | null): AdmissionForm {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as AdmissionForm;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function tehranParts(date: Date) {
  const bag: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date)) {
    if (part.type !== "literal") bag[part.type] = part.value;
  }
  const hour = bag.hour === "24" ? "00" : bag.hour;
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour,
    minute: bag.minute,
  };
}

function formatDateOnly(value?: string | null) {
  if (!value) return "";
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  const { jy, jm, jd } = toJalaali(year, month, day);
  return `${jy}/${pad(jm)}/${pad(jd)}`;
}

function formatDateTime(value?: Date | string | null) {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = tehranParts(date);
  const { jy, jm, jd } = toJalaali(parts.year, parts.month, parts.day);
  return `${jy}/${pad(jm)}/${pad(jd)} ${parts.hour}:${parts.minute}`;
}

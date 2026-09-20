import { formatJalaliDate } from "@/lib/jalali";

export type Gender = "female" | "male" | "other";

export type VisitType = "consultation" | "package";

export type VisitStatus = "visitor" | "admitted" | "completed" | "cancelled";

export type PaymentStatus = "pending" | "paid" | "partial" | "refunded";

export type PaymentMethod = "cash" | "card" | "transfer";

export type ClinicRole = "reception" | "management";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: Gender;
  phone: string;
  address: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdmissionForm {
  heightCm?: number;
  weightKg?: number;
  goalWeightKg?: number;
  waistCm?: number;
  hipCm?: number;
  bloodPressure?: string;
  activityLevel?: "low" | "medium" | "high";
  previousDiets?: string;
  medicalHistory?: string;
  medications?: string;
  allergies?: string;
  chiefComplaint?: string;
  therapistNotes?: string;
}

export interface Visit {
  id: string;
  patientId: string;
  visitDate: string;
  /** ساعت شروع نوبت به صورت HH:mm مثلاً 17:30 */
  visitTime?: string;
  /** مدت نوبت به دقیقه (مثلاً ۳۰ یا ۶۰) */
  durationMinutes?: number;
  visitType: VisitType;
  status: VisitStatus;
  packageName?: string;
  admission?: AdmissionForm;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  patientId: string;
  visitId?: string;
  title: string;
  amount: number;
  paidAmount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
  note?: string;
}

export interface AppointmentRequest {
  id: string;
  name: string;
  phone: string;
  preferredDate?: string;
  service: string;
  note?: string;
  status: "new" | "confirmed" | "rejected";
  createdAt: string;
}

/** اندازه‌گیری‌های دوره‌ای که از پنل کلینیک ثبت می‌شود */
export interface ProgressMeasurement {
  id: string;
  patientId: string;
  recordedAt: string;
  weightKg: number;
  waistCm: number;
  hipCm?: number;
  note?: string;
  createdAt: string;
}

export interface ClinicProfile {
  name: string;
  fullName: string;
  tagline: string;
  phone: string;
  address: string;
  hours: string;
  version: string;
  /** شروع بازه قابل انتخاب HH:mm */
  workStart: string;
  /** پایان بازه قابل انتخاب HH:mm */
  workEnd: string;
  /** واحد پایه تقویم (ربع ساعت) */
  gridSlotMinutes: number;
  /** مدت پیش‌فرض ویزیت به دقیقه */
  visitSlotMinutes: number;
  /** مدت پیش‌فرض پکیج/دستگاه به دقیقه */
  packageSlotMinutes: number;
}

export interface AppData {
  clinic: ClinicProfile;
  patients: Patient[];
  visits: Visit[];
  payments: Payment[];
  appointments: AppointmentRequest[];
  measurements: ProgressMeasurement[];
}

export const DEFAULT_CLINIC: ClinicProfile = {
  name: "تندیس",
  fullName: "کلینیک رژیم درمانی تندیس",
  tagline: "مراقبت شخصی برای مسیر سلامت و کاهش وزن",
  phone: "035-31234567",
  address: "یزد، بلوار جمهوری، نزدیک میدان امام",
  hours: "شنبه تا پنج‌شنبه، ۸ تا ۲۱ (شناور)",
  version: "1.0.0",
  workStart: "08:00",
  workEnd: "21:00",
  gridSlotMinutes: 15,
  visitSlotMinutes: 30,
  packageSlotMinutes: 60,
};

export function patientFullName(patient: Pick<Patient, "firstName" | "lastName">) {
  return `${patient.firstName} ${patient.lastName}`.trim();
}

export function genderLabel(gender: Gender) {
  switch (gender) {
    case "female":
      return "زن";
    case "male":
      return "مرد";
    default:
      return "سایر";
  }
}

export function visitTypeLabel(type: VisitType) {
  return type === "consultation" ? "ویزیت" : "پکیج لاغری";
}

export function visitStatusLabel(status: VisitStatus) {
  switch (status) {
    case "visitor":
      return "مراجعه‌کننده";
    case "admitted":
      return "پذیرش‌شده";
    case "completed":
      return "تکمیل‌شده";
    case "cancelled":
      return "لغو‌شده";
  }
}

export function paymentStatusLabel(status: PaymentStatus) {
  switch (status) {
    case "pending":
      return "در انتظار";
    case "paid":
      return "پرداخت‌شده";
    case "partial":
      return "پرداخت ناقص";
    case "refunded":
      return "عودت";
  }
}

export function paymentMethodLabel(method: PaymentMethod) {
  switch (method) {
    case "cash":
      return "نقدی";
    case "card":
      return "کارتخوان";
    case "transfer":
      return "واریز";
  }
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
}

export function formatDateFa(iso: string) {
  return formatJalaliDate(iso, { withMonthName: true, withWeekday: true });
}

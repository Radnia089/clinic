import { formatJalaliDate } from "@/lib/jalali";

export type Gender = "female" | "male" | "other";

export type VisitType = "consultation" | "package";

export type VisitStatus = "visitor" | "admitted" | "completed" | "cancelled";

export type PaymentStatus = "pending" | "paid" | "partial" | "refunded";

export type PaymentMethod = "cash" | "card" | "transfer";

export type ClinicRole = "reception" | "management";

/** منشأ تشکیل پرونده: حضوری در کلینیک یا ثبت‌نام مستقیم از اپ */
export type PatientSource = "clinic" | "app";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  /** سن؛ اگر هنگام ثبت خالی باشد اختیاری است */
  age?: number;
  gender: Gender;
  phone: string;
  address: string;
  notes?: string;
  /** قد ثابت مشتری (cm) — در اپ مشتری و پرونده مشترک است */
  heightCm?: number;
  /** وزن هدف (kg) — در اپ مشتری و پرونده مشترک است */
  goalWeightKg?: number;
  /** تصویر پروفایل آپلودشده؛ اگر نباشد آواتار پیش‌فرض زن/مرد */
  avatarUrl?: string;
  /** حضوری یا ثبت‌نام از اپ */
  source: PatientSource;
  /** پروفایل تکمیلی در اپ کامل شده است */
  profileComplete: boolean;
  /** زمان تأیید موبایل با OTP */
  phoneVerifiedAt?: string;
  /** زمان ارسال پیامک خوشامد / لینک اپ */
  welcomeSmsSentAt?: string;
  /** زمان بررسی در بخش «ثبت‌نام اپ» توسط کارکنان */
  appReviewedAt?: string;
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
  /** حضوری در کلینیک یا نوبت تلفنی (هر دو ویزیت/خدمت‌اند) */
  channel?: "clinic" | "phone";
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
  /** ساعت پیشنهادی HH:mm */
  preferredTime?: string;
  service: string;
  note?: string;
  /** نوبت حضوری در کلینیک یا تلفنی */
  channel: "clinic" | "phone";
  status: "new" | "confirmed" | "rejected";
  createdAt: string;
}

/** اندازه‌گیری‌های دوره‌ای که از پنل کلینیک ثبت می‌شود و در اپ مشتری هم دیده می‌شود */
export interface ProgressMeasurement {
  id: string;
  patientId: string;
  recordedAt: string;
  weightKg: number;
  /** اختیاری — ممکن است فقط وزن از اپ ثبت شود */
  waistCm?: number;
  hipCm?: number;
  armCm?: number;
  thighCm?: number;
  calfCm?: number;
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
  /** تنظیمات پیامک یادآوری نوبت */
  reminderSettings: ReminderSettings;
}

export type ReminderKind =
  | "morning"
  | "hours_before"
  | "promo"
  | "test"
  | "online_consult"
  | "welcome"
  | "otp";

/** درخواست مشاوره آنلاین از اپ مشتری */
export type OnlineConsultStatus =
  | "new"
  | "scheduled"
  | "completed"
  | "cancelled";

export interface OnlineConsultRequest {
  id: string;
  name: string;
  phone: string;
  age?: number;
  gender?: Gender;
  heightCm?: number;
  weightKg?: number;
  /** دور بازو */
  armCm?: number;
  /** دور کمر (باریک‌ترین / ناف) */
  waistCm?: number;
  /** دور باسن */
  hipCm?: number;
  /** دور ران */
  thighCm?: number;
  /** دور ساق */
  calfCm?: number;
  note?: string;
  preferredDate?: string;
  status: OnlineConsultStatus;
  /** تاریخ رزرو نهایی YYYY-MM-DD */
  scheduledDate?: string;
  /** ساعت رزرو نهایی HH:mm */
  scheduledTime?: string;
  /** زمان ارسال پیامک تأیید نوبت */
  smsNotifiedAt?: string;
  /** زمان شروع تماس از پنل کلینیک */
  callStartedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderSettings {
  /** روشن/خاموش بودن کل سیستم یادآوری */
  enabled: boolean;
  /** پیام صبح روز نوبت */
  morningEnabled: boolean;
  /** ساعت ارسال پیام صبح (۰–۲۳، به‌وقت ایران) */
  morningHour: number;
  /** پیام چند ساعت قبل از نوبت */
  hoursBeforeEnabled: boolean;
  /** چند ساعت قبل از شروع نوبت */
  hoursBefore: number;
  /**
   * متن پیامک. متغیرها:
   * {name} {date} {time} {clinic} {type}
   */
  template: string;
}

export type SmsDeliveryStatus = "sent" | "mock" | "failed";

export interface SmsLogEntry {
  id: string;
  visitId?: string;
  patientId?: string;
  onlineConsultId?: string;
  patientName: string;
  phone: string;
  kind: ReminderKind;
  body: string;
  status: SmsDeliveryStatus;
  provider: "mock" | "kavenegar";
  error?: string;
  /** کلید یکتا برای جلوگیری از ارسال تکراری */
  dedupeKey: string;
  createdAt: string;
}

/** دفتر حساب شخصی مدیر کلینیک (جدا از مالی مشتریان) */
export type PersonalLedgerKind = "income" | "expense";

export interface PersonalLedgerEntry {
  id: string;
  kind: PersonalLedgerKind;
  /** دسته از پیش‌تعریف‌شده مثل حقوق، خرید، ... */
  category: string;
  /** توضیح کوتاه اختیاری */
  title?: string;
  /** مبلغ به تومان */
  amount: number;
  /** تاریخ ثبت به‌صورت ISO تاریخ YYYY-MM-DD */
  entryDate: string;
  note?: string;
  createdAt: string;
}

export interface Champion {
  id: string;
  name: string;
  quote: string;
  startKg: number;
  endKg: number;
  /** دور کمر شروع (سانتی‌متر) — برای نمایش کاهش سایز */
  startWaistCm?: number;
  /** دور کمر پایان (سانتی‌متر) */
  endWaistCm?: number;
  beforeImage: string;
  afterImage: string;
  /** اگر false باشد فقط در پنل مدیریت دیده می‌شود */
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  /** لینک اختیاری هنگام کلیک روی بنر */
  href?: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MagazineArticle {
  id: string;
  /** اسلاگ یکتا برای URL سئو */
  slug: string;
  title: string;
  excerpt: string;
  /** بدنه مقاله؛ پاراگراف‌ها با خط خالی جدا می‌شوند */
  body: string;
  category: string;
  coverImage: string;
  views: number;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  clinic: ClinicProfile;
  patients: Patient[];
  visits: Visit[];
  payments: Payment[];
  appointments: AppointmentRequest[];
  onlineConsults: OnlineConsultRequest[];
  measurements: ProgressMeasurement[];
  smsLogs: SmsLogEntry[];
  personalLedger: PersonalLedgerEntry[];
  champions: Champion[];
  promoBanners: PromoBanner[];
  articles: MagazineArticle[];
}

export const PERSONAL_INCOME_CATEGORIES = [
  "حقوق",
  "درآمد کلینیک",
  "پاداش",
  "سایر درآمد",
] as const;

export const PERSONAL_EXPENSE_CATEGORIES = [
  "خرید تجهیزات",
  "اجاره",
  "قبض و آبونمان",
  "حمل‌ونقل",
  "مواد مصرفی",
  "سایر هزینه",
] as const;

export function personalLedgerKindLabel(kind: PersonalLedgerKind) {
  return kind === "income" ? "درآمد" : "هزینه";
}

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  enabled: true,
  morningEnabled: true,
  morningHour: 8,
  hoursBeforeEnabled: true,
  hoursBefore: 3,
  template:
    "{name} عزیز، نوبت شما در {clinic} روز {date} ساعت {time} ({type}) است. منتظر دیدارتان هستیم.",
};

export const DEFAULT_CLINIC: ClinicProfile = {
  name: "تندیس",
  fullName: "کلینیک رژیم درمانی تندیس",
  tagline: "مراقبت شخصی برای مسیر سلامت و کاهش وزن",
  phone: "035-3826-1520",
  address:
    "یزد، صفاییه، بلوار دانشگاه، مجتمع تجاری خورشید، واحد ۱۵",
  hours: "شنبه، یکشنبه، سه‌شنبه و چهارشنبه · ۱۶ تا ۲۱",
  version: "1.0.0",
  workStart: "08:00",
  workEnd: "21:00",
  gridSlotMinutes: 15,
  visitSlotMinutes: 30,
  packageSlotMinutes: 60,
  reminderSettings: DEFAULT_REMINDER_SETTINGS,
};

export function patientFullName(patient: Pick<Patient, "firstName" | "lastName">) {
  return `${patient.firstName} ${patient.lastName}`.trim();
}

/** آواتار سفارشی یا پیش‌فرض بر اساس جنسیت */
export function patientAvatarSrc(
  patient: Pick<Patient, "avatarUrl" | "gender">
) {
  if (patient.avatarUrl) return patient.avatarUrl;
  return patient.gender === "male" ? "/avatars/male.svg" : "/avatars/female.svg";
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

export function visitChannelLabel(channel?: Visit["channel"]) {
  return channel === "phone" ? "تلفنی" : "حضوری";
}

export function onlineConsultStatusLabel(status: OnlineConsultStatus) {
  switch (status) {
    case "new":
      return "درخواست جدید";
    case "scheduled":
      return "نوبت رزرو شد";
    case "completed":
      return "انجام شد";
    case "cancelled":
      return "لغو شد";
  }
}

export function visitStatusLabel(status: VisitStatus) {
  switch (status) {
    case "visitor":
      return "در انتظار";
    case "admitted":
      return "پذیرش‌شده";
    case "completed":
      return "مراجعه کرد";
    case "cancelled":
      return "لغو / نیامد";
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

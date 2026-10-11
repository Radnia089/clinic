import { promises as fs } from "fs";
import path from "path";
import { prisma } from "@/lib/db";
import { ensureDefaultStaffUsers } from "@/lib/staff-auth";
import {
  AppData,
  AppointmentRequest,
  Champion,
  ClinicProfile,
  DEFAULT_CLINIC,
  DEFAULT_CLINIC_ABOUT,
  DEFAULT_REMINDER_SETTINGS,
  MagazineArticle,
  OnlineConsultRequest,
  Patient,
  PatientInboxMessage,
  Payment,
  PersonalLedgerEntry,
  ProgressMeasurement,
  PromoBanner,
  SmsLogEntry,
  SupportTicket,
  Visit,
  AdmissionForm,
} from "@/lib/types";
import { defaultChampions, sortChampions } from "@/lib/champions";
import { defaultArticles, sortArticles } from "@/lib/magazine";
import {
  defaultPromoBanners,
  sortPromoBanners,
} from "@/lib/promo-banners";
import { mergeReminderSettings } from "@/lib/sms";

const DATA_DIR = path.join(process.cwd(), ".data");
const LEGACY_JSON = path.join(DATA_DIR, "clinic-app.json");

let seedPromise: Promise<void> | null = null;

function iso(d: Date | string | null | undefined) {
  if (!d) return undefined;
  if (typeof d === "string") return d;
  return d.toISOString();
}

function asDate(value: string | Date | undefined | null) {
  if (!value) return new Date();
  return value instanceof Date ? value : new Date(value);
}

function parseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function normalizePatientRecord(raw: Patient): Patient {
  const firstName = String(raw.firstName ?? "").trim();
  const lastName = String(raw.lastName ?? "").trim();
  const source = raw.source === "app" ? "app" : "clinic";
  const profileComplete =
    typeof raw.profileComplete === "boolean"
      ? raw.profileComplete
      : Boolean(firstName && lastName);
  return {
    ...raw,
    firstName,
    lastName,
    source,
    profileComplete,
  };
}

function mapPatient(row: {
  id: string;
  firstName: string;
  lastName: string;
  age: number | null;
  gender: string;
  phone: string;
  nationalId: string | null;
  address: string;
  province: string | null;
  city: string | null;
  birthDate: string | null;
  notes: string | null;
  heightCm: number | null;
  goalWeightKg: number | null;
  avatarUrl: string | null;
  source: string;
  profileComplete: boolean;
  phoneVerifiedAt: Date | null;
  passwordHash: string | null;
  passwordSetAt: Date | null;
  welcomeSmsSentAt: Date | null;
  appReviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): Patient {
  return normalizePatientRecord({
    id: row.id,
    firstName: row.firstName,
    lastName: row.lastName,
    age: row.age ?? undefined,
    gender: (row.gender as Patient["gender"]) || "female",
    phone: row.phone,
    nationalId: row.nationalId ?? undefined,
    address: row.address ?? "",
    province: row.province ?? undefined,
    city: row.city ?? undefined,
    birthDate: row.birthDate ?? undefined,
    notes: row.notes ?? undefined,
    heightCm: row.heightCm ?? undefined,
    goalWeightKg: row.goalWeightKg ?? undefined,
    avatarUrl: row.avatarUrl ?? undefined,
    source: row.source === "app" ? "app" : "clinic",
    profileComplete: row.profileComplete,
    phoneVerifiedAt: iso(row.phoneVerifiedAt),
    passwordHash: row.passwordHash ?? undefined,
    passwordSetAt: iso(row.passwordSetAt),
    welcomeSmsSentAt: iso(row.welcomeSmsSentAt),
    appReviewedAt: iso(row.appReviewedAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}

function mapVisit(row: {
  id: string;
  patientId: string;
  visitDate: string;
  visitTime: string | null;
  durationMinutes: number | null;
  visitType: string;
  channel: string;
  status: string;
  packageName: string | null;
  admissionJson: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Visit {
  const admission = parseJson<AdmissionForm | undefined>(
    row.admissionJson,
    undefined
  );
  return {
    id: row.id,
    patientId: row.patientId,
    visitDate: row.visitDate,
    visitTime: row.visitTime ?? undefined,
    durationMinutes: row.durationMinutes ?? undefined,
    visitType: row.visitType as Visit["visitType"],
    channel: (row.channel as Visit["channel"]) || "clinic",
    status: row.status as Visit["status"],
    packageName: row.packageName ?? undefined,
    admission,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapPayment(row: {
  id: string;
  patientId: string;
  visitId: string | null;
  title: string;
  amount: number;
  paidAmount: number;
  method: string;
  status: string;
  note: string | null;
  createdAt: Date;
}): Payment {
  return {
    id: row.id,
    patientId: row.patientId,
    visitId: row.visitId ?? undefined,
    title: row.title,
    amount: row.amount,
    paidAmount: row.paidAmount,
    method: row.method as Payment["method"],
    status: row.status as Payment["status"],
    note: row.note ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapAppointment(row: {
  id: string;
  name: string;
  phone: string;
  preferredDate: string | null;
  preferredTime: string | null;
  service: string;
  note: string | null;
  channel: string;
  status: string;
  createdAt: Date;
}): AppointmentRequest {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    preferredDate: row.preferredDate ?? undefined,
    preferredTime: row.preferredTime ?? undefined,
    service: row.service,
    note: row.note ?? undefined,
    channel: (row.channel as AppointmentRequest["channel"]) || "clinic",
    status: row.status as AppointmentRequest["status"],
    createdAt: row.createdAt.toISOString(),
  };
}

function mapOnlineConsult(row: {
  id: string;
  name: string;
  phone: string;
  age: number | null;
  gender: string | null;
  heightCm: number | null;
  weightKg: number | null;
  armCm: number | null;
  waistCm: number | null;
  hipCm: number | null;
  thighCm: number | null;
  calfCm: number | null;
  note: string | null;
  preferredDate: string | null;
  status: string;
  scheduledDate: string | null;
  scheduledTime: string | null;
  smsNotifiedAt: Date | null;
  callStartedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): OnlineConsultRequest {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    age: row.age ?? undefined,
    gender: (row.gender as OnlineConsultRequest["gender"]) || undefined,
    heightCm: row.heightCm ?? undefined,
    weightKg: row.weightKg ?? undefined,
    armCm: row.armCm ?? undefined,
    waistCm: row.waistCm ?? undefined,
    hipCm: row.hipCm ?? undefined,
    thighCm: row.thighCm ?? undefined,
    calfCm: row.calfCm ?? undefined,
    note: row.note ?? undefined,
    preferredDate: row.preferredDate ?? undefined,
    status: row.status as OnlineConsultRequest["status"],
    scheduledDate: row.scheduledDate ?? undefined,
    scheduledTime: row.scheduledTime ?? undefined,
    smsNotifiedAt: iso(row.smsNotifiedAt),
    callStartedAt: iso(row.callStartedAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapMeasurement(row: {
  id: string;
  patientId: string;
  recordedAt: Date;
  weightKg: number;
  waistCm: number | null;
  hipCm: number | null;
  armCm: number | null;
  thighCm: number | null;
  calfCm: number | null;
  note: string | null;
  createdAt: Date;
}): ProgressMeasurement {
  return {
    id: row.id,
    patientId: row.patientId,
    recordedAt: row.recordedAt.toISOString(),
    weightKg: row.weightKg,
    waistCm: row.waistCm ?? undefined,
    hipCm: row.hipCm ?? undefined,
    armCm: row.armCm ?? undefined,
    thighCm: row.thighCm ?? undefined,
    calfCm: row.calfCm ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapSmsLog(row: {
  id: string;
  visitId: string | null;
  patientId: string | null;
  onlineConsultId: string | null;
  patientName: string;
  phone: string;
  kind: string;
  body: string;
  status: string;
  provider: string;
  error: string | null;
  dedupeKey: string;
  createdAt: Date;
}): SmsLogEntry {
  return {
    id: row.id,
    visitId: row.visitId ?? undefined,
    patientId: row.patientId ?? undefined,
    onlineConsultId: row.onlineConsultId ?? undefined,
    patientName: row.patientName,
    phone: row.phone,
    kind: row.kind as SmsLogEntry["kind"],
    body: row.body,
    status: row.status as SmsLogEntry["status"],
    provider: row.provider as SmsLogEntry["provider"],
    error: row.error ?? undefined,
    dedupeKey: row.dedupeKey,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapLedger(row: {
  id: string;
  kind: string;
  category: string;
  title: string | null;
  amount: number;
  entryDate: string;
  note: string | null;
  createdAt: Date;
}): PersonalLedgerEntry {
  return {
    id: row.id,
    kind: row.kind as PersonalLedgerEntry["kind"],
    category: row.category,
    title: row.title ?? undefined,
    amount: row.amount,
    entryDate: row.entryDate,
    note: row.note ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function mapChampion(row: {
  id: string;
  name: string;
  quote: string;
  startKg: number;
  endKg: number;
  startWaistCm: number | null;
  endWaistCm: number | null;
  beforeImage: string;
  afterImage: string;
  published: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): Champion {
  return {
    id: row.id,
    name: row.name,
    quote: row.quote,
    startKg: row.startKg,
    endKg: row.endKg,
    startWaistCm: row.startWaistCm ?? undefined,
    endWaistCm: row.endWaistCm ?? undefined,
    beforeImage: row.beforeImage,
    afterImage: row.afterImage,
    published: row.published,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapPromo(row: {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  href: string | null;
  published: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): PromoBanner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle ?? undefined,
    image: row.image,
    href: row.href ?? undefined,
    published: row.published,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapArticle(row: {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  coverImage: string;
  views: number;
  published: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): MagazineArticle {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    category: row.category,
    coverImage: row.coverImage,
    views: row.views,
    published: row.published,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapInboxMessage(row: {
  id: string;
  title: string;
  body: string;
  audience: string;
  patientIds: string | null;
  createdAt: Date;
  createdBy: string | null;
}): PatientInboxMessage {
  const patientIds = parseJson<string[] | undefined>(row.patientIds, undefined);
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    audience: row.audience as PatientInboxMessage["audience"],
    patientIds,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy ?? undefined,
  };
}

function mapTicket(row: {
  id: string;
  patientId: string;
  patientName: string;
  phone: string;
  category: string;
  subject: string;
  body: string;
  status: string;
  clinicReply: string | null;
  createdAt: Date;
  updatedAt: Date;
}): SupportTicket {
  return {
    id: row.id,
    patientId: row.patientId,
    patientName: row.patientName,
    phone: row.phone,
    category: row.category as SupportTicket["category"],
    subject: row.subject,
    body: row.body,
    status: row.status as SupportTicket["status"],
    clinicReply: row.clinicReply ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function normalizeClinic(raw: Partial<ClinicProfile> | null | undefined): ClinicProfile {
  return {
    ...DEFAULT_CLINIC,
    ...(raw ?? {}),
    reminderSettings: mergeReminderSettings(
      raw?.reminderSettings ?? DEFAULT_REMINDER_SETTINGS
    ),
    about: {
      ...DEFAULT_CLINIC_ABOUT,
      ...(raw?.about ?? {}),
      gallery: Array.isArray(raw?.about?.gallery)
        ? raw!.about!.gallery.filter(Boolean)
        : DEFAULT_CLINIC_ABOUT.gallery,
    },
  };
}

async function getClinic(): Promise<ClinicProfile> {
  const row = await prisma.clinicSettings.findUnique({
    where: { id: "default" },
  });
  if (!row) return normalizeClinic(DEFAULT_CLINIC);
  return normalizeClinic(parseJson<Partial<ClinicProfile>>(row.dataJson, {}));
}

async function saveClinic(clinic: ClinicProfile) {
  await prisma.clinicSettings.upsert({
    where: { id: "default" },
    create: { id: "default", dataJson: JSON.stringify(clinic) },
    update: { dataJson: JSON.stringify(clinic) },
  });
}

async function importLegacyJsonIfPresent() {
  try {
    const raw = await fs.readFile(LEGACY_JSON, "utf8");
    const parsed = JSON.parse(raw) as AppData;

    const patientCount = await prisma.patient.count();
    if (patientCount === 0 && (parsed.patients?.length ?? 0) > 0) {
      for (const p of parsed.patients) {
        const n = normalizePatientRecord(p);
        await prisma.patient.create({
          data: {
            id: n.id,
            firstName: n.firstName,
            lastName: n.lastName,
            age: n.age ?? null,
            gender: n.gender,
            phone: n.phone,
            nationalId: n.nationalId ?? null,
            address: n.address ?? "",
            province: n.province ?? null,
            city: n.city ?? null,
            birthDate: n.birthDate ?? null,
            notes: n.notes ?? null,
            heightCm: n.heightCm ?? null,
            goalWeightKg: n.goalWeightKg ?? null,
            avatarUrl: n.avatarUrl ?? null,
            source: n.source,
            profileComplete: n.profileComplete,
            phoneVerifiedAt: n.phoneVerifiedAt
              ? new Date(n.phoneVerifiedAt)
              : null,
            passwordHash: n.passwordHash ?? null,
            passwordSetAt: n.passwordSetAt ? new Date(n.passwordSetAt) : null,
            welcomeSmsSentAt: n.welcomeSmsSentAt
              ? new Date(n.welcomeSmsSentAt)
              : null,
            appReviewedAt: n.appReviewedAt ? new Date(n.appReviewedAt) : null,
            createdAt: asDate(n.createdAt),
            updatedAt: asDate(n.updatedAt),
          },
        });
      }
    }

    if ((await prisma.visit.count()) === 0 && parsed.visits?.length) {
      for (const v of parsed.visits) {
        await prisma.visit.create({
          data: {
            id: v.id,
            patientId: v.patientId,
            visitDate: v.visitDate,
            visitTime: v.visitTime ?? null,
            durationMinutes: v.durationMinutes ?? null,
            visitType: v.visitType,
            channel: v.channel ?? "clinic",
            status: v.status,
            packageName: v.packageName ?? null,
            admissionJson: v.admission ? JSON.stringify(v.admission) : null,
            createdAt: asDate(v.createdAt),
            updatedAt: asDate(v.updatedAt),
          },
        });
      }
    }

    if ((await prisma.payment.count()) === 0 && parsed.payments?.length) {
      for (const p of parsed.payments) {
        await prisma.payment.create({
          data: {
            id: p.id,
            patientId: p.patientId,
            visitId: p.visitId ?? null,
            title: p.title,
            amount: p.amount,
            paidAmount: p.paidAmount,
            method: p.method,
            status: p.status,
            note: p.note ?? null,
            createdAt: asDate(p.createdAt),
          },
        });
      }
    }

    if (
      (await prisma.appointment.count()) === 0 &&
      parsed.appointments?.length
    ) {
      for (const a of parsed.appointments) {
        await prisma.appointment.create({
          data: {
            id: a.id,
            name: a.name,
            phone: a.phone,
            preferredDate: a.preferredDate ?? null,
            preferredTime: a.preferredTime ?? null,
            service: a.service,
            note: a.note ?? null,
            channel: a.channel ?? "clinic",
            status: a.status,
            createdAt: asDate(a.createdAt),
          },
        });
      }
    }

    if (
      (await prisma.onlineConsult.count()) === 0 &&
      parsed.onlineConsults?.length
    ) {
      for (const c of parsed.onlineConsults) {
        await prisma.onlineConsult.create({
          data: {
            id: c.id,
            name: c.name,
            phone: c.phone,
            age: c.age ?? null,
            gender: c.gender ?? null,
            heightCm: c.heightCm ?? null,
            weightKg: c.weightKg ?? null,
            armCm: c.armCm ?? null,
            waistCm: c.waistCm ?? null,
            hipCm: c.hipCm ?? null,
            thighCm: c.thighCm ?? null,
            calfCm: c.calfCm ?? null,
            note: c.note ?? null,
            preferredDate: c.preferredDate ?? null,
            status: c.status,
            scheduledDate: c.scheduledDate ?? null,
            scheduledTime: c.scheduledTime ?? null,
            smsNotifiedAt: c.smsNotifiedAt ? new Date(c.smsNotifiedAt) : null,
            callStartedAt: c.callStartedAt ? new Date(c.callStartedAt) : null,
            createdAt: asDate(c.createdAt),
            updatedAt: asDate(c.updatedAt),
          },
        });
      }
    }

    if (
      (await prisma.measurement.count()) === 0 &&
      parsed.measurements?.length
    ) {
      for (const m of parsed.measurements) {
        await prisma.measurement.create({
          data: {
            id: m.id,
            patientId: m.patientId,
            recordedAt: asDate(m.recordedAt),
            weightKg: m.weightKg,
            waistCm: m.waistCm ?? null,
            hipCm: m.hipCm ?? null,
            armCm: m.armCm ?? null,
            thighCm: m.thighCm ?? null,
            calfCm: m.calfCm ?? null,
            note: m.note ?? null,
            createdAt: asDate(m.createdAt),
          },
        });
      }
    }

    if ((await prisma.smsLog.count()) === 0 && parsed.smsLogs?.length) {
      for (const s of parsed.smsLogs.slice(0, 500)) {
        const visitOk =
          s.visitId &&
          !s.visitId.startsWith("test") &&
          !s.visitId.startsWith("promo:");
        await prisma.smsLog.create({
          data: {
            id: s.id,
            visitId: visitOk ? s.visitId! : null,
            patientId:
              s.patientId && s.patientId !== "test" ? s.patientId : null,
            onlineConsultId: s.onlineConsultId ?? null,
            patientName: s.patientName,
            phone: s.phone,
            kind: s.kind,
            body: s.body,
            status: s.status,
            provider: s.provider,
            error: s.error ?? null,
            dedupeKey: s.dedupeKey,
            createdAt: asDate(s.createdAt),
          },
        });
      }
    }

    if (
      (await prisma.personalLedger.count()) === 0 &&
      parsed.personalLedger?.length
    ) {
      for (const e of parsed.personalLedger) {
        await prisma.personalLedger.create({
          data: {
            id: e.id,
            kind: e.kind,
            category: e.category,
            title: e.title ?? null,
            amount: e.amount,
            entryDate: e.entryDate,
            note: e.note ?? null,
            createdAt: asDate(e.createdAt),
          },
        });
      }
    }

    if (
      (await prisma.supportTicket.count()) === 0 &&
      parsed.supportTickets?.length
    ) {
      for (const t of parsed.supportTickets) {
        await prisma.supportTicket.create({
          data: {
            id: t.id,
            patientId: t.patientId,
            patientName: t.patientName,
            phone: t.phone,
            category: t.category,
            subject: t.subject,
            body: t.body,
            status: t.status,
            clinicReply: t.clinicReply ?? null,
            createdAt: asDate(t.createdAt),
            updatedAt: asDate(t.updatedAt),
          },
        });
      }
    }

    if (
      (await prisma.inboxMessage.count()) === 0 &&
      parsed.patientInboxMessages?.length
    ) {
      for (const m of parsed.patientInboxMessages) {
        await prisma.inboxMessage.create({
          data: {
            id: m.id,
            title: m.title,
            body: m.body,
            audience: m.audience,
            patientIds: m.patientIds ? JSON.stringify(m.patientIds) : null,
            createdAt: asDate(m.createdAt),
            createdBy: m.createdBy ?? null,
          },
        });
      }
    }

    if (
      (await prisma.inboxRead.count()) === 0 &&
      parsed.patientInboxReads?.length
    ) {
      for (const r of parsed.patientInboxReads) {
        await prisma.inboxRead.create({
          data: {
            patientId: r.patientId,
            messageId: r.messageId,
            readAt: asDate(r.readAt),
          },
        });
      }
    }

    if (parsed.clinic) {
      const existing = await prisma.clinicSettings.findUnique({
        where: { id: "default" },
      });
      if (!existing) {
        await saveClinic(normalizeClinic(parsed.clinic));
      }
    }

    if ((await prisma.champion.count()) === 0 && parsed.champions?.length) {
      for (const c of parsed.champions) {
        await prisma.champion.create({
          data: {
            id: c.id,
            name: c.name,
            quote: c.quote ?? "",
            startKg: c.startKg,
            endKg: c.endKg,
            startWaistCm: c.startWaistCm ?? null,
            endWaistCm: c.endWaistCm ?? null,
            beforeImage: c.beforeImage,
            afterImage: c.afterImage,
            published: c.published,
            sortOrder: c.sortOrder,
            createdAt: asDate(c.createdAt),
            updatedAt: asDate(c.updatedAt),
          },
        });
      }
    }

    if (
      (await prisma.promoBanner.count()) === 0 &&
      parsed.promoBanners?.length
    ) {
      for (const b of parsed.promoBanners) {
        await prisma.promoBanner.create({
          data: {
            id: b.id,
            title: b.title,
            subtitle: b.subtitle ?? null,
            image: b.image,
            href: b.href ?? null,
            published: b.published,
            sortOrder: b.sortOrder,
            createdAt: asDate(b.createdAt),
            updatedAt: asDate(b.updatedAt),
          },
        });
      }
    }

    if ((await prisma.article.count()) === 0 && parsed.articles?.length) {
      for (const a of parsed.articles) {
        await prisma.article.create({
          data: {
            id: a.id,
            slug: a.slug,
            title: a.title,
            excerpt: a.excerpt ?? "",
            body: a.body ?? "",
            category: a.category ?? "",
            coverImage: a.coverImage ?? "",
            views: a.views ?? 0,
            published: a.published,
            sortOrder: a.sortOrder,
            createdAt: asDate(a.createdAt),
            updatedAt: asDate(a.updatedAt),
          },
        });
      }
    }
  } catch {
    // فایل قدیمی نیست یا خراب است — نادیده بگیر
  }
}

async function seedDefaults() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await ensureDefaultStaffUsers();

  const settings = await prisma.clinicSettings.findUnique({
    where: { id: "default" },
  });
  if (!settings) {
    await saveClinic(normalizeClinic(DEFAULT_CLINIC));
  }

  await importLegacyJsonIfPresent();

  if ((await prisma.champion.count()) === 0) {
    for (const c of defaultChampions()) {
      await prisma.champion.create({
        data: {
          id: c.id,
          name: c.name,
          quote: c.quote,
          startKg: c.startKg,
          endKg: c.endKg,
          startWaistCm: c.startWaistCm ?? null,
          endWaistCm: c.endWaistCm ?? null,
          beforeImage: c.beforeImage,
          afterImage: c.afterImage,
          published: c.published,
          sortOrder: c.sortOrder,
          createdAt: asDate(c.createdAt),
          updatedAt: asDate(c.updatedAt),
        },
      });
    }
  }

  if ((await prisma.promoBanner.count()) === 0) {
    for (const b of defaultPromoBanners()) {
      await prisma.promoBanner.create({
        data: {
          id: b.id,
          title: b.title,
          subtitle: b.subtitle ?? null,
          image: b.image,
          href: b.href ?? null,
          published: b.published,
          sortOrder: b.sortOrder,
          createdAt: asDate(b.createdAt),
          updatedAt: asDate(b.updatedAt),
        },
      });
    }
  }

  if ((await prisma.article.count()) === 0) {
    for (const a of defaultArticles()) {
      await prisma.article.create({
        data: {
          id: a.id,
          slug: a.slug,
          title: a.title,
          excerpt: a.excerpt,
          body: a.body,
          category: a.category,
          coverImage: a.coverImage,
          views: a.views,
          published: a.published,
          sortOrder: a.sortOrder,
          createdAt: asDate(a.createdAt),
          updatedAt: asDate(a.updatedAt),
        },
      });
    }
  } else {
    // همگام‌سازی محتوای seeded بدون از دست رفتن بازدید
    const defaults = defaultArticles();
    for (const seed of defaults) {
      const existing = await prisma.article.findUnique({
        where: { id: seed.id },
      });
      if (!existing) {
        await prisma.article.create({
          data: {
            id: seed.id,
            slug: seed.slug,
            title: seed.title,
            excerpt: seed.excerpt,
            body: seed.body,
            category: seed.category,
            coverImage: seed.coverImage,
            views: seed.views,
            published: seed.published,
            sortOrder: seed.sortOrder,
            createdAt: asDate(seed.createdAt),
            updatedAt: asDate(seed.updatedAt),
          },
        });
        continue;
      }
      if (
        existing.title !== seed.title ||
        existing.slug !== seed.slug ||
        existing.excerpt !== seed.excerpt ||
        existing.body !== seed.body ||
        existing.coverImage !== seed.coverImage ||
        existing.category !== seed.category ||
        existing.sortOrder !== seed.sortOrder
      ) {
        await prisma.article.update({
          where: { id: seed.id },
          data: {
            title: seed.title,
            slug: seed.slug,
            excerpt: seed.excerpt,
            body: seed.body,
            coverImage: seed.coverImage,
            category: seed.category,
            sortOrder: seed.sortOrder,
            published: seed.published,
            updatedAt: asDate(seed.updatedAt),
          },
        });
      }
    }
  }
}

export async function ensureDbReady() {
  if (!seedPromise) {
    seedPromise = seedDefaults().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  await seedPromise;
}

function sanitizeSmsFk(id?: string | null) {
  if (!id) return null;
  if (id === "test" || id.startsWith("test") || id.startsWith("promo:")) {
    return null;
  }
  return id;
}

export async function getAppData(): Promise<AppData> {
  await ensureDbReady();
  const [
    clinic,
    patients,
    visits,
    payments,
    appointments,
    onlineConsults,
    measurements,
    smsLogs,
    personalLedger,
    champions,
    promoBanners,
    articles,
    patientInboxMessages,
    reads,
    supportTickets,
  ] = await Promise.all([
    getClinic(),
    prisma.patient.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.visit.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.payment.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.appointment.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.onlineConsult.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.measurement.findMany({ orderBy: { recordedAt: "asc" } }),
    prisma.smsLog.findMany({ orderBy: { createdAt: "desc" }, take: 500 }),
    prisma.personalLedger.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.champion.findMany(),
    prisma.promoBanner.findMany(),
    prisma.article.findMany(),
    prisma.inboxMessage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.inboxRead.findMany(),
    prisma.supportTicket.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return {
    clinic,
    patients: patients.map(mapPatient),
    visits: visits.map(mapVisit),
    payments: payments.map(mapPayment),
    appointments: appointments.map(mapAppointment),
    onlineConsults: onlineConsults.map(mapOnlineConsult),
    measurements: measurements.map(mapMeasurement),
    smsLogs: smsLogs.map(mapSmsLog),
    personalLedger: personalLedger.map(mapLedger),
    champions: champions.map(mapChampion),
    promoBanners: promoBanners.map(mapPromo),
    articles: articles.map(mapArticle),
    patientInboxMessages: patientInboxMessages.map(mapInboxMessage),
    patientInboxReads: reads.map((r) => ({
      patientId: r.patientId,
      messageId: r.messageId,
      readAt: r.readAt.toISOString(),
    })),
    supportTickets: supportTickets.map(mapTicket),
  };
}

export async function updateClinic(patch: Partial<AppData["clinic"]>) {
  await ensureDbReady();
  const current = await getClinic();
  const next = normalizeClinic({
    ...current,
    ...patch,
    reminderSettings: mergeReminderSettings({
      ...current.reminderSettings,
      ...(patch.reminderSettings ?? {}),
    }),
    about: {
      ...DEFAULT_CLINIC_ABOUT,
      ...current.about,
      ...(patch.about ?? {}),
      gallery: Array.isArray(patch.about?.gallery)
        ? patch.about.gallery.filter(Boolean)
        : (current.about?.gallery ?? DEFAULT_CLINIC_ABOUT.gallery),
    },
  });
  await saveClinic(next);
  return next;
}

export async function listSmsLogs(limit = 100) {
  await ensureDbReady();
  const logs = await prisma.smsLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return logs.map(mapSmsLog);
}

export async function hasSmsDedupe(dedupeKey: string) {
  await ensureDbReady();
  const hit = await prisma.smsLog.findFirst({
    where: {
      dedupeKey,
      NOT: { status: "failed" },
    },
  });
  return Boolean(hit);
}

export async function createSmsLog(
  input: Omit<SmsLogEntry, "id" | "createdAt">
) {
  await ensureDbReady();
  const entry = await prisma.smsLog.create({
    data: {
      visitId: sanitizeSmsFk(input.visitId),
      patientId: sanitizeSmsFk(input.patientId),
      onlineConsultId: input.onlineConsultId ?? null,
      patientName: input.patientName,
      phone: input.phone,
      kind: input.kind,
      body: input.body,
      status: input.status,
      provider: input.provider,
      error: input.error ?? null,
      dedupeKey: input.dedupeKey,
    },
  });
  const count = await prisma.smsLog.count();
  if (count > 500) {
    const old = await prisma.smsLog.findMany({
      orderBy: { createdAt: "asc" },
      take: count - 500,
      select: { id: true },
    });
    if (old.length) {
      await prisma.smsLog.deleteMany({
        where: { id: { in: old.map((o) => o.id) } },
      });
    }
  }
  return mapSmsLog(entry);
}

export async function listPersonalLedger() {
  await ensureDbReady();
  const items = await prisma.personalLedger.findMany();
  return items
    .map(mapLedger)
    .sort((a, b) => {
      const byDate = b.entryDate.localeCompare(a.entryDate);
      if (byDate !== 0) return byDate;
      return b.createdAt.localeCompare(a.createdAt);
    });
}

export async function createPersonalLedgerEntry(
  input: Omit<PersonalLedgerEntry, "id" | "createdAt">
) {
  await ensureDbReady();
  const entry = await prisma.personalLedger.create({
    data: {
      kind: input.kind,
      category: input.category,
      title: input.title ?? null,
      amount: input.amount,
      entryDate: input.entryDate,
      note: input.note ?? null,
    },
  });
  return mapLedger(entry);
}

export async function deletePersonalLedgerEntry(id: string) {
  await ensureDbReady();
  try {
    await prisma.personalLedger.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function listPatients() {
  await ensureDbReady();
  const rows = await prisma.patient.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapPatient);
}

export async function getPatient(id: string) {
  await ensureDbReady();
  const row = await prisma.patient.findUnique({ where: { id } });
  return row ? mapPatient(row) : null;
}

export async function createPatient(
  input: Omit<Patient, "id" | "createdAt" | "updatedAt">
) {
  await ensureDbReady();
  const n = normalizePatientRecord({
    ...input,
    id: "tmp",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  const row = await prisma.patient.create({
    data: {
      firstName: n.firstName,
      lastName: n.lastName,
      age: n.age ?? null,
      gender: n.gender,
      phone: n.phone,
      nationalId: n.nationalId ?? null,
      address: n.address ?? "",
      province: n.province ?? null,
      city: n.city ?? null,
      birthDate: n.birthDate ?? null,
      notes: n.notes ?? null,
      heightCm: n.heightCm ?? null,
      goalWeightKg: n.goalWeightKg ?? null,
      avatarUrl: n.avatarUrl ?? null,
      source: n.source,
      profileComplete: n.profileComplete,
      phoneVerifiedAt: n.phoneVerifiedAt ? new Date(n.phoneVerifiedAt) : null,
      passwordHash: n.passwordHash ?? null,
      passwordSetAt: n.passwordSetAt ? new Date(n.passwordSetAt) : null,
      welcomeSmsSentAt: n.welcomeSmsSentAt
        ? new Date(n.welcomeSmsSentAt)
        : null,
      appReviewedAt: n.appReviewedAt ? new Date(n.appReviewedAt) : null,
    },
  });
  return mapPatient(row);
}

export async function listAppSignups() {
  const patients = await listPatients();
  return patients
    .filter((p) => p.source === "app")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updatePatient(
  id: string,
  patch: Partial<Omit<Patient, "id" | "createdAt">>
) {
  await ensureDbReady();
  const current = await prisma.patient.findUnique({ where: { id } });
  if (!current) return null;

  const data: Record<string, unknown> = {};
  const assign = <K extends keyof Patient>(key: K, value: Patient[K] | null) => {
    if (key in patch) data[key] = value;
  };

  if ("firstName" in patch) data.firstName = String(patch.firstName ?? "").trim();
  if ("lastName" in patch) data.lastName = String(patch.lastName ?? "").trim();
  if ("age" in patch) data.age = patch.age ?? null;
  if ("gender" in patch) data.gender = patch.gender;
  if ("phone" in patch) data.phone = patch.phone;
  if ("nationalId" in patch) data.nationalId = patch.nationalId || null;
  if ("address" in patch) data.address = patch.address ?? "";
  if ("province" in patch) data.province = patch.province || null;
  if ("city" in patch) data.city = patch.city || null;
  if ("birthDate" in patch) data.birthDate = patch.birthDate || null;
  if ("notes" in patch) data.notes = patch.notes ?? null;
  if ("heightCm" in patch) data.heightCm = patch.heightCm ?? null;
  if ("goalWeightKg" in patch) data.goalWeightKg = patch.goalWeightKg ?? null;
  if ("avatarUrl" in patch) data.avatarUrl = patch.avatarUrl || null;
  if ("source" in patch) data.source = patch.source;
  if ("profileComplete" in patch) data.profileComplete = patch.profileComplete;
  if ("phoneVerifiedAt" in patch) {
    data.phoneVerifiedAt = patch.phoneVerifiedAt
      ? new Date(patch.phoneVerifiedAt)
      : null;
  }
  if ("passwordHash" in patch) {
    if (!patch.passwordHash) {
      data.passwordHash = null;
      data.passwordSetAt = null;
    } else {
      data.passwordHash = patch.passwordHash;
      if ("passwordSetAt" in patch) {
        data.passwordSetAt = patch.passwordSetAt
          ? new Date(patch.passwordSetAt)
          : null;
      }
    }
  } else if ("passwordSetAt" in patch) {
    data.passwordSetAt = patch.passwordSetAt
      ? new Date(patch.passwordSetAt)
      : null;
  }
  if ("welcomeSmsSentAt" in patch) {
    data.welcomeSmsSentAt = patch.welcomeSmsSentAt
      ? new Date(patch.welcomeSmsSentAt)
      : null;
  }
  if ("appReviewedAt" in patch) {
    data.appReviewedAt = patch.appReviewedAt
      ? new Date(patch.appReviewedAt)
      : null;
  }

  void assign;
  const row = await prisma.patient.update({ where: { id }, data });
  return mapPatient(row);
}

export async function findPatientByPhone(phone: string) {
  await ensureDbReady();
  const normalized = phone.replace(/\s|-/g, "");
  const rows = await prisma.patient.findMany();
  const hit = rows.find((p) => p.phone.replace(/\s|-/g, "") === normalized);
  return hit ? mapPatient(hit) : null;
}

export async function listVisits() {
  await ensureDbReady();
  const rows = await prisma.visit.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(mapVisit);
}

export async function getVisit(id: string) {
  await ensureDbReady();
  const row = await prisma.visit.findUnique({ where: { id } });
  return row ? mapVisit(row) : null;
}

export async function createVisit(
  input: Omit<Visit, "id" | "createdAt" | "updatedAt" | "admission"> & {
    admission?: Visit["admission"];
  }
) {
  await ensureDbReady();
  const row = await prisma.visit.create({
    data: {
      patientId: input.patientId,
      visitDate: input.visitDate,
      visitTime: input.visitTime ?? null,
      durationMinutes: input.durationMinutes ?? null,
      visitType: input.visitType,
      channel: input.channel ?? "clinic",
      status: input.status,
      packageName: input.packageName ?? null,
      admissionJson: input.admission ? JSON.stringify(input.admission) : null,
    },
  });
  return mapVisit(row);
}

export async function updateVisit(id: string, patch: Partial<Visit>) {
  await ensureDbReady();
  const current = await prisma.visit.findUnique({ where: { id } });
  if (!current) return null;
  const row = await prisma.visit.update({
    where: { id },
    data: {
      ...(patch.patientId !== undefined ? { patientId: patch.patientId } : {}),
      ...(patch.visitDate !== undefined ? { visitDate: patch.visitDate } : {}),
      ...(patch.visitTime !== undefined
        ? { visitTime: patch.visitTime ?? null }
        : {}),
      ...(patch.durationMinutes !== undefined
        ? { durationMinutes: patch.durationMinutes ?? null }
        : {}),
      ...(patch.visitType !== undefined ? { visitType: patch.visitType } : {}),
      ...(patch.channel !== undefined
        ? { channel: patch.channel ?? "clinic" }
        : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.packageName !== undefined
        ? { packageName: patch.packageName ?? null }
        : {}),
      ...(patch.admission !== undefined
        ? {
            admissionJson: patch.admission
              ? JSON.stringify(patch.admission)
              : null,
          }
        : {}),
    },
  });
  return mapVisit(row);
}

export async function listPayments() {
  await ensureDbReady();
  const rows = await prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapPayment);
}

export async function createPayment(input: Omit<Payment, "id" | "createdAt">) {
  await ensureDbReady();
  const row = await prisma.payment.create({
    data: {
      patientId: input.patientId,
      visitId: input.visitId ?? null,
      title: input.title,
      amount: input.amount,
      paidAmount: input.paidAmount,
      method: input.method,
      status: input.status,
      note: input.note ?? null,
    },
  });
  return mapPayment(row);
}

export async function updatePayment(id: string, patch: Partial<Payment>) {
  await ensureDbReady();
  const current = await prisma.payment.findUnique({ where: { id } });
  if (!current) return null;
  const row = await prisma.payment.update({
    where: { id },
    data: {
      ...(patch.patientId !== undefined ? { patientId: patch.patientId } : {}),
      ...(patch.visitId !== undefined ? { visitId: patch.visitId ?? null } : {}),
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.amount !== undefined ? { amount: patch.amount } : {}),
      ...(patch.paidAmount !== undefined
        ? { paidAmount: patch.paidAmount }
        : {}),
      ...(patch.method !== undefined ? { method: patch.method } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.note !== undefined ? { note: patch.note ?? null } : {}),
    },
  });
  return mapPayment(row);
}

export async function listAppointments() {
  await ensureDbReady();
  const rows = await prisma.appointment.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapAppointment);
}

export async function createAppointment(
  input: Omit<AppointmentRequest, "id" | "createdAt" | "status"> & {
    channel?: AppointmentRequest["channel"];
  }
) {
  await ensureDbReady();
  const row = await prisma.appointment.create({
    data: {
      name: input.name,
      phone: input.phone,
      preferredDate: input.preferredDate ?? null,
      preferredTime: input.preferredTime ?? null,
      service: input.service,
      note: input.note ?? null,
      channel: input.channel ?? "clinic",
      status: "new",
    },
  });
  return mapAppointment(row);
}

export async function listAppointmentsByPhone(phone: string) {
  const normalized = phone.replace(/\D/g, "");
  const all = await listAppointments();
  return all.filter((a) => a.phone.replace(/\D/g, "") === normalized);
}

export async function updateAppointment(
  id: string,
  patch: Partial<AppointmentRequest>
) {
  await ensureDbReady();
  const current = await prisma.appointment.findUnique({ where: { id } });
  if (!current) return null;
  const row = await prisma.appointment.update({
    where: { id },
    data: {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
      ...(patch.preferredDate !== undefined
        ? { preferredDate: patch.preferredDate ?? null }
        : {}),
      ...(patch.preferredTime !== undefined
        ? { preferredTime: patch.preferredTime ?? null }
        : {}),
      ...(patch.service !== undefined ? { service: patch.service } : {}),
      ...(patch.note !== undefined ? { note: patch.note ?? null } : {}),
      ...(patch.channel !== undefined ? { channel: patch.channel } : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
    },
  });
  return mapAppointment(row);
}

export async function listOnlineConsults() {
  await ensureDbReady();
  const rows = await prisma.onlineConsult.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapOnlineConsult);
}

export async function createOnlineConsult(
  input: Omit<
    OnlineConsultRequest,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "status"
    | "scheduledDate"
    | "scheduledTime"
    | "smsNotifiedAt"
    | "callStartedAt"
  >
) {
  await ensureDbReady();
  const row = await prisma.onlineConsult.create({
    data: {
      name: input.name,
      phone: input.phone,
      age: input.age ?? null,
      gender: input.gender ?? null,
      heightCm: input.heightCm ?? null,
      weightKg: input.weightKg ?? null,
      armCm: input.armCm ?? null,
      waistCm: input.waistCm ?? null,
      hipCm: input.hipCm ?? null,
      thighCm: input.thighCm ?? null,
      calfCm: input.calfCm ?? null,
      note: input.note ?? null,
      preferredDate: input.preferredDate ?? null,
      status: "new",
    },
  });
  return mapOnlineConsult(row);
}

export async function updateOnlineConsult(
  id: string,
  patch: Partial<OnlineConsultRequest>
) {
  await ensureDbReady();
  const current = await prisma.onlineConsult.findUnique({ where: { id } });
  if (!current) return null;
  const row = await prisma.onlineConsult.update({
    where: { id },
    data: {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
      ...(patch.age !== undefined ? { age: patch.age ?? null } : {}),
      ...(patch.gender !== undefined ? { gender: patch.gender ?? null } : {}),
      ...(patch.heightCm !== undefined
        ? { heightCm: patch.heightCm ?? null }
        : {}),
      ...(patch.weightKg !== undefined
        ? { weightKg: patch.weightKg ?? null }
        : {}),
      ...(patch.armCm !== undefined ? { armCm: patch.armCm ?? null } : {}),
      ...(patch.waistCm !== undefined ? { waistCm: patch.waistCm ?? null } : {}),
      ...(patch.hipCm !== undefined ? { hipCm: patch.hipCm ?? null } : {}),
      ...(patch.thighCm !== undefined ? { thighCm: patch.thighCm ?? null } : {}),
      ...(patch.calfCm !== undefined ? { calfCm: patch.calfCm ?? null } : {}),
      ...(patch.note !== undefined ? { note: patch.note ?? null } : {}),
      ...(patch.preferredDate !== undefined
        ? { preferredDate: patch.preferredDate ?? null }
        : {}),
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.scheduledDate !== undefined
        ? { scheduledDate: patch.scheduledDate ?? null }
        : {}),
      ...(patch.scheduledTime !== undefined
        ? { scheduledTime: patch.scheduledTime ?? null }
        : {}),
      ...(patch.smsNotifiedAt !== undefined
        ? {
            smsNotifiedAt: patch.smsNotifiedAt
              ? new Date(patch.smsNotifiedAt)
              : null,
          }
        : {}),
      ...(patch.callStartedAt !== undefined
        ? {
            callStartedAt: patch.callStartedAt
              ? new Date(patch.callStartedAt)
              : null,
          }
        : {}),
    },
  });
  return mapOnlineConsult(row);
}

export async function listMeasurements(patientId?: string) {
  await ensureDbReady();
  const rows = await prisma.measurement.findMany({
    where: patientId ? { patientId } : undefined,
    orderBy: { recordedAt: "asc" },
  });
  return rows.map(mapMeasurement);
}

export async function createMeasurement(
  input: Omit<ProgressMeasurement, "id" | "createdAt">
) {
  await ensureDbReady();
  const row = await prisma.measurement.create({
    data: {
      patientId: input.patientId,
      recordedAt: asDate(input.recordedAt),
      weightKg: input.weightKg,
      waistCm: input.waistCm ?? null,
      hipCm: input.hipCm ?? null,
      armCm: input.armCm ?? null,
      thighCm: input.thighCm ?? null,
      calfCm: input.calfCm ?? null,
      note: input.note ?? null,
    },
  });
  return mapMeasurement(row);
}

export async function ensureDemoPatientProgress() {
  await ensureDbReady();
  let patient = await findPatientByPhone("09130000001");

  if (!patient) {
    patient = await createPatient({
      firstName: "سارا",
      lastName: "محمدی",
      age: 29,
      gender: "female",
      phone: "09130000001",
      address: "یزد",
      heightCm: 165,
      goalWeightKg: 65,
      source: "clinic",
      profileComplete: true,
      phoneVerifiedAt: new Date().toISOString(),
      welcomeSmsSentAt: new Date().toISOString(),
    });
  } else {
    const patch: Partial<Patient> = {};
    if (patient.goalWeightKg == null) patch.goalWeightKg = 65;
    if (patient.heightCm == null) patch.heightCm = 165;
    if (Object.keys(patch).length) {
      patient = (await updatePatient(patient.id, patch)) ?? patient;
    }
  }

  const existing = await listMeasurements(patient.id);
  if (existing.length === 0) {
    const samples = [
      { daysAgo: 56, weightKg: 78.4, waistCm: 92 },
      { daysAgo: 42, weightKg: 76.1, waistCm: 89 },
      { daysAgo: 28, weightKg: 74.0, waistCm: 86 },
      { daysAgo: 14, weightKg: 72.3, waistCm: 84 },
      { daysAgo: 0, weightKg: 71.2, waistCm: 82 },
    ];
    const now = Date.now();
    for (const sample of samples) {
      const recordedAt = new Date(
        now - sample.daysAgo * 24 * 60 * 60 * 1000
      ).toISOString();
      await createMeasurement({
        patientId: patient.id,
        recordedAt,
        weightKg: sample.weightKg,
        waistCm: sample.waistCm,
        hipCm: sample.waistCm + 12,
      });
    }
  }

  return {
    patient,
    measurements: await listMeasurements(patient.id),
  };
}

export async function listChampions(options?: { publishedOnly?: boolean }) {
  await ensureDbReady();
  const rows = await prisma.champion.findMany(
    options?.publishedOnly ? { where: { published: true } } : undefined
  );
  return sortChampions(rows.map(mapChampion));
}

export async function createChampion(
  input: Omit<Champion, "id" | "createdAt" | "updatedAt">
) {
  await ensureDbReady();
  const row = await prisma.champion.create({
    data: {
      name: input.name,
      quote: input.quote,
      startKg: input.startKg,
      endKg: input.endKg,
      startWaistCm: input.startWaistCm ?? null,
      endWaistCm: input.endWaistCm ?? null,
      beforeImage: input.beforeImage,
      afterImage: input.afterImage,
      published: input.published,
      sortOrder: input.sortOrder,
    },
  });
  return mapChampion(row);
}

export async function updateChampion(id: string, patch: Partial<Champion>) {
  await ensureDbReady();
  const current = await prisma.champion.findUnique({ where: { id } });
  if (!current) return null;
  const row = await prisma.champion.update({
    where: { id },
    data: {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.quote !== undefined ? { quote: patch.quote } : {}),
      ...(patch.startKg !== undefined ? { startKg: patch.startKg } : {}),
      ...(patch.endKg !== undefined ? { endKg: patch.endKg } : {}),
      ...(patch.startWaistCm !== undefined
        ? { startWaistCm: patch.startWaistCm ?? null }
        : {}),
      ...(patch.endWaistCm !== undefined
        ? { endWaistCm: patch.endWaistCm ?? null }
        : {}),
      ...(patch.beforeImage !== undefined
        ? { beforeImage: patch.beforeImage }
        : {}),
      ...(patch.afterImage !== undefined
        ? { afterImage: patch.afterImage }
        : {}),
      ...(patch.published !== undefined ? { published: patch.published } : {}),
      ...(patch.sortOrder !== undefined ? { sortOrder: patch.sortOrder } : {}),
    },
  });
  return mapChampion(row);
}

export async function deleteChampion(id: string) {
  await ensureDbReady();
  try {
    await prisma.champion.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function listPromoBanners(options?: { publishedOnly?: boolean }) {
  await ensureDbReady();
  const rows = await prisma.promoBanner.findMany(
    options?.publishedOnly ? { where: { published: true } } : undefined
  );
  return sortPromoBanners(rows.map(mapPromo));
}

export async function createPromoBanner(
  input: Omit<PromoBanner, "id" | "createdAt" | "updatedAt">
) {
  await ensureDbReady();
  const row = await prisma.promoBanner.create({
    data: {
      title: input.title,
      subtitle: input.subtitle ?? null,
      image: input.image,
      href: input.href ?? null,
      published: input.published,
      sortOrder: input.sortOrder,
    },
  });
  return mapPromo(row);
}

export async function updatePromoBanner(
  id: string,
  patch: Partial<PromoBanner>
) {
  await ensureDbReady();
  const current = await prisma.promoBanner.findUnique({ where: { id } });
  if (!current) return null;
  const row = await prisma.promoBanner.update({
    where: { id },
    data: {
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.subtitle !== undefined
        ? { subtitle: patch.subtitle ?? null }
        : {}),
      ...(patch.image !== undefined ? { image: patch.image } : {}),
      ...(patch.href !== undefined ? { href: patch.href ?? null } : {}),
      ...(patch.published !== undefined ? { published: patch.published } : {}),
      ...(patch.sortOrder !== undefined ? { sortOrder: patch.sortOrder } : {}),
    },
  });
  return mapPromo(row);
}

export async function deletePromoBanner(id: string) {
  await ensureDbReady();
  try {
    await prisma.promoBanner.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function listArticles(options?: { publishedOnly?: boolean }) {
  await ensureDbReady();
  const rows = await prisma.article.findMany(
    options?.publishedOnly ? { where: { published: true } } : undefined
  );
  return sortArticles(rows.map(mapArticle));
}

export async function getArticleBySlug(slug: string) {
  await ensureDbReady();
  const row = await prisma.article.findUnique({ where: { slug } });
  return row ? mapArticle(row) : null;
}

export async function createArticle(
  input: Omit<MagazineArticle, "id" | "createdAt" | "updatedAt" | "views"> & {
    views?: number;
  }
) {
  await ensureDbReady();
  let slug = input.slug;
  const taken = await prisma.article.findUnique({ where: { slug } });
  if (taken) slug = `${slug}-${crypto.randomUUID().slice(0, 6)}`;
  const row = await prisma.article.create({
    data: {
      slug,
      title: input.title,
      excerpt: input.excerpt,
      body: input.body,
      category: input.category,
      coverImage: input.coverImage,
      views: input.views ?? 0,
      published: input.published,
      sortOrder: input.sortOrder,
    },
  });
  return mapArticle(row);
}

export async function updateArticle(
  id: string,
  patch: Partial<MagazineArticle>
) {
  await ensureDbReady();
  const current = await prisma.article.findUnique({ where: { id } });
  if (!current) return null;
  let slug = patch.slug;
  if (slug) {
    const conflict = await prisma.article.findFirst({
      where: { slug, NOT: { id } },
    });
    if (conflict) slug = `${slug}-${id.slice(0, 6)}`;
  }
  const row = await prisma.article.update({
    where: { id },
    data: {
      ...(slug !== undefined ? { slug } : {}),
      ...(patch.title !== undefined ? { title: patch.title } : {}),
      ...(patch.excerpt !== undefined ? { excerpt: patch.excerpt } : {}),
      ...(patch.body !== undefined ? { body: patch.body } : {}),
      ...(patch.category !== undefined ? { category: patch.category } : {}),
      ...(patch.coverImage !== undefined
        ? { coverImage: patch.coverImage }
        : {}),
      ...(patch.views !== undefined ? { views: patch.views } : {}),
      ...(patch.published !== undefined ? { published: patch.published } : {}),
      ...(patch.sortOrder !== undefined ? { sortOrder: patch.sortOrder } : {}),
    },
  });
  return mapArticle(row);
}

export async function deleteArticle(id: string) {
  await ensureDbReady();
  try {
    await prisma.article.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function incrementArticleViews(slug: string) {
  await ensureDbReady();
  const current = await prisma.article.findUnique({ where: { slug } });
  if (!current) return null;
  const row = await prisma.article.update({
    where: { slug },
    data: { views: current.views + 1 },
  });
  return mapArticle(row);
}

function inboxMessageTargetsPatient(
  message: PatientInboxMessage,
  patientId: string
) {
  if (message.audience === "all") return true;
  return (message.patientIds ?? []).includes(patientId);
}

export async function listPatientInboxMessagesAdmin() {
  await ensureDbReady();
  const rows = await prisma.inboxMessage.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapInboxMessage);
}

export async function createPatientInboxMessage(input: {
  title: string;
  body: string;
  audience: PatientInboxMessage["audience"];
  patientIds?: string[];
  createdBy?: string;
}) {
  await ensureDbReady();
  const patientIds =
    input.audience === "selected"
      ? [...new Set((input.patientIds ?? []).filter(Boolean))]
      : undefined;
  if (input.audience === "selected" && (!patientIds || patientIds.length === 0)) {
    return null;
  }
  const title = input.title.trim();
  const body = input.body.trim();
  if (!title || !body) return null;
  const row = await prisma.inboxMessage.create({
    data: {
      title,
      body,
      audience: input.audience,
      patientIds: patientIds ? JSON.stringify(patientIds) : null,
      createdBy: input.createdBy ?? null,
    },
  });
  return mapInboxMessage(row);
}

export async function listInboxForPatient(patientId: string) {
  await ensureDbReady();
  const [messages, reads] = await Promise.all([
    prisma.inboxMessage.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.inboxRead.findMany({ where: { patientId } }),
  ]);
  const readSet = new Set(reads.map((r) => r.messageId));
  return messages
    .map(mapInboxMessage)
    .filter((m) => inboxMessageTargetsPatient(m, patientId))
    .map((m) => ({ ...m, read: readSet.has(m.id) }));
}

export async function countUnreadInboxForPatient(patientId: string) {
  const items = await listInboxForPatient(patientId);
  return items.filter((m) => !m.read).length;
}

export async function markInboxMessageRead(
  patientId: string,
  messageId: string
) {
  await ensureDbReady();
  const message = await prisma.inboxMessage.findUnique({
    where: { id: messageId },
  });
  if (!message) return false;
  const mapped = mapInboxMessage(message);
  if (!inboxMessageTargetsPatient(mapped, patientId)) return false;
  try {
    await prisma.inboxRead.create({
      data: { patientId, messageId },
    });
  } catch {
    // already read
  }
  return true;
}

export async function markAllInboxReadForPatient(patientId: string) {
  const items = await listInboxForPatient(patientId);
  const unread = items.filter((m) => !m.read);
  if (unread.length === 0) return 0;
  for (const m of unread) {
    try {
      await prisma.inboxRead.create({
        data: { patientId, messageId: m.id },
      });
    } catch {
      // ignore duplicates
    }
  }
  return unread.length;
}

export async function listSupportTickets(patientId?: string) {
  await ensureDbReady();
  const rows = await prisma.supportTicket.findMany({
    where: patientId ? { patientId } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapTicket);
}

export async function createSupportTicket(
  input: Omit<
    SupportTicket,
    "id" | "createdAt" | "updatedAt" | "status" | "clinicReply"
  >
) {
  await ensureDbReady();
  const row = await prisma.supportTicket.create({
    data: {
      patientId: input.patientId,
      patientName: input.patientName,
      phone: input.phone,
      category: input.category,
      subject: input.subject,
      body: input.body,
      status: "new",
    },
  });
  return mapTicket(row);
}

export async function updateSupportTicket(
  id: string,
  patch: Partial<
    Pick<SupportTicket, "status" | "clinicReply" | "subject" | "body">
  >
) {
  await ensureDbReady();
  const current = await prisma.supportTicket.findUnique({ where: { id } });
  if (!current) return null;
  const row = await prisma.supportTicket.update({
    where: { id },
    data: {
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.clinicReply !== undefined
        ? { clinicReply: patch.clinicReply ?? null }
        : {}),
      ...(patch.subject !== undefined ? { subject: patch.subject } : {}),
      ...(patch.body !== undefined ? { body: patch.body } : {}),
    },
  });
  return mapTicket(row);
}

export async function getDashboardStats() {
  await ensureDbReady();
  const [patients, visits, appointments, tickets, payments] = await Promise.all(
    [
      prisma.patient.count(),
      prisma.visit.findMany({ select: { status: true } }),
      prisma.appointment.findMany({
        where: { status: "new" },
        select: { id: true },
      }),
      prisma.supportTicket.findMany({
        where: { status: { in: ["new", "in_progress"] } },
        select: { id: true },
      }),
      prisma.payment.findMany({
        select: { status: true, amount: true, paidAmount: true },
      }),
    ]
  );

  const visitors = visits.filter((v) => v.status === "visitor").length;
  const admitted = visits.filter((v) => v.status === "admitted").length;
  const revenue = payments
    .filter((p) => p.status === "paid" || p.status === "partial")
    .reduce((sum, p) => sum + p.paidAmount, 0);
  const outstanding = payments
    .filter((p) => p.status === "pending" || p.status === "partial")
    .reduce((sum, p) => sum + (p.amount - p.paidAmount), 0);

  return {
    patients,
    visitors,
    admitted,
    pendingAppointments: appointments.length,
    openSupportTickets: tickets.length,
    revenue,
    outstanding,
  };
}

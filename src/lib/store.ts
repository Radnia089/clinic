import { promises as fs } from "fs";
import path from "path";
import {
  AppData,
  AppointmentRequest,
  Champion,
  DEFAULT_CLINIC,
  DEFAULT_REMINDER_SETTINGS,
  MagazineArticle,
  OnlineConsultRequest,
  Patient,
  Payment,
  PersonalLedgerEntry,
  ProgressMeasurement,
  PromoBanner,
  SmsLogEntry,
  Visit,
} from "@/lib/types";
import { defaultChampions, sortChampions } from "@/lib/champions";
import { defaultArticles, sortArticles } from "@/lib/magazine";
import {
  defaultPromoBanners,
  sortPromoBanners,
} from "@/lib/promo-banners";
import { mergeReminderSettings } from "@/lib/sms";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "clinic-app.json");

const emptyData = (): AppData => ({
  clinic: DEFAULT_CLINIC,
  patients: [],
  visits: [],
  payments: [],
  appointments: [],
  onlineConsults: [],
  measurements: [],
  smsLogs: [],
  personalLedger: [],
  champions: defaultChampions(),
  promoBanners: defaultPromoBanners(),
  articles: defaultArticles(),
});

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

async function ensureStore(): Promise<AppData> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as AppData;
    const defaultsById = Object.fromEntries(
      defaultChampions().map((item) => [item.id, item])
    );
    const champions =
      parsed.champions && parsed.champions.length > 0
        ? parsed.champions.map((item) => {
            const demo = defaultsById[item.id];
            return {
              ...item,
              startWaistCm:
                item.startWaistCm !== undefined
                  ? Number(item.startWaistCm)
                  : demo?.startWaistCm,
              endWaistCm:
                item.endWaistCm !== undefined
                  ? Number(item.endWaistCm)
                  : demo?.endWaistCm,
            };
          })
        : defaultChampions();
    const needsWaistPersist = champions.some(
      (item) =>
        item.startWaistCm !== undefined &&
        !(parsed.champions ?? []).some(
          (old) => old.id === item.id && old.startWaistCm !== undefined
        )
    );
    const data: AppData = {
      clinic: {
        ...DEFAULT_CLINIC,
        ...parsed.clinic,
        reminderSettings: mergeReminderSettings(
          parsed.clinic?.reminderSettings ?? DEFAULT_REMINDER_SETTINGS
        ),
      },
      patients: (parsed.patients ?? []).map(normalizePatientRecord),
      visits: parsed.visits ?? [],
      payments: parsed.payments ?? [],
      appointments: (parsed.appointments ?? []).map((item) => ({
        ...item,
        channel: item.channel ?? "clinic",
      })),
      onlineConsults: parsed.onlineConsults ?? [],
      measurements: parsed.measurements ?? [],
      smsLogs: parsed.smsLogs ?? [],
      personalLedger: parsed.personalLedger ?? [],
      champions,
      promoBanners:
        parsed.promoBanners && parsed.promoBanners.length > 0
          ? parsed.promoBanners
          : defaultPromoBanners(),
      articles:
        parsed.articles && parsed.articles.length > 0
          ? parsed.articles
          : defaultArticles(),
    };
    if (
      !parsed.champions ||
      parsed.champions.length === 0 ||
      needsWaistPersist ||
      !parsed.promoBanners ||
      parsed.promoBanners.length === 0 ||
      !parsed.articles ||
      parsed.articles.length === 0
    ) {
      await writeStore(data);
    }
    return data;
  } catch {
    const data = emptyData();
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
    return data;
  }
}

async function writeStore(data: AppData) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function getAppData() {
  return ensureStore();
}

export async function updateClinic(patch: Partial<AppData["clinic"]>) {
  const data = await ensureStore();
  data.clinic = {
    ...data.clinic,
    ...patch,
    reminderSettings: mergeReminderSettings({
      ...data.clinic.reminderSettings,
      ...(patch.reminderSettings ?? {}),
    }),
  };
  await writeStore(data);
  return data.clinic;
}

export async function listSmsLogs(limit = 100) {
  const logs = (await ensureStore()).smsLogs;
  return logs.slice(0, limit);
}

export async function hasSmsDedupe(dedupeKey: string) {
  return (await ensureStore()).smsLogs.some(
    (l) => l.dedupeKey === dedupeKey && l.status !== "failed"
  );
}

export async function createSmsLog(
  input: Omit<SmsLogEntry, "id" | "createdAt">
) {
  const data = await ensureStore();
  const entry: SmsLogEntry = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  data.smsLogs.unshift(entry);
  // نگه داشتن حداکثر ۵۰۰ پیام اخیر
  data.smsLogs = data.smsLogs.slice(0, 500);
  await writeStore(data);
  return entry;
}

export async function listPersonalLedger() {
  const items = (await ensureStore()).personalLedger;
  return [...items].sort((a, b) => {
    const byDate = b.entryDate.localeCompare(a.entryDate);
    if (byDate !== 0) return byDate;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function createPersonalLedgerEntry(
  input: Omit<PersonalLedgerEntry, "id" | "createdAt">
) {
  const data = await ensureStore();
  const entry: PersonalLedgerEntry = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  data.personalLedger.unshift(entry);
  await writeStore(data);
  return entry;
}

export async function deletePersonalLedgerEntry(id: string) {
  const data = await ensureStore();
  const next = data.personalLedger.filter((e) => e.id !== id);
  if (next.length === data.personalLedger.length) return false;
  data.personalLedger = next;
  await writeStore(data);
  return true;
}

export async function listPatients() {
  return (await ensureStore()).patients;
}

export async function getPatient(id: string) {
  return (await ensureStore()).patients.find((p) => p.id === id) ?? null;
}

export async function createPatient(
  input: Omit<Patient, "id" | "createdAt" | "updatedAt">
) {
  const data = await ensureStore();
  const now = new Date().toISOString();
  const patient: Patient = normalizePatientRecord({
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  });
  data.patients.unshift(patient);
  await writeStore(data);
  return patient;
}

/** مشتریان ثبت‌نام‌شده از اپ (برای صندوق مدیریت) */
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
  const data = await ensureStore();
  const index = data.patients.findIndex((p) => p.id === id);
  if (index < 0) return null;
  const next: Patient = {
    ...data.patients[index],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  // اجازه پاک کردن وضعیت بررسی وقتی مشتری از اپ ویرایش می‌کند
  if ("appReviewedAt" in patch && patch.appReviewedAt == null) {
    delete next.appReviewedAt;
  }
  if ("avatarUrl" in patch && !patch.avatarUrl) {
    delete next.avatarUrl;
  }
  if ("province" in patch && !patch.province) {
    delete next.province;
  }
  if ("city" in patch && !patch.city) {
    delete next.city;
  }
  if ("birthDate" in patch && !patch.birthDate) {
    delete next.birthDate;
  }
  data.patients[index] = next;
  await writeStore(data);
  return data.patients[index];
}

export async function findPatientByPhone(phone: string) {
  const normalized = phone.replace(/\s|-/g, "");
  return (
    (await ensureStore()).patients.find(
      (p) => p.phone.replace(/\s|-/g, "") === normalized
    ) ?? null
  );
}

export async function listVisits() {
  return (await ensureStore()).visits;
}

export async function getVisit(id: string) {
  return (await ensureStore()).visits.find((v) => v.id === id) ?? null;
}

export async function createVisit(
  input: Omit<Visit, "id" | "createdAt" | "updatedAt" | "admission"> & {
    admission?: Visit["admission"];
  }
) {
  const data = await ensureStore();
  const now = new Date().toISOString();
  const visit: Visit = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  data.visits.unshift(visit);
  await writeStore(data);
  return visit;
}

export async function updateVisit(id: string, patch: Partial<Visit>) {
  const data = await ensureStore();
  const index = data.visits.findIndex((v) => v.id === id);
  if (index < 0) return null;
  data.visits[index] = {
    ...data.visits[index],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  await writeStore(data);
  return data.visits[index];
}

export async function listPayments() {
  return (await ensureStore()).payments;
}

export async function createPayment(
  input: Omit<Payment, "id" | "createdAt">
) {
  const data = await ensureStore();
  const payment: Payment = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  data.payments.unshift(payment);
  await writeStore(data);
  return payment;
}

export async function updatePayment(id: string, patch: Partial<Payment>) {
  const data = await ensureStore();
  const index = data.payments.findIndex((p) => p.id === id);
  if (index < 0) return null;
  data.payments[index] = { ...data.payments[index], ...patch, id };
  await writeStore(data);
  return data.payments[index];
}

export async function listAppointments() {
  return (await ensureStore()).appointments;
}

export async function createAppointment(
  input: Omit<AppointmentRequest, "id" | "createdAt" | "status"> & {
    channel?: AppointmentRequest["channel"];
  }
) {
  const data = await ensureStore();
  const appointment: AppointmentRequest = {
    ...input,
    channel: input.channel ?? "clinic",
    id: crypto.randomUUID(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  data.appointments.unshift(appointment);
  await writeStore(data);
  return appointment;
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
  const data = await ensureStore();
  const index = data.appointments.findIndex((a) => a.id === id);
  if (index < 0) return null;
  data.appointments[index] = { ...data.appointments[index], ...patch, id };
  await writeStore(data);
  return data.appointments[index];
}

export async function listOnlineConsults() {
  const items = (await ensureStore()).onlineConsults;
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
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
  const data = await ensureStore();
  const now = new Date().toISOString();
  const item: OnlineConsultRequest = {
    ...input,
    id: crypto.randomUUID(),
    status: "new",
    createdAt: now,
    updatedAt: now,
  };
  data.onlineConsults.unshift(item);
  await writeStore(data);
  return item;
}

export async function updateOnlineConsult(
  id: string,
  patch: Partial<OnlineConsultRequest>
) {
  const data = await ensureStore();
  const index = data.onlineConsults.findIndex((item) => item.id === id);
  if (index < 0) return null;
  data.onlineConsults[index] = {
    ...data.onlineConsults[index],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  await writeStore(data);
  return data.onlineConsults[index];
}

export async function listMeasurements(patientId?: string) {
  const all = (await ensureStore()).measurements;
  const filtered = patientId ? all.filter((m) => m.patientId === patientId) : all;
  return [...filtered].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  );
}

export async function createMeasurement(
  input: Omit<ProgressMeasurement, "id" | "createdAt">
) {
  const data = await ensureStore();
  const measurement: ProgressMeasurement = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  data.measurements.push(measurement);
  await writeStore(data);
  return measurement;
}

/** مشتری نمونه سارا + چند نقطه اندازه‌گیری برای نمایش نمودار */
export async function ensureDemoPatientProgress() {
  const data = await ensureStore();
  let patient = data.patients.find((p) => p.phone === "09130000001");

  if (!patient) {
    const now = new Date().toISOString();
    patient = {
      id: crypto.randomUUID(),
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
      phoneVerifiedAt: now,
      welcomeSmsSentAt: now,
      createdAt: now,
      updatedAt: now,
    };
    data.patients.unshift(patient);
  } else {
    let touched = false;
    if (patient.goalWeightKg == null) {
      patient.goalWeightKg = 65;
      touched = true;
    }
    if (patient.heightCm == null) {
      patient.heightCm = 165;
      touched = true;
    }
    if (touched) {
      patient.updatedAt = new Date().toISOString();
      const idx = data.patients.findIndex((p) => p.id === patient!.id);
      if (idx >= 0) data.patients[idx] = patient;
    }
  }

  const existing = data.measurements.filter((m) => m.patientId === patient!.id);
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
      const recordedAt = new Date(now - sample.daysAgo * 24 * 60 * 60 * 1000).toISOString();
      data.measurements.push({
        id: crypto.randomUUID(),
        patientId: patient.id,
        recordedAt,
        weightKg: sample.weightKg,
        waistCm: sample.waistCm,
        hipCm: sample.waistCm + 12,
        createdAt: recordedAt,
      });
    }
  }

  await writeStore(data);
  return {
    patient,
    measurements: data.measurements
      .filter((m) => m.patientId === patient!.id)
      .sort(
        (a, b) =>
          new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
      ),
  };
}

export async function listChampions(options?: { publishedOnly?: boolean }) {
  const items = (await ensureStore()).champions ?? [];
  const filtered = options?.publishedOnly
    ? items.filter((item) => item.published)
    : items;
  return sortChampions(filtered);
}

export async function createChampion(
  input: Omit<Champion, "id" | "createdAt" | "updatedAt">
) {
  const data = await ensureStore();
  const now = new Date().toISOString();
  const item: Champion = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  data.champions = data.champions ?? [];
  data.champions.unshift(item);
  await writeStore(data);
  return item;
}

export async function updateChampion(id: string, patch: Partial<Champion>) {
  const data = await ensureStore();
  const index = (data.champions ?? []).findIndex((item) => item.id === id);
  if (index < 0) return null;
  data.champions[index] = {
    ...data.champions[index],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  await writeStore(data);
  return data.champions[index];
}

export async function deleteChampion(id: string) {
  const data = await ensureStore();
  const before = data.champions?.length ?? 0;
  data.champions = (data.champions ?? []).filter((item) => item.id !== id);
  if ((data.champions.length ?? 0) === before) return false;
  await writeStore(data);
  return true;
}

export async function listPromoBanners(options?: { publishedOnly?: boolean }) {
  const items = (await ensureStore()).promoBanners ?? [];
  const filtered = options?.publishedOnly
    ? items.filter((item) => item.published)
    : items;
  return sortPromoBanners(filtered);
}

export async function createPromoBanner(
  input: Omit<PromoBanner, "id" | "createdAt" | "updatedAt">
) {
  const data = await ensureStore();
  const now = new Date().toISOString();
  const item: PromoBanner = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  data.promoBanners = data.promoBanners ?? [];
  data.promoBanners.unshift(item);
  await writeStore(data);
  return item;
}

export async function updatePromoBanner(
  id: string,
  patch: Partial<PromoBanner>
) {
  const data = await ensureStore();
  const index = (data.promoBanners ?? []).findIndex((item) => item.id === id);
  if (index < 0) return null;
  data.promoBanners[index] = {
    ...data.promoBanners[index],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  await writeStore(data);
  return data.promoBanners[index];
}

export async function deletePromoBanner(id: string) {
  const data = await ensureStore();
  const before = data.promoBanners?.length ?? 0;
  data.promoBanners = (data.promoBanners ?? []).filter((item) => item.id !== id);
  if ((data.promoBanners.length ?? 0) === before) return false;
  await writeStore(data);
  return true;
}

export async function listArticles(options?: { publishedOnly?: boolean }) {
  const items = (await ensureStore()).articles ?? [];
  const filtered = options?.publishedOnly
    ? items.filter((item) => item.published)
    : items;
  return sortArticles(filtered);
}

export async function getArticleBySlug(slug: string) {
  const items = await listArticles({ publishedOnly: false });
  return items.find((item) => item.slug === slug) ?? null;
}

export async function createArticle(
  input: Omit<MagazineArticle, "id" | "createdAt" | "updatedAt" | "views"> & {
    views?: number;
  }
) {
  const data = await ensureStore();
  const now = new Date().toISOString();
  const item: MagazineArticle = {
    ...input,
    views: input.views ?? 0,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  data.articles = data.articles ?? [];
  const slugTaken = data.articles.some((a) => a.slug === item.slug);
  if (slugTaken) {
    item.slug = `${item.slug}-${item.id.slice(0, 6)}`;
  }
  data.articles.unshift(item);
  await writeStore(data);
  return item;
}

export async function updateArticle(id: string, patch: Partial<MagazineArticle>) {
  const data = await ensureStore();
  const index = (data.articles ?? []).findIndex((item) => item.id === id);
  if (index < 0) return null;
  if (patch.slug) {
    const conflict = data.articles.some(
      (a) => a.slug === patch.slug && a.id !== id
    );
    if (conflict) {
      patch.slug = `${patch.slug}-${id.slice(0, 6)}`;
    }
  }
  data.articles[index] = {
    ...data.articles[index],
    ...patch,
    id,
    updatedAt: new Date().toISOString(),
  };
  await writeStore(data);
  return data.articles[index];
}

export async function deleteArticle(id: string) {
  const data = await ensureStore();
  const before = data.articles?.length ?? 0;
  data.articles = (data.articles ?? []).filter((item) => item.id !== id);
  if ((data.articles.length ?? 0) === before) return false;
  await writeStore(data);
  return true;
}

export async function incrementArticleViews(slug: string) {
  const data = await ensureStore();
  const index = (data.articles ?? []).findIndex((item) => item.slug === slug);
  if (index < 0) return null;
  data.articles[index] = {
    ...data.articles[index],
    views: (data.articles[index].views ?? 0) + 1,
    updatedAt: new Date().toISOString(),
  };
  await writeStore(data);
  return data.articles[index];
}

export async function getDashboardStats() {
  const data = await ensureStore();
  const visitors = data.visits.filter((v) => v.status === "visitor").length;
  const admitted = data.visits.filter((v) => v.status === "admitted").length;
  const pendingAppointments = data.appointments.filter(
    (a) => a.status === "new"
  ).length;
  const revenue = data.payments
    .filter((p) => p.status === "paid" || p.status === "partial")
    .reduce((sum, p) => sum + p.paidAmount, 0);
  const outstanding = data.payments
    .filter((p) => p.status === "pending" || p.status === "partial")
    .reduce((sum, p) => sum + (p.amount - p.paidAmount), 0);

  return {
    patients: data.patients.length,
    visitors,
    admitted,
    pendingAppointments,
    revenue,
    outstanding,
  };
}

import { promises as fs } from "fs";
import path from "path";
import {
  AppData,
  AppointmentRequest,
  DEFAULT_CLINIC,
  Patient,
  Payment,
  Visit,
} from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "clinic-app.json");

const emptyData = (): AppData => ({
  clinic: DEFAULT_CLINIC,
  patients: [],
  visits: [],
  payments: [],
  appointments: [],
});

async function ensureStore(): Promise<AppData> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as AppData;
    return {
      clinic: { ...DEFAULT_CLINIC, ...parsed.clinic },
      patients: parsed.patients ?? [],
      visits: parsed.visits ?? [],
      payments: parsed.payments ?? [],
      appointments: parsed.appointments ?? [],
    };
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
  data.clinic = { ...data.clinic, ...patch };
  await writeStore(data);
  return data.clinic;
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
  const patient: Patient = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  data.patients.unshift(patient);
  await writeStore(data);
  return patient;
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
  input: Omit<AppointmentRequest, "id" | "createdAt" | "status">
) {
  const data = await ensureStore();
  const appointment: AppointmentRequest = {
    ...input,
    id: crypto.randomUUID(),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  data.appointments.unshift(appointment);
  await writeStore(data);
  return appointment;
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

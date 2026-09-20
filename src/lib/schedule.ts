import type { ClinicProfile, Visit, VisitType } from "@/lib/types";

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatTimeFa(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const hh = new Intl.NumberFormat("fa-IR", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  }).format(h);
  const mm = new Intl.NumberFormat("fa-IR", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  }).format(m);
  return `${hh}:${mm}`;
}

/** اسلات‌های پایه تقویم (مثلاً هر ۱۵ دقیقه) — تا قبل از workEnd */
export function buildGridSlots(
  workStart: string,
  workEnd: string,
  gridMinutes: number
): string[] {
  const start = timeToMinutes(workStart);
  const end = timeToMinutes(workEnd);
  if (end <= start || gridMinutes <= 0) return [];
  const slots: string[] = [];
  for (let t = start; t < end; t += gridMinutes) {
    slots.push(minutesToTime(t));
  }
  return slots;
}

export function slotDurationForType(
  clinic: Pick<ClinicProfile, "visitSlotMinutes" | "packageSlotMinutes">,
  visitType: VisitType
) {
  return visitType === "package" ? clinic.packageSlotMinutes : clinic.visitSlotMinutes;
}

export function durationForVisit(
  visit: Pick<Visit, "durationMinutes" | "visitType">,
  clinic: Pick<ClinicProfile, "visitSlotMinutes" | "packageSlotMinutes">
) {
  return visit.durationMinutes ?? slotDurationForType(clinic, visit.visitType);
}

export function endTimeFromStart(start: string, durationMinutes: number): string {
  return minutesToTime(timeToMinutes(start) + durationMinutes);
}

export function rangesOverlap(
  startA: string,
  durationA: number,
  startB: string,
  durationB: number
) {
  const a0 = timeToMinutes(startA);
  const a1 = a0 + durationA;
  const b0 = timeToMinutes(startB);
  const b1 = b0 + durationB;
  return a0 < b1 && b0 < a1;
}

/** شماره مراجعه این نوبت برای همان مشتری (۱، ۲، ۳، ...) */
export function visitNumberForPatient(
  allVisits: Array<Pick<Visit, "id" | "patientId" | "visitDate" | "visitTime" | "createdAt">>,
  patientId: string,
  visitId: string
) {
  const ordered = allVisits
    .filter((v) => v.patientId === patientId)
    .slice()
    .sort((a, b) => {
      const aKey = `${a.visitDate}T${a.visitTime ?? "00:00"}:${a.createdAt}`;
      const bKey = `${b.visitDate}T${b.visitTime ?? "00:00"}:${b.createdAt}`;
      return aKey.localeCompare(bKey);
    });
  const index = ordered.findIndex((v) => v.id === visitId);
  return index >= 0 ? index + 1 : ordered.length + 1;
}

export function toFaNumber(n: number) {
  return new Intl.NumberFormat("fa-IR").format(n);
}

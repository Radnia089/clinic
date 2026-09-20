import type { ClinicProfile, VisitType } from "@/lib/types";

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

export function buildSlots(
  workStart: string,
  workEnd: string,
  slotMinutes: number
): string[] {
  const start = timeToMinutes(workStart);
  const end = timeToMinutes(workEnd);
  if (end <= start || slotMinutes <= 0) return [];
  const slots: string[] = [];
  for (let t = start; t + slotMinutes <= end; t += slotMinutes) {
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

export function slotsForType(
  clinic: Pick<
    ClinicProfile,
    "workStart" | "workEnd" | "visitSlotMinutes" | "packageSlotMinutes"
  >,
  visitType: VisitType
) {
  return buildSlots(
    clinic.workStart,
    clinic.workEnd,
    slotDurationForType(clinic, visitType)
  );
}

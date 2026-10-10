import type { Patient } from "@/lib/types";

/** حذف فیلدهای حساس قبل از ارسال به کلاینت */
export function toPublicPatient(patient: Patient): Patient {
  const copy = { ...patient };
  delete copy.passwordHash;
  delete copy.passwordSetAt;
  return copy;
}

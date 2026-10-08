import type { Patient } from "@/lib/types";

/** آیا اطلاعات این مشتری قبلاً ثبت شده و نباید دوباره فرم تکمیل بگیرد؟ */
export function patientHasRegisteredInfo(patient: Patient | null | undefined) {
  if (!patient) return false;
  if (patient.profileComplete) return true;
  // پرونده حضوری کلینیک
  if (patient.source === "clinic" && patient.lastName?.trim()) return true;
  // قبلاً نام و نام‌خانوادگی ذخیره شده
  if (patient.firstName?.trim() && patient.lastName?.trim()) return true;
  return false;
}

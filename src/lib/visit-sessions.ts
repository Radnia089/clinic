/** عنوان جلسه‌های پرونده، به ترتیب مراجعه. */
export const VISIT_SESSION_TITLES = [
  "اول",
  "دوم",
  "سوم",
  "چهارم",
  "پنجم",
  "ششم",
  "هفتم",
  "هشتم",
  "نهم",
  "دهم",
  "یازدهم",
  "دوازدهم",
  "سیزدهم",
  "چهاردهم",
  "پانزدهم",
  "شانزدهم",
  "هفدهم",
  "هجدهم",
  "نوزدهم",
  "بیستم",
  "بیست و یکم",
  "بیست و دوم",
  "بیست و سوم",
  "بیست و چهارم",
  "بیست و پنجم",
  "بیست و ششم",
  "بیست و هفتم",
  "بیست و هشتم",
  "بیست و نهم",
  "سی‌ام",
] as const;

export function visitSessionNumber(label?: string | null): number | undefined {
  const text = label?.trim();
  if (!text) return undefined;
  const index = VISIT_SESSION_TITLES.indexOf(text as (typeof VISIT_SESSION_TITLES)[number]);
  return index === -1 ? undefined : index + 1;
}

/** شمارهٔ جلسه‌ای که باید پیش‌فرض باشد: بعد از آخرین جلسهٔ ثبت‌شده. */
export function nextVisitSession(labels: Array<string | null | undefined>): number {
  let highest = 0;
  for (const label of labels) {
    const number = visitSessionNumber(label);
    if (number && number > highest) highest = number;
  }
  return Math.max(highest, labels.length) + 1;
}

export function visitSessionChoices(next: number): string[] {
  if (next < 1) return [...VISIT_SESSION_TITLES];
  return VISIT_SESSION_TITLES.slice(next - 1);
}

export function visitSessionTitle(number: number): string {
  return VISIT_SESSION_TITLES[number - 1] ?? "";
}

export function isVisitSessionAllowed(
  label: string | null | undefined,
  existingLabels: Array<string | null | undefined>
): boolean {
  const number = visitSessionNumber(label);
  if (!number) return false;
  return number >= nextVisitSession(existingLabels) && number <= VISIT_SESSION_TITLES.length;
}

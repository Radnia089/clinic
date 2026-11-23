/** هر بلوک فهرست جلسه. با گذشتن از این تعداد، ده جلسهٔ بعد اضافه می‌شود. */
export const VISIT_SESSION_BLOCK = 10;
/** سقف جلسه‌هایی که عنوان فارسی دارند. */
export const VISIT_SESSION_LIMIT = 100;

const FIRST = ["", "اول", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم", "نهم"];
const TEENS = [
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
];
const TENS_CARDINAL = ["", "", "بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
const TENS_ORDINAL = ["", "", "بیستم", "سی‌ام", "چهلم", "پنجاهم", "شصتم", "هفتادم", "هشتادم", "نودم"];
const COMPOUND_ONES = ["", "یکم", "دوم", "سوم", "چهارم", "پنجم", "ششم", "هفتم", "هشتم", "نهم"];

export function visitSessionTitle(number: number): string {
  if (number === 100) return "صدم";
  if (number < 1 || number > VISIT_SESSION_LIMIT) return "";
  if (number < 10) return FIRST[number];
  if (number < 20) return TEENS[number - 10];
  const tens = Math.floor(number / 10);
  const ones = number % 10;
  if (ones === 0) return TENS_ORDINAL[tens];
  return `${TENS_CARDINAL[tens]} و ${COMPOUND_ONES[ones]}`;
}

export const VISIT_SESSION_TITLES = Array.from({ length: VISIT_SESSION_LIMIT }, (_, index) =>
  visitSessionTitle(index + 1)
);

export function visitSessionNumber(label?: string | null): number | undefined {
  const text = label?.trim();
  if (!text) return undefined;
  const index = VISIT_SESSION_TITLES.indexOf(text);
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

/** آخر فهرست باز: ده جلسه، و با هر ده مراجعهٔ بعدی ده تا دیگر. */
export function sessionListCeiling(next: number): number {
  const start = Math.max(1, next);
  const block = Math.ceil(start / VISIT_SESSION_BLOCK) * VISIT_SESSION_BLOCK;
  return Math.min(block, VISIT_SESSION_LIMIT);
}

export function visitSessionChoices(next: number): string[] {
  if (next < 1 || next > VISIT_SESSION_LIMIT) return [];
  const ceiling = sessionListCeiling(next);
  const titles: string[] = [];
  for (let number = next; number <= ceiling; number += 1) {
    titles.push(visitSessionTitle(number));
  }
  return titles;
}

export function isVisitSessionAllowed(
  label: string | null | undefined,
  existingLabels: Array<string | null | undefined>
): boolean {
  const number = visitSessionNumber(label);
  if (!number) return false;
  const next = nextVisitSession(existingLabels);
  return number >= next && number <= sessionListCeiling(next);
}

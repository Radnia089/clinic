import type { Champion } from "@/lib/types";

export type { Champion };

export function lostKg(champion: Pick<Champion, "startKg" | "endKg">) {
  return Math.max(0, champion.startKg - champion.endKg);
}

export function lostSizeCm(
  champion: Pick<Champion, "startWaistCm" | "endWaistCm">
) {
  if (
    champion.startWaistCm === undefined ||
    champion.endWaistCm === undefined ||
    !Number.isFinite(champion.startWaistCm) ||
    !Number.isFinite(champion.endWaistCm)
  ) {
    return undefined;
  }
  return Math.max(0, champion.startWaistCm - champion.endWaistCm);
}

export function sortChampions(items: Champion[]) {
  return [...items].sort((a, b) => {
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/** نمونه اولیه برای خالی نبودن گالری تا مدیر خودش جایگزین کند */
export function defaultChampions(): Champion[] {
  const now = new Date().toISOString();
  return [
    {
      id: "demo-sara",
      name: "سارا محمدی",
      quote: "هم وزن کم کردم، هم سایز کمرم جمع شد؛ انرژی‌ام برگشت.",
      startKg: 92,
      endKg: 71,
      startWaistCm: 98,
      endWaistCm: 78,
      beforeImage: "/images/champions/champion-1-before.jpg",
      afterImage: "/images/champions/champion-1-after.jpg",
      published: true,
      sortOrder: 1,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-mehdi",
      name: "مهدی رضایی",
      quote: "کاهش وزن و سایز با هم پیش رفت؛ مسیرم قطع نشد.",
      startKg: 114,
      endKg: 80,
      startWaistCm: 118,
      endWaistCm: 92,
      beforeImage: "/images/champions/champion-2-before.jpg",
      afterImage: "/images/champions/champion-2-after.jpg",
      published: true,
      sortOrder: 2,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "demo-neda",
      name: "ندا احمدی",
      quote: "رژیم و دستگاه‌ها هم وزن را آورد پایین، هم فرم بدنم را بهتر کرد.",
      startKg: 86,
      endKg: 67,
      startWaistCm: 94,
      endWaistCm: 76,
      beforeImage: "/images/champions/champion-3-before.jpg",
      afterImage: "/images/champions/champion-3-after.jpg",
      published: true,
      sortOrder: 3,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

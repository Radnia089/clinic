export interface Champion {
  id: string;
  name: string;
  quote: string;
  startKg: number;
  endKg: number;
  beforeImage: string;
  afterImage: string;
}

export const champions: Champion[] = [
  {
    id: "sara",
    name: "سارا محمدی",
    quote: "با رژیم شخصی تندیس هم وزن کم کردم، هم انرژی‌ام برگشت.",
    startKg: 92,
    endKg: 71,
    beforeImage: "/images/champions/champion-1-before.jpg",
    afterImage: "/images/champions/champion-1-after.jpg",
  },
  {
    id: "mehdi",
    name: "مهدی رضایی",
    quote: "جلسات پیگیری باعث شد مسیرم قطع نشود و نتیجه بماند.",
    startKg: 114,
    endKg: 80,
    beforeImage: "/images/champions/champion-2-before.jpg",
    afterImage: "/images/champions/champion-2-after.jpg",
  },
  {
    id: "neda",
    name: "ندا احمدی",
    quote: "علاوه بر رژیم، دستگاه‌های کمک لاغری فرم بدنم را بهتر کرد.",
    startKg: 86,
    endKg: 67,
    beforeImage: "/images/champions/champion-3-before.jpg",
    afterImage: "/images/champions/champion-3-after.jpg",
  },
];

export function lostKg(champion: Champion) {
  return Math.max(0, champion.startKg - champion.endKg);
}

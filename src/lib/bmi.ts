export type BmiGender = "female" | "male";

export type BmiCategoryId =
  | "underweight"
  | "normal"
  | "overweight"
  | "obese1"
  | "obese2"
  | "obese3";

export type FrameSize = "small" | "medium" | "large";

export interface BmiResult {
  bmi: number;
  categoryId: BmiCategoryId;
  categoryLabel: string;
  advice: string;
  idealMinKg: number;
  idealMaxKg: number;
  frameSize?: FrameSize;
  frameLabel?: string;
}

export function calculateBmi(weightKg: number, heightCm: number): number {
  const heightM = heightCm / 100;
  if (heightM <= 0 || weightKg <= 0) return NaN;
  return weightKg / (heightM * heightM);
}

export function categorizeBmi(bmi: number): Pick<
  BmiResult,
  "categoryId" | "categoryLabel" | "advice"
> {
  if (bmi < 18.5) {
    return {
      categoryId: "underweight",
      categoryLabel: "کمبود وزن",
      advice:
        "شاخص شما کمتر از محدوده طبیعی است. با برنامه غذایی مناسب می‌توانید به وزن سالم نزدیک شوید.",
    };
  }
  if (bmi < 25) {
    return {
      categoryId: "normal",
      categoryLabel: "وزن طبیعی",
      advice:
        "شاخص شما در محدوده سالم است. با رژیم متعادل و پیگیری منظم این وضعیت را حفظ کنید.",
    };
  }
  if (bmi < 30) {
    return {
      categoryId: "overweight",
      categoryLabel: "اضافه وزن",
      advice:
        "شاخص شما کمی بالاتر از محدوده طبیعی است. رژیم شخصی و پیگیری منظم کمک‌تان می‌کند.",
    };
  }
  if (bmi < 35) {
    return {
      categoryId: "obese1",
      categoryLabel: "چاقی درجه یک",
      advice:
        "برای کاهش وزن پایدار، مسیر رژیم و در صورت نیاز دستگاه‌های کمک لاغری پیشنهاد می‌شود.",
    };
  }
  if (bmi < 40) {
    return {
      categoryId: "obese2",
      categoryLabel: "چاقی درجه دو",
      advice:
        "همراهی مشاور و برنامه مرحله‌ای اهمیت بیشتری دارد؛ از مشاوره حضوری یا آنلاین شروع کنید.",
    };
  }
  return {
    categoryId: "obese3",
    categoryLabel: "چاقی درجه سه",
    advice:
      "پیشنهاد می‌کنیم با مشاور تندیس مسیر درمانی مناسب خود را تنظیم کنید.",
  };
}

export function idealWeightRange(heightCm: number): {
  idealMinKg: number;
  idealMaxKg: number;
} {
  const heightM = heightCm / 100;
  return {
    idealMinKg: 18.5 * heightM * heightM,
    idealMaxKg: 24.9 * heightM * heightM,
  };
}

export function frameSizeFromWrist(
  wristCm: number,
  gender: BmiGender
): { frameSize: FrameSize; frameLabel: string } | undefined {
  if (!Number.isFinite(wristCm) || wristCm <= 0) return undefined;

  if (gender === "male") {
    if (wristCm < 16.5) {
      return { frameSize: "small", frameLabel: "استخوان‌بندی ظریف" };
    }
    if (wristCm <= 19.5) {
      return { frameSize: "medium", frameLabel: "استخوان‌بندی متوسط" };
    }
    return { frameSize: "large", frameLabel: "استخوان‌بندی درشت" };
  }

  if (wristCm < 15) {
    return { frameSize: "small", frameLabel: "استخوان‌بندی ظریف" };
  }
  if (wristCm <= 17) {
    return { frameSize: "medium", frameLabel: "استخوان‌بندی متوسط" };
  }
  return { frameSize: "large", frameLabel: "استخوان‌بندی درشت" };
}

export function buildBmiResult(input: {
  weightKg: number;
  heightCm: number;
  wristCm?: number;
  gender: BmiGender;
}): BmiResult | null {
  const bmi = calculateBmi(input.weightKg, input.heightCm);
  if (!Number.isFinite(bmi)) return null;

  const category = categorizeBmi(bmi);
  const ideal = idealWeightRange(input.heightCm);
  const frame =
    input.wristCm !== undefined
      ? frameSizeFromWrist(input.wristCm, input.gender)
      : undefined;

  return {
    bmi: Math.round(bmi * 10) / 10,
    ...category,
    ...ideal,
    ...frame,
  };
}

export function categoryTone(categoryId: BmiCategoryId): string {
  switch (categoryId) {
    case "underweight":
      return "bg-[#E8F0F8] text-[#2F5F8A]";
    case "normal":
      return "bg-[#E8F2EA] text-[#14352A]";
    case "overweight":
      return "bg-[#FFF4D6] text-[#8A6A12]";
    case "obese1":
      return "bg-[#FBEFE8] text-[#B85A3A]";
    case "obese2":
      return "bg-[#F8E8E4] text-[#A04438]";
    case "obese3":
      return "bg-[#F3D9D4] text-[#8B2E24]";
  }
}

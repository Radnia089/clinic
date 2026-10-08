import Link from "next/link";
import { BmiCalculator } from "@/components/bmi/bmi-calculator";

export default function PatientBmiPage() {
  return (
    <div className="mx-auto min-h-[100svh] w-full max-w-[430px] bg-[#F7F8F6] px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-brand">محاسبه BMI</h1>
        <Link href="/patient" className="text-sm text-brand">
          بازگشت
        </Link>
      </div>
      <BmiCalculator variant="patient" />
    </div>
  );
}

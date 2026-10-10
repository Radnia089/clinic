import Link from "next/link";
import { ArrowRight, Gift } from "lucide-react";

export default function PatientClubPage() {
  return (
    <div className="min-h-[100svh] bg-[#F6F8F5]">
      <div className="mx-auto w-full max-w-[430px] px-4 pb-16 pt-6">
        <Link
          href="/patient"
          className="inline-flex items-center gap-1 text-sm font-medium text-[#14352A]/70"
        >
          <ArrowRight className="size-4" />
          بازگشت
        </Link>

        <div className="mt-10 flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-[#F6E6E1] text-[#D86B5C]">
            <Gift className="size-7" />
          </span>
          <h1 className="mt-5 text-2xl font-extrabold text-[#14352A]">
            باشگاه تندیس
          </h1>
          <p className="mt-3 max-w-xs text-sm leading-7 text-[#1A2E26]/65">
            امتیاز و جوایز باشگاه مشتریان به‌زودی اینجا فعال می‌شود.
          </p>
        </div>
      </div>
    </div>
  );
}

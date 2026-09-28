import Link from "next/link";
import { OnlineConsultForm } from "@/components/patient/online-consult-form";

export default function PatientOnlineConsultPage() {
  return (
    <div className="mx-auto min-h-[100svh] w-full max-w-[430px] bg-[#F7F8F6] px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-brand">مشاوره آنلاین</h1>
        <Link href="/patient" className="text-sm text-brand">
          بازگشت
        </Link>
      </div>
      <OnlineConsultForm />
    </div>
  );
}

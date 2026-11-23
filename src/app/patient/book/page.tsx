import type { Metadata } from "next";
import Link from "next/link";
import { PatientBookingForm } from "@/components/patient/booking-form";
import { BOOK_DESCRIPTION, BOOK_TITLE, shareMetadata } from "@/lib/site-seo";

export const metadata: Metadata = {
  title: { absolute: BOOK_TITLE },
  description: BOOK_DESCRIPTION,
  robots: { index: true, follow: true },
  ...shareMetadata(BOOK_TITLE, BOOK_DESCRIPTION, "/patient/book"),
};

export default function PatientBookPage() {
  return (
    <div className="mx-auto min-h-[100svh] w-full max-w-[430px] bg-[#F7F8F6] px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-brand">رزرو نوبت حضوری</h1>
        <Link href="/patient" className="text-sm text-brand">
          بازگشت
        </Link>
      </div>
      <PatientBookingForm />
    </div>
  );
}

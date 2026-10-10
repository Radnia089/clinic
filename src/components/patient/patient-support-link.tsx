import Link from "next/link";
import { Headphones } from "lucide-react";

/** دکمه پشتیبانی کنار زنگوله — دایره کوچک مثل اینستاگرام */
export function PatientSupportLink() {
  return (
    <Link
      href="/patient/support"
      aria-label="پشتیبانی تندیس"
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#14352A] text-white shadow-sm ring-2 ring-white transition active:scale-95"
    >
      <Headphones className="size-4" />
    </Link>
  );
}

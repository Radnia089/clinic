import Link from "next/link";
import { Gift } from "lucide-react";

/** دکمه باشگاه مشتریان کنار اینستاگرام — دایره کوچک */
export function PatientClubLink() {
  return (
    <Link
      href="/patient/club"
      aria-label="باشگاه مشتریان تندیس"
      className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#D86B5C] text-white shadow-sm ring-2 ring-white transition active:scale-95"
    >
      <Gift className="size-4" />
    </Link>
  );
}

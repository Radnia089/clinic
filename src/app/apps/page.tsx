import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** مسیر قدیمی درگاه؛ ورود از دکمه هدر لندینگ است */
export default function AppsPortalPage() {
  redirect("/");
}

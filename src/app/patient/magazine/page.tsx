import Link from "next/link";
import { MagazineList } from "@/components/magazine/magazine-list";
import { listArticles } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function PatientMagazinePage() {
  const items = await listArticles({ publishedOnly: true });

  return (
    <div className="mx-auto min-h-[100svh] w-full max-w-[430px] bg-[#F7F8F6] px-4 py-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-extrabold text-brand">مجله</h1>
        <Link href="/patient" className="text-sm text-brand">
          بازگشت
        </Link>
      </div>
      <MagazineList items={items} hrefBase="/magazine" />
    </div>
  );
}

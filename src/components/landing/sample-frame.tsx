import Image from "next/image";
import Link from "next/link";

export function SampleFrame({
  active,
  children,
}: {
  active: "calm" | "bright";
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="sticky top-0 z-50 border-b border-black/10 bg-[#111815] text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6">
          <p>نمونه طراحی است. صفحه اصلی سایت هنوز عوض نشده.</p>
          <nav className="flex flex-wrap gap-2">
            <Link
              href="/preview/calm"
              className={`rounded-full px-3 py-1 ${active === "calm" ? "bg-white text-[#111815]" : "bg-white/10"}`}
            >
              نمونه اول، آرام
            </Link>
            <Link
              href="/preview/bright"
              className={`rounded-full px-3 py-1 ${active === "bright" ? "bg-white text-[#111815]" : "bg-white/10"}`}
            >
              نمونه دوم، روشن
            </Link>
            <Link href="/" className="rounded-full bg-white/10 px-3 py-1">
              صفحه فعلی
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}

export function SampleLogo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <Image src="/tandis-logo.png" alt="تندیس" width={120} height={48} className={`h-9 w-auto ${light ? "brightness-0 invert" : ""}`} />
    </Link>
  );
}

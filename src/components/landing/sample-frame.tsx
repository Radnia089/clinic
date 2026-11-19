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
      <div className="sticky top-0 z-50 border-b border-black/5 bg-white/95 text-[#333] backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-2 text-xs sm:px-6">
          <p>نوار مقایسه. صفحهٔ اصلی سایت همان طرح نوتریشاست.</p>
          <nav className="flex flex-wrap gap-2">
            <Link
              href="/preview/calm"
              className={`rounded-full px-3 py-1 ${active === "calm" ? "bg-[#3caf2d] text-white" : "bg-[#F4F4F4]"}`}
            >
              نمونه نوتریشا
            </Link>
            <Link
              href="/preview/bright"
              className={`rounded-full px-3 py-1 ${active === "bright" ? "bg-[#14956C] text-white" : "bg-[#F4F4F4]"}`}
            >
              نمونه حال
            </Link>
            <Link href="/" className="rounded-full bg-[#F4F4F4] px-3 py-1">
              صفحه فعلی
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}

export function SampleLogo() {
  return (
    <Link href="/" className="inline-flex items-center">
      <Image src="/tandis-logo.png" alt="تندیس" width={132} height={52} className="h-11 w-auto" />
    </Link>
  );
}

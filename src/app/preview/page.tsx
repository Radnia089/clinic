import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PreviewIndexPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF] px-5 py-16 text-[#17241F]">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-[#17241F]/55">دو پیشنهاد برای صفحه اول</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-snug">لندینگ فعلی دست نخورده است.</h1>
        <p className="mt-4 text-base leading-8 text-[#17241F]/75">
          سایت‌های تغذیه که حس بهتری دارند معمولاً با یک جمله درباره خود مراجع شروع می‌شوند، عکس آدم واقعی دارند، و فقط یک کار واضح برای قدم بعد می‌گذارند. این دو نمونه همان محتوای تندیس است، با دو حال‌وهوای مختلف.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link href="/preview/calm" className="rounded-[1.6rem] bg-[#234237] p-6 text-[#F4EFE6]">
            <p className="text-sm text-[#E7C98A]">نمونه اول</p>
            <h2 className="mt-2 text-2xl font-extrabold">آرام</h2>
            <p className="mt-3 text-sm leading-7 text-[#F4EFE6]/75">شروع با چهره پزشک، فضای کرم و سبز تیره، مسیر ویزیت تا پیگیری.</p>
          </Link>
          <Link href="/preview/bright" className="rounded-[1.6rem] bg-white p-6">
            <p className="text-sm text-[#17241F]/50">نمونه دوم</p>
            <h2 className="mt-2 text-2xl font-extrabold text-[#1B3C30]">روشن</h2>
            <p className="mt-3 text-sm leading-7 text-[#17241F]/70">شروع با گرفتن نوبت. دو کارت بزرگ برای حضوری و آنلاین، و نوار پایین در گوشی.</p>
          </Link>
        </div>
        <Link href="/" className="mt-8 inline-block text-sm font-bold text-[#1E4A38]">برگشت به صفحه فعلی</Link>
      </div>
    </main>
  );
}

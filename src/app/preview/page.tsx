import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PreviewIndexPage() {
  return (
    <main className="min-h-screen bg-white px-5 py-16 text-[#161616]">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm text-[#14956C]">دو پیشنهاد تازه برای صفحه اول</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-snug">این بار با زبان همان سایت‌هایی که گفتید.</h1>
        <p className="mt-4 text-base leading-8 text-[#555]">
          نوتریشا سفید و سبز است، غذا وسط صفحه است و دکمه گرد دارد. حال تیتر درشت مشکی با هایلایت نعنایی و کارت شروع دارد. کرمانی ردیف رژیم‌ها و ماشین‌حساب وزن را جلو گذاشته. این دو نمونه همان کار را با محتوای تندیس می‌کنند. صفحه اصلی سایت هنوز عوض نشده.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link href="/preview/calm" className="rounded-[1.6rem] bg-[#F4FBF4] p-6 ring-1 ring-[#3caf2d]/20">
            <p className="text-sm font-bold text-[#2E9B32]">نمونه نوتریشا</p>
            <h2 className="mt-2 text-2xl font-extrabold">سبز و غذا</h2>
            <p className="mt-3 text-sm leading-7 text-[#555]">صفحه سفید، تیتر سبز، عکس غذا، دکمه گرد، ردیف رژیم و محاسبه وزن.</p>
          </Link>
          <Link href="/preview/bright" className="rounded-[1.6rem] bg-[#F3FAF7] p-6 ring-1 ring-[#14956C]/15">
            <p className="text-sm font-bold text-[#14956C]">نمونه حال</p>
            <h2 className="mt-2 text-2xl font-extrabold">نعنایی و شروع سریع</h2>
            <p className="mt-3 text-sm leading-7 text-[#555]">تیتر درشت، یک کلمه هایلایت، دو راه حضوری و آنلاین، و کارت‌های ساده.</p>
          </Link>
        </div>
        <Link href="/" className="mt-8 inline-block text-sm font-bold text-[#14956C]">برگشت به صفحه فعلی</Link>
      </div>
    </main>
  );
}

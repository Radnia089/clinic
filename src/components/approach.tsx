import Image from "next/image";

const points = [
  "ارزیابی اولیه دقیق قبل از شروع برنامه",
  "اهداف واقع‌بینانه با بازه‌های زمانی مشخص",
  "تنظیم مستمر برنامه بر اساس پاسخ بدن شما",
];

export function Approach() {
  return (
    <section id="approach" className="scroll-mt-8 bg-brand text-primary-foreground">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image
            src="/images/clinic-care.jpg"
            alt="فضای مراقبت و مشاوره در کلینیک"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">روش تندیس</h2>
          <p className="mt-4 text-base leading-8 text-white/85 sm:text-lg">
            ما لاغری را یک مسابقه سرعت نمی‌بینیم. تمرکز ما روی تغییر پایدار، سلامت متابولیک
            و همراهی نزدیک با شماست.
          </p>
          <ol className="mt-10 space-y-5">
            {points.map((point, index) => (
              <li key={point} className="flex gap-4">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-cta text-sm font-bold text-cta-foreground">
                  {["۱", "۲", "۳"][index]}
                </span>
                <span className="text-base leading-8 text-white/90">{point}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

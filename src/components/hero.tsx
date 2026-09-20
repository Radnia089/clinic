import Image from "next/image";

export function Hero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <Image
        src="/images/hero-wellness.jpg"
        alt="فضای فعال و سالم برای مسیر کاهش وزن"
        fill
        priority
        className="animate-ken object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-l from-brand/85 via-brand/70 to-brand/45" />
      <div className="absolute inset-0 bg-gradient-to-t from-brand/80 via-transparent to-brand/30" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-24">
        <p className="animate-rise text-sm font-medium text-white/80 sm:text-base">
          کلینیک لاغری
        </p>
        <h1 className="animate-rise-delay-1 mt-2 max-w-2xl text-5xl font-extrabold leading-[1.15] text-white sm:text-6xl md:text-7xl">
          تندیس یزد
        </h1>
        <span
          aria-hidden
          className="animate-underline-draw mt-4 h-1 w-24 origin-right rounded-full bg-cta"
        />
        <p className="animate-rise-delay-2 mt-6 max-w-xl text-base leading-8 text-white/90 sm:text-lg">
          مسیر کاهش وزن علمی، شخصی‌سازی‌شده و قابل پیگیری — در قلب یزد.
        </p>
        <div className="animate-rise-delay-3 mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#booking"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-cta px-6 text-base font-medium text-cta-foreground transition-colors hover:bg-cta/90"
          >
            رزرو نوبت رایگان
          </a>
          <a
            href="#services"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 text-base font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            مشاهده خدمات
          </a>
        </div>
      </div>
    </section>
  );
}

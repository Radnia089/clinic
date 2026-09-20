const services = [
  {
    title: "برنامه تخصصی کاهش وزن",
    description:
      "طراحی مسیر لاغری بر اساس وضعیت بدنی، سابقه پزشکی و سبک زندگی شما — نه رژیم‌های یکسان برای همه.",
  },
  {
    title: "تغذیه درمانی",
    description:
      "منوی غذایی قابل اجرا با مواد در دسترس یزد، همراه با آموزش عادت‌های ماندگار خوردن.",
  },
  {
    title: "پیگیری هفتگی",
    description:
      "جلسات منظم اندازه‌گیری، تنظیم برنامه و پشتیبانی تا نتیجه پایدار بماند.",
  },
  {
    title: "مشاوره سبک زندگی",
    description:
      "خواب، فعالیت روزانه و مدیریت استرس به‌عنوان بخش جدایی‌ناپذیر مسیر کاهش وزن.",
  },
];

export function Services() {
  return (
    <section id="services" className="yazd-grain relative scroll-mt-8 py-20 sm:py-28">
      <div className="yazd-pattern absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-3xl font-bold tracking-tight text-brand sm:text-4xl">
          خدمات کلینیک
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
          همه چیز برای یک مسیر شفاف و قابل اندازه‌گیری طراحی شده است.
        </p>

        <ul className="mt-14 divide-y divide-border/80 border-y border-border/80">
          {services.map((service, index) => (
            <li
              key={service.title}
              className="group grid gap-3 py-8 transition-colors sm:grid-cols-[4rem_1fr] sm:gap-8"
            >
              <span className="text-sm font-medium text-cta">
                {["۰۱", "۰۲", "۰۳", "۰۴"][index]}
              </span>
              <div>
                <h3 className="text-xl font-semibold text-foreground transition-transform duration-300 group-hover:-translate-x-1 sm:text-2xl">
                  {service.title}
                </h3>
                <p className="mt-2 max-w-2xl text-base leading-8 text-muted-foreground">
                  {service.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

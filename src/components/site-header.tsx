import Link from "next/link";

const links = [
  { href: "#services", label: "خدمات" },
  { href: "#approach", label: "روش ما" },
  { href: "#booking", label: "رزرو نوبت" },
  { href: "#contact", label: "تماس" },
];

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight text-white drop-shadow-sm sm:text-xl"
        >
          تندیس یزد
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-white/90 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="#booking"
          className="inline-flex h-10 items-center justify-center rounded-xl bg-cta px-4 text-sm font-medium text-cta-foreground transition-colors hover:bg-cta/90"
        >
          نوبت مشاوره
        </a>
      </div>
    </header>
  );
}

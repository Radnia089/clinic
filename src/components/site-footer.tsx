import { MapPin, Phone, Clock } from "lucide-react";

export function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-8 border-t border-border/70 bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="text-2xl font-bold text-brand">تندیس یزد</p>
          <p className="mt-3 max-w-md text-base leading-8 text-muted-foreground">
            کلینیک تخصصی لاغری و تغذیه در یزد — همراه شما برای رسیدن به وزن سالم و ماندگار.
          </p>
        </div>

        <div className="space-y-4 text-sm leading-7 text-foreground">
          <p className="flex items-start gap-3">
            <MapPin className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
            <span>یزد، بلوار جمهوری، نزدیک میدان امام — کلینیک لاغری تندیس</span>
          </p>
          <p className="flex items-start gap-3">
            <Phone className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
            <a href="tel:+983531234567" className="hover:text-primary" dir="ltr">
              ۰۳۵-۳۱۲۳۴۵۶۷
            </a>
          </p>
          <p className="flex items-start gap-3">
            <Clock className="mt-1 size-4 shrink-0 text-primary" aria-hidden />
            <span>شنبه تا پنج‌شنبه، ۹ تا ۱۹</span>
          </p>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} کلینیک لاغری تندیس یزد
      </div>
    </footer>
  );
}

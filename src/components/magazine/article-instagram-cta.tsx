import {
  TANDIS_INSTAGRAM_HANDLE,
  TANDIS_INSTAGRAM_URL,
} from "@/lib/social-links";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.017 7.052.072 5.775.127 4.602.425 3.635 1.392 2.668 2.359 2.37 3.532 2.315 4.809 2.26 6.089 2.243 6.498 2.243 12c0 5.502.017 5.911.072 7.191.055 1.277.353 2.45 1.32 3.417.967.967 2.14 1.265 3.417 1.32 1.28.055 1.689.072 7.191.072s5.911-.017 7.191-.072c1.277-.055 2.45-.353 3.417-1.32.967-.967 1.265-2.14 1.32-3.417.055-1.28.072-1.689.072-7.191 0-5.502-.017-5.911-.072-7.191-.055-1.277-.353-2.45-1.32-3.417-.967-.967-2.14-1.265-3.417-1.32C17.668.017 17.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

export function ArticleInstagramCta({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <a
      href={TANDIS_INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={
        compact
          ? "mt-2 flex items-center justify-between gap-3 rounded-[1.5rem] bg-gradient-to-l from-[#F58529]/15 via-[#DD2A7B]/10 to-[#8134AF]/15 px-4 py-3 ring-1 ring-[#DD2A7B]/15 transition hover:ring-[#DD2A7B]/30"
          : "mt-8 flex items-center justify-between gap-3 rounded-[1.5rem] bg-gradient-to-l from-[#F58529]/15 via-[#DD2A7B]/10 to-[#8134AF]/15 px-4 py-4 ring-1 ring-[#DD2A7B]/15 transition hover:ring-[#DD2A7B]/30"
      }
    >
      <div className="flex items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white">
          <InstagramIcon className="size-5" />
        </span>
        <div>
          <p className="text-sm font-extrabold text-[#14352A]">
            {compact
              ? "نکات روزانه در اینستاگرام تندیس"
              : "ادامه این موضوع را در اینستاگرام تندیس ببینید"}
          </p>
          <p className="mt-0.5 text-xs leading-6 text-[#1A2E26]/65">
            نمونه‌کار · رژیم · پشت‌صحنه کلینیک ·{" "}
            <span dir="ltr">@{TANDIS_INSTAGRAM_HANDLE}</span>
          </p>
        </div>
      </div>
      <span className="shrink-0 text-xs font-bold text-[#DD2A7B]">دنبال کردن</span>
    </a>
  );
}

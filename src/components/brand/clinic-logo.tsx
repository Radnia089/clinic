export function ClinicLogo({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand text-primary-foreground shadow-sm">
        <svg viewBox="0 0 40 40" className="size-7" aria-hidden>
          <path
            d="M20 6c-5.5 0-10 3.8-10 9.2 0 4.2 2.6 7.4 6.4 9.1L14 34h12l-2.4-9.7c3.8-1.7 6.4-4.9 6.4-9.1C30 9.8 25.5 6 20 6z"
            fill="currentColor"
            opacity="0.95"
          />
          <circle cx="20" cy="15" r="3.2" fill="oklch(0.62 0.14 55)" />
        </svg>
      </div>
      {!compact ? (
        <div className="leading-tight">
          <p className="text-base font-extrabold tracking-tight text-brand">تندیس</p>
          <p className="text-xs text-muted-foreground">کلینیک رژیم درمانی</p>
        </div>
      ) : null}
    </div>
  );
}

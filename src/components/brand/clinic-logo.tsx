import Image from "next/image";
import { cn } from "@/lib/utils";

export function ClinicLogo({
  className = "",
  compact = false,
  withTagline = false,
}: {
  className?: string;
  compact?: boolean;
  /** زیر زیرنویس کنار لوگو (خود لوگو کلمه «تندیس» را دارد) */
  withTagline?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src="/tandis-logo.png"
        alt="کلینیک رژیم درمانی تندیس"
        width={1187}
        height={497}
        priority
        className={cn(
          "w-auto object-contain",
          compact ? "h-9 sm:h-10" : "h-12 sm:h-14"
        )}
      />
      {withTagline ? (
        <div className="leading-tight">
          <p className="text-xs text-muted-foreground">کلینیک رژیم درمانی</p>
          <p className="text-[11px] text-muted-foreground">یزد</p>
        </div>
      ) : null}
    </div>
  );
}

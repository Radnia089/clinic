import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
  eyebrow,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-1 text-xs font-medium text-muted-foreground">{eyebrow}</p>
        ) : null}
        <h2 className="text-2xl font-extrabold tracking-tight text-brand sm:text-[1.75rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "success" | "warning" | "danger" | "info";
}) {
  return (
    <Badge
      className={cn(
        "rounded-full border-0 px-2.5 py-0.5 font-medium",
        tone === "default" && "bg-[#EEF1EE] text-foreground",
        tone === "success" && "bg-[#E7F3EA] text-[#2F6B4F]",
        tone === "warning" && "bg-[#F8E8E4] text-[#9A4E42]",
        tone === "danger" && "bg-rose-100 text-rose-800",
        tone === "info" && "bg-[#E8F2EA] text-brand"
      )}
    >
      {children}
    </Badge>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-[28px] bg-white px-6 py-14 text-center shadow-[0_6px_18px_rgba(35,70,55,0.06)]">
      <p className="font-semibold text-brand">{title}</p>
      {hint ? <p className="mt-2 text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function SoftCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] bg-white p-5 shadow-[0_6px_18px_rgba(35,70,55,0.06)] sm:p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

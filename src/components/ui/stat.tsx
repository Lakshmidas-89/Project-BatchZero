import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

export type StatTone = "ink" | "brand" | "fund" | "alert";

const iconToneStyles: Record<StatTone, string> = {
  ink: "border-line bg-canvas text-ink",
  brand: "border-brand/10 bg-brand-soft text-brand",
  fund: "border-fund/10 bg-fund-soft text-fund",
  alert: "border-alert/10 bg-alert-soft text-alert",
};

export function Stat({
  icon: Icon,
  label,
  value,
  meta,
  tone = "ink",
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  meta: string;
  tone?: StatTone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-line bg-card p-4",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl border",
          iconToneStyles[tone],
        )}
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
          {label}
        </p>
        <p className="mt-0.5 text-base font-bold tracking-tight text-ink sm:text-lg">
          {value}
        </p>
        <p className="mt-0.5 text-[11px] leading-4 text-muted sm:text-xs">
          {meta}
        </p>
      </div>
    </div>
  );
}

import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type BadgeVariant = "neutral" | "brand" | "fund" | "alert";

const badgeStyles: Record<BadgeVariant, string> = {
  neutral: "border-line bg-canvas text-muted",
  brand: "border-brand/15 bg-brand-soft text-brand",
  fund: "border-fund/15 bg-fund-soft text-fund",
  alert: "border-alert/15 bg-alert-soft text-alert",
};

export function Badge({
  children,
  variant = "neutral",
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
        badgeStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

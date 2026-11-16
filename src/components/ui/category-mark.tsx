import { Cookie, Droplets, Shirt } from "lucide-react";

import type { Campaign } from "@/lib/campaigns";
import { cn } from "@/lib/cn";

const categoryStyles = {
  Food: {
    icon: Cookie,
    className: "border-brand/10 bg-brand-soft text-brand",
  },
  Skincare: {
    icon: Droplets,
    className: "border-fund/10 bg-fund-soft text-fund",
  },
  Fashion: {
    icon: Shirt,
    className: "border-alert/10 bg-alert-soft text-alert",
  },
} satisfies Record<
  Campaign["category"],
  { icon: typeof Cookie; className: string }
>;

export function CategoryMark({
  category,
  size = "md",
  className,
}: {
  category: Campaign["category"];
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { icon: Icon, className: toneClassName } = categoryStyles[category];

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl border",
        toneClassName,
        size === "sm" && "size-9 rounded-xl",
        size === "md" && "size-12",
        size === "lg" && "size-20 rounded-3xl",
        className,
      )}
    >
      <Icon
        className={cn(
          size === "sm" && "size-4",
          size === "md" && "size-5",
          size === "lg" && "size-8",
        )}
        strokeWidth={1.8}
        aria-hidden="true"
      />
    </span>
  );
}

"use client";

import { Rocket, ShoppingBag, type LucideIcon } from "lucide-react";

import { useAppState, type Role } from "@/context/app-state";
import { cn } from "@/lib/cn";

type RoleOption = {
  value: Role;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
};

const ROLE_OPTIONS: RoleOption[] = [
  {
    value: "shopper",
    label: "Shopper View",
    shortLabel: "Shopper",
    icon: ShoppingBag,
  },
  {
    value: "founder",
    label: "Founder View",
    shortLabel: "Founder",
    icon: Rocket,
  },
];

export function RoleToggle() {
  const { role, setRole } = useAppState();

  return (
    <div
      role="group"
      aria-label="Choose a view"
      className="inline-flex shrink-0 rounded-xl border border-line bg-canvas p-1"
    >
      {ROLE_OPTIONS.map(({ value, label, shortLabel, icon: Icon }) => {
        const isActive = role === value;

        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={isActive}
            onClick={() => setRole(value)}
            className={cn(
              "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg px-2 text-[11px] font-semibold transition-colors sm:h-10 sm:px-3 sm:text-xs",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1",
              isActive
                ? "bg-ink text-white shadow-sm"
                : "text-muted hover:bg-white hover:text-ink",
            )}
          >
            <Icon
              className={cn(
                "hidden size-3.5 sm:block",
                isActive ? "text-white" : "text-muted",
              )}
              aria-hidden="true"
            />
            <span className="sm:hidden">{shortLabel}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}

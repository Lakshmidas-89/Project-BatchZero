"use client";

import { CATEGORIES, useAppState } from "@/context/app-state";
import { cn } from "@/lib/cn";

export function CategoryPills() {
  const { category, setCategory } = useAppState();

  return (
    <nav aria-label="Filter by category" className="min-w-0">
      <div
        role="group"
        className="flex items-center gap-1 overflow-x-auto rounded-full border border-line bg-white p-1 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {CATEGORIES.map((item) => {
          const isActive = category === item;

          return (
            <button
              key={item}
              type="button"
              aria-pressed={isActive}
              onClick={() => setCategory(item)}
              className={cn(
                "shrink-0 rounded-full px-3 py-2 text-[11px] font-semibold transition-colors sm:text-xs",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-1",
                isActive
                  ? "bg-brand text-white shadow-sm"
                  : "text-muted hover:bg-canvas hover:text-ink",
              )}
            >
              {item}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

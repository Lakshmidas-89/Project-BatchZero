"use client";

import { BarChart3 } from "lucide-react";

import { getPollPercentages, type PollOption } from "@/lib/campaign-details";
import { cn } from "@/lib/cn";

export function VariantPoll({
  question,
  options,
  selectedId,
  votedOptionId,
  onSelect,
  sizeOptions,
  selectedSize,
  onSelectSize,
}: {
  question: string;
  options: PollOption[];
  selectedId: string;
  votedOptionId: string | null;
  onSelect: (id: string) => void;
  sizeOptions?: string[];
  selectedSize?: string;
  onSelectSize?: (size: string) => void;
}) {
  const percentages = getPollPercentages(options);

  return (
    <section className="rounded-3xl border border-line bg-card p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="size-4 text-brand" aria-hidden="true" />
        <h3 className="text-sm font-bold tracking-tight text-ink">{question}</h3>
      </div>
      <p className="mt-1 text-[11px] text-muted">
        {votedOptionId
          ? "Your vote is in — this is what backers picked so far."
          : "Vote once. Your pick sets what we make first."}
      </p>

      <div className="mt-4 space-y-3">
        {options.map((option) => {
          const percentage = percentages[option.id] ?? 0;
          const isSelected = selectedId === option.id;

          return (
            <div key={option.id}>
              <button
                type="button"
                aria-pressed={isSelected}
                disabled={votedOptionId !== null}
                onClick={() => onSelect(option.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2",
                  isSelected
                    ? "border-brand bg-brand-soft text-brand"
                    : "border-line bg-white text-ink hover:border-brand/30",
                  votedOptionId !== null && !isSelected && "opacity-70",
                  votedOptionId !== null && "cursor-default",
                )}
              >
                <span>{option.label}</span>
                <span className="font-bold">{percentage}%</span>
              </button>
              <div
                aria-hidden="true"
                className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line"
              >
                <div
                  className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {sizeOptions ? (
        <div className="mt-5 border-t border-line pt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
            Your size
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizeOptions.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={selectedSize === size}
                onClick={() => onSelectSize?.(size)}
                className={cn(
                  "min-w-10 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2",
                  selectedSize === size
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-white text-muted hover:border-brand/30",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

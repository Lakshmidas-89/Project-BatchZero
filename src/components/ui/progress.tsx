import { cn } from "@/lib/cn";

export type ProgressTone = "brand" | "fund" | "alert";

const toneStyles: Record<ProgressTone, string> = {
  brand: "bg-brand",
  fund: "bg-fund",
  alert: "bg-alert",
};

export function Progress({
  value,
  tone = "fund",
  label,
  className,
}: {
  value: number;
  tone?: ProgressTone;
  label?: string;
  className?: string;
}) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clampedValue}
      className={cn(
        "h-1.5 w-full overflow-hidden rounded-full bg-line",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          toneStyles[tone],
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}

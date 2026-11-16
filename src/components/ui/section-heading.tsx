import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div>
        {eyebrow ? (
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

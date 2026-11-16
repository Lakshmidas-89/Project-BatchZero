import { CreditCard, RotateCcw, ShieldCheck, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const STEPS = [
  {
    step: "01",
    title: "Pledge with intent",
    description:
      "Backers commit to a batch. Funds are held in escrow, not sent to the founder.",
    icon: CreditCard,
    tone: "brand" as const,
  },
  {
    step: "02",
    title: "The goal is met",
    description:
      "Committed demand clears the production minimum and escrow releases to the maker.",
    icon: Target,
    tone: "fund" as const,
  },
  {
    step: "03",
    title: "Ship or refund",
    description:
      "If the goal is missed, the refund window opens and backers are made whole automatically.",
    icon: RotateCcw,
    tone: "alert" as const,
  },
];

const toneStyles = {
  brand: "border-brand/10 bg-brand-soft text-brand",
  fund: "border-fund/10 bg-fund-soft text-fund",
  alert: "border-alert/10 bg-alert-soft text-alert",
};

export function EscrowFlow() {
  return (
    <section
      id="escrow"
      className="scroll-mt-28 overflow-hidden rounded-3xl border border-line bg-card p-5 sm:p-8"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
            Escrow, in plain English
          </p>
          <h2 className="mt-1 max-w-xl text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Money moves only when the batch is real.
          </h2>
        </div>
        <Badge variant="fund" className="w-fit">
          <ShieldCheck className="size-3" aria-hidden="true" />
          Backer protected
        </Badge>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {STEPS.map(({ step, title, description, icon: Icon, tone }) => (
          <div
            key={step}
            className="relative rounded-2xl border border-line bg-canvas p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={cn(
                  "flex size-9 items-center justify-center rounded-xl border",
                  toneStyles[tone],
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="font-mono text-[11px] font-semibold text-muted">
                {step}
              </span>
            </div>
            <h3 className="mt-4 text-sm font-bold tracking-tight text-ink">
              {title}
            </h3>
            <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

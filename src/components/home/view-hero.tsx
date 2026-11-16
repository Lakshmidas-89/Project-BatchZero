import {
  ArrowRight,
  CalendarClock,
  Clock3,
  Flame,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Role } from "@/context/app-state";

const HERO_COPY = {
  shopper: {
    icon: ShoppingBag,
    eyebrow: "Shopper View",
    title: "Back the batch. Not the guesswork.",
    description:
      "Discover small-batch products with demand you can see. Your pledge stays in escrow until the production minimum is met.",
    primaryLabel: "Browse live batches",
    primaryHref: "#batches",
    secondaryLabel: "How escrow works",
    secondaryHref: "#escrow",
  },
  founder: {
    icon: Rocket,
    eyebrow: "Founder View",
    title: "Prove demand before you produce.",
    description:
      "Launch a pre-order batch, collect committed backers, and unlock production only when your minimum is met.",
    primaryLabel: "Start a batch",
    primaryHref: "#campaigns",
    secondaryLabel: "How escrow works",
    secondaryHref: "#escrow",
  },
} as const;

export function ViewHero({ role }: { role: Role }) {
  const copy = HERO_COPY[role];
  const EyebrowIcon = copy.icon;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-line bg-card">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,var(--brand-soft)_0%,transparent_58%)]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-20 -top-24 size-72 rounded-full bg-brand/5 blur-3xl"
      />

      <div className="relative grid gap-8 p-5 sm:p-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-12 lg:p-10">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={role === "shopper" ? "brand" : "fund"}>
              <EyebrowIcon className="size-3" aria-hidden="true" />
              {copy.eyebrow}
            </Badge>
            <span className="text-[11px] font-medium text-muted">
              Interface preview · no login required
            </span>
          </div>

          <h1 className="mt-5 max-w-xl text-3xl font-bold leading-[1.08] tracking-tight text-ink sm:text-4xl lg:text-[2.75rem]">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted sm:text-base">
            {copy.description}
          </p>

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <a
              href={copy.primaryHref}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
            >
              {copy.primaryLabel}
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <a
              href={copy.secondaryHref}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-white px-5 text-sm font-semibold text-ink transition-colors hover:border-brand/25 hover:bg-brand-soft hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
            >
              {copy.secondaryLabel}
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-muted">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck
                className="size-3.5 text-fund"
                aria-hidden="true"
              />
              Escrow-backed
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5 text-brand" aria-hidden="true" />
              Demand-first
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock
                className="size-3.5 text-alert"
                aria-hidden="true"
              />
              Deadline-aware
            </span>
          </div>
        </div>

        <FeaturedBatchCard />
      </div>
    </section>
  );
}

function FeaturedBatchCard() {
  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
      <div
        aria-hidden="true"
        className="absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-brand-soft via-white to-fund-soft opacity-70 blur-xl"
      />
      <div className="relative rounded-2xl border border-line bg-card p-5 shadow-[0_22px_55px_-26px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">
            <span className="size-1.5 animate-pulse rounded-full bg-fund" />
            Featured batch
          </span>
          <Badge variant="neutral">#021</Badge>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-alert/10 bg-alert-soft text-alert">
            <Flame className="size-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight text-ink">
              Citrus Chili Crisp
            </p>
            <p className="text-[11px] text-muted">Food · Ember Pantry</p>
          </div>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-bold tracking-tight text-ink">72%</p>
            <p className="text-[11px] text-muted">funded of $13,000</p>
          </div>
          <p className="text-right text-[11px] font-medium text-muted">
            $9,360
            <br />
            pledged
          </p>
        </div>
        <Progress
          value={72}
          label="Citrus Chili Crisp funding progress"
          className="mt-2.5"
        />

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-canvas p-3">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
              <Users className="size-3.5" aria-hidden="true" />
              Backers
            </p>
            <p className="mt-1 text-sm font-bold text-ink">318</p>
          </div>
          <div className="rounded-xl border border-alert/10 bg-alert-soft p-3 text-alert">
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em]">
              <Clock3 className="size-3.5" aria-hidden="true" />
              Deadline
            </p>
            <p className="mt-1 text-sm font-bold">5 days left</p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-xl border border-fund/15 bg-fund-soft px-3 py-2.5 text-fund">
          <ShieldCheck className="size-4 shrink-0" aria-hidden="true" />
          <p className="text-[11px] font-semibold">
            $9,360 held in escrow until production unlocks
          </p>
        </div>
      </div>
    </div>
  );
}

import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Plus,
  RotateCcw,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Badge, type BadgeVariant } from "@/components/ui/badge";
import { CategoryMark } from "@/components/ui/category-mark";
import { Progress } from "@/components/ui/progress";
import { SectionHeading } from "@/components/ui/section-heading";
import { useAppState } from "@/context/app-state";
import { CAMPAIGNS, filterCampaigns, type Campaign } from "@/lib/campaigns";
import { cn } from "@/lib/cn";

const statusVariants: Record<Campaign["status"], BadgeVariant> = {
  Funding: "brand",
  "Goal reached": "fund",
  "At risk": "alert",
};

const statusCopies: Record<Campaign["status"], string> = {
  Funding: "On track",
  "Goal reached": "Ready to produce",
  "At risk": "Needs attention",
};

export function FounderView() {
  const { category } = useAppState();
  const visibleCampaigns = filterCampaigns(CAMPAIGNS, category);

  return (
    <section id="campaigns" className="scroll-mt-28">
      <SectionHeading
        eyebrow="Founder View"
        title="Batch control room"
        description="Track escrow, backers, and deadlines across every live batch."
        action={
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-sm shadow-brand/15 transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
          >
            <Plus className="size-4" aria-hidden="true" />
            New batch
          </button>
        }
      />

      <div className="mt-5 space-y-3">
        {visibleCampaigns.map((campaign) => (
          <FounderCampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </div>
    </section>
  );
}

function FounderCampaignCard({ campaign }: { campaign: Campaign }) {
  const isGoalReached = campaign.status === "Goal reached";
  const isAtRisk = campaign.status === "At risk";

  return (
    <article className="rounded-2xl border border-line bg-card p-5 transition duration-200 hover:border-brand/20 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.3)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <CategoryMark category={campaign.category} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold tracking-tight text-ink">
                {campaign.name}
              </h3>
              <Badge variant={statusVariants[campaign.status]}>
                {campaign.status}
              </Badge>
            </div>
            <p className="mt-0.5 text-[11px] font-medium text-muted">
              Batch {campaign.batch} · {campaign.founder}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-semibold text-ink transition-colors hover:border-brand/25 hover:bg-brand-soft hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
        >
          Manage
          <ArrowUpRight className="size-3.5" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-canvas p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            In escrow
          </p>
          <p className="mt-1 text-sm font-bold text-fund">
            ${campaign.pledged.toLocaleString("en-US")}
          </p>
        </div>
        <div className="rounded-xl border border-line bg-canvas p-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            Backers
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-ink">
            <Users className="size-3.5 text-muted" aria-hidden="true" />
            {campaign.backers}
          </p>
        </div>
        <div className="rounded-xl border border-alert/10 bg-alert-soft p-3 text-alert">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em]">
            Deadline
          </p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold">
            <Clock3 className="size-3.5" aria-hidden="true" />
            {campaign.deadline}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-end justify-between gap-3">
          <p className="text-[11px] text-muted">
            <span className="text-sm font-bold text-ink">
              {campaign.fundedPercent}%
            </span>{" "}
            of ${campaign.goal.toLocaleString("en-US")} goal
          </p>
          <p
            className={cn(
              "text-[11px] font-semibold",
              isGoalReached && "text-fund",
              isAtRisk && "text-alert",
              campaign.status === "Funding" && "text-brand",
            )}
          >
            {statusCopies[campaign.status]}
          </p>
        </div>
        <Progress
          value={campaign.fundedPercent}
          tone={isAtRisk ? "alert" : "fund"}
          label={`${campaign.name} funding progress`}
          className="mt-2"
        />
      </div>

      <div className="mt-4 flex items-start gap-2 border-t border-line pt-3">
        {isGoalReached ? (
          <>
            <CheckCircle2
              className="mt-0.5 size-3.5 shrink-0 text-fund"
              aria-hidden="true"
            />
            <p className="text-[11px] font-medium text-muted">
              Goal met · funds are ready to release into production.
            </p>
          </>
        ) : isAtRisk ? (
          <>
            <RotateCcw
              className="mt-0.5 size-3.5 shrink-0 text-alert"
              aria-hidden="true"
            />
            <p className="text-[11px] font-medium text-muted">
              Refund window opens if the goal is missed. Backers are notified
              automatically.
            </p>
          </>
        ) : (
          <>
            <ShieldCheck
              className="mt-0.5 size-3.5 shrink-0 text-fund"
              aria-hidden="true"
            />
            <p className="text-[11px] font-medium text-muted">
              ${campaign.pledged.toLocaleString("en-US")} is held in escrow
              until the goal is met.
            </p>
          </>
        )}
      </div>
    </article>
  );
}

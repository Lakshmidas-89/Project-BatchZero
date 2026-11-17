import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Package,
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

const categoryGradients: Record<Campaign["category"], string> = {
  Food: "from-brand-soft via-white to-white",
  Skincare: "from-fund-soft via-white to-white",
  Fashion: "from-alert-soft via-white to-white",
};

const statusVariants: Record<Campaign["status"], BadgeVariant> = {
  Funding: "brand",
  "Goal reached": "fund",
  "At risk": "alert",
};

export function ShopperView() {
  const { category } = useAppState();
  const visibleCampaigns = filterCampaigns(CAMPAIGNS, category);

  return (
    <section id="batches" className="scroll-mt-28">
      <SectionHeading
        eyebrow="Shopper View"
        title={category === "All" ? "Live batches" : `${category} batches`}
        description="Every batch is backed by committed demand. Nothing charges until the goal is met."
        action={
          <span className="inline-flex items-center rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-semibold text-muted shadow-sm">
            Showing {visibleCampaigns.length} of {CAMPAIGNS.length}
          </span>
        }
      />

      {visibleCampaigns.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleCampaigns.map((campaign) => (
            <ShopperCampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      ) : (
        <div className="mt-5 flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white px-6 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-canvas text-muted">
            <Package className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-semibold text-ink">
            No batches in this category yet.
          </p>
          <p className="mt-1 text-xs text-muted">
            Try another category or check back soon.
          </p>
        </div>
      )}
    </section>
  );
}

function ShopperCampaignCard({ campaign }: { campaign: Campaign }) {
  const statusVariant = statusVariants[campaign.status];
  const isGoalReached = campaign.status === "Goal reached";

  return (
    <Link
      href={`/campaigns/${campaign.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-card transition duration-200 hover:-translate-y-0.5 hover:border-brand/20 hover:shadow-[0_18px_40px_-24px_rgba(15,23,42,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
    >
      <div
        className={cn(
          "relative h-32 shrink-0 overflow-hidden border-b border-line bg-gradient-to-br",
          categoryGradients[campaign.category],
        )}
      >
        <div
          aria-hidden="true"
          className="absolute -right-8 -top-12 size-36 rounded-full border-[14px] border-white/60"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-14 left-24 size-28 rounded-full border-[10px] border-white/50"
        />

        <div className="absolute inset-x-4 top-4 flex items-center justify-between gap-2">
          <Badge variant="neutral" className="bg-white/80 backdrop-blur">
            {campaign.category}
          </Badge>
          <Badge variant={statusVariant}>{campaign.status}</Badge>
        </div>

        <div className="absolute bottom-4 left-4">
          <CategoryMark category={campaign.category} size="lg" />
        </div>

        <div className="absolute bottom-4 right-4 text-right">
          <p className="text-2xl font-bold tracking-tight text-ink">
            ${campaign.price}
          </p>
          <p className="text-[10px] font-medium text-muted">
            <span className="line-through">${campaign.retailPrice}</span> retail
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold tracking-tight text-ink">
              {campaign.name}
            </h3>
            <p className="mt-0.5 text-[11px] font-medium text-muted">
              Batch {campaign.batch} · {campaign.founder}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs leading-5 text-muted">{campaign.summary}</p>

        <div className="mt-5">
          <div className="flex items-end justify-between gap-3">
            <p className="text-sm font-bold text-fund">
              {campaign.fundedPercent}% funded
            </p>
            <p className="text-[11px] text-muted">
              ${campaign.pledged.toLocaleString("en-US")} / $
              {campaign.goal.toLocaleString("en-US")}
            </p>
          </div>
          <Progress
            value={campaign.fundedPercent}
            tone={campaign.status === "At risk" ? "alert" : "fund"}
            label={`${campaign.name} funding progress`}
            className="mt-2"
          />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-muted">
            <Users className="size-3.5" aria-hidden="true" />
            {campaign.backers} backers
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-alert-soft px-2 py-1 text-[10px] font-semibold text-alert">
            <Clock3 className="size-3.5" aria-hidden="true" />
            {campaign.deadline}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-1.5 rounded-xl border border-fund/15 bg-fund-soft px-3 py-2 text-[11px] font-semibold text-fund">
          <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
          {isGoalReached
            ? "Goal reached · production unlocked"
            : "Escrow protected · refund if goal missed"}
        </div>

        <span className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white shadow-sm shadow-brand/15 transition-colors group-hover:bg-brand/90">
          Join the batch
          <ArrowRight className="size-4" aria-hidden="true" />
        </span>
        <span className="mt-2 inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-brand group-hover:underline">
          View batch details
          <ArrowRight className="size-3" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

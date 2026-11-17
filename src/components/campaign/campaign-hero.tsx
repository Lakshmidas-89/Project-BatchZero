import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CategoryMark } from "@/components/ui/category-mark";
import type { Campaign } from "@/lib/campaigns";
import type { CampaignDetail } from "@/lib/campaign-details";
import { cn } from "@/lib/cn";

const heroGradients: Record<Campaign["category"], string> = {
  Food: "from-brand-soft via-white to-white",
  Skincare: "from-fund-soft via-white to-white",
  Fashion: "from-alert-soft via-white to-white",
};

export function CampaignHero({
  campaign,
  detail,
}: {
  campaign: Campaign;
  detail: CampaignDetail;
}) {
  return (
    <section aria-labelledby="campaign-hero-title">
      <div
        className={cn(
          "relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-line bg-gradient-to-br",
          heroGradients[campaign.category],
        )}
      >
        <div
          aria-hidden="true"
          className="absolute -right-16 -top-24 size-72 rounded-full border-[24px] border-white/70 sm:size-96"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-28 left-16 size-64 rounded-full border-[18px] border-white/60 sm:left-32 sm:size-80"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-10 right-10 size-24 rounded-full bg-white/40 blur-xl"
        />

        <div className="absolute inset-x-4 top-4 flex flex-wrap items-center justify-between gap-2 sm:inset-x-6 sm:top-6">
          <Badge variant="neutral" className="bg-white/85 backdrop-blur">
            {campaign.category}
          </Badge>
          <Badge variant="brand" className="bg-white/85 backdrop-blur">
            Batch {campaign.batch}
          </Badge>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center">
          <CategoryMark category={campaign.category} size="lg" className="size-28 shadow-sm sm:size-36" />
          <div>
            <h1
              id="campaign-hero-title"
              className="text-2xl font-bold tracking-tight text-ink sm:text-4xl"
            >
              {campaign.name}
            </h1>
            <p className="mt-1 text-xs font-medium text-muted sm:text-sm">
              {campaign.founder}
            </p>
          </div>
        </div>

        <div className="absolute inset-x-4 bottom-4 flex flex-wrap items-end justify-between gap-3 sm:inset-x-6 sm:bottom-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/85 px-3 py-1.5 text-[11px] font-semibold text-muted backdrop-blur">
            <Sparkles className="size-3.5 text-brand" aria-hidden="true" />
            Co-created with backers
          </span>
          <span className="rounded-xl border border-brand/15 bg-white px-3 py-2 text-sm font-bold text-brand shadow-sm">
            ₹{detail.tokenPriceInr.toLocaleString("en-IN")} token
          </span>
        </div>
      </div>
    </section>
  );
}

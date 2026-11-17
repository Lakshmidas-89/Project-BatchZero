import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CampaignDetail } from "@/components/campaign/campaign-detail";
import { CAMPAIGNS } from "@/lib/campaigns";
import { getCampaignDetail } from "@/lib/campaign-details";

export function generateStaticParams() {
  return CAMPAIGNS.map((campaign) => ({ id: campaign.id }));
}

export async function generateMetadata(
  props: PageProps<"/campaigns/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const campaign = CAMPAIGNS.find((entry) => entry.id === id);

  return {
    title: campaign ? `${campaign.name} · BatchZero` : "Batch not found · BatchZero",
  };
}

export default async function CampaignPage(
  props: PageProps<"/campaigns/[id]">,
) {
  const { id } = await props.params;
  const campaign = CAMPAIGNS.find((entry) => entry.id === id);
  const detail = getCampaignDetail(id);

  if (!campaign || !detail) {
    notFound();
    return null;
  }

  return (
    <main id="main" className="flex-1">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <CampaignDetail campaign={campaign} detail={detail} />
      </div>
    </main>
  );
}

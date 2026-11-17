"use client";

import { useRef, useState } from "react";
import { ArrowRight, LockKeyhole } from "lucide-react";

import { BrandStory } from "./brand-story";
import { CampaignHero } from "./campaign-hero";
import { CoCreatorWall } from "./co-creator-wall";
import { FundingCard } from "./funding-card";
import { PrebookModal, type PaymentConfirmation } from "./prebook-modal";
import { VariantPoll } from "./variant-poll";
import type { Campaign } from "@/lib/campaigns";
import type {
  CampaignDetail as CampaignDetailData,
  CoCreatorComment,
} from "@/lib/campaign-details";

export function CampaignDetail({
  campaign,
  detail,
}: {
  campaign: Campaign;
  detail: CampaignDetailData;
}) {
  const [raisedInr, setRaisedInr] = useState(detail.raisedInr);
  const [backers, setBackers] = useState(detail.initialBackers);
  const [spots, setSpots] = useState(detail.earlyBirdSpots);
  const [votes, setVotes] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      detail.pollOptions.map((option) => [option.id, option.votes]),
    ),
  );
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState(
    detail.pollOptions[0]?.id ?? "",
  );
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    detail.sizeOptions?.[2],
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [comments, setComments] = useState<CoCreatorComment[]>(detail.comments);
  const [lastBackerName, setLastBackerName] = useState("Backer");
  const [lastVariantId, setLastVariantId] = useState(
    detail.pollOptions[0]?.id ?? "",
  );
  const commentSequence = useRef(0);

  const pollOptions = detail.pollOptions.map((option) => ({
    ...option,
    votes: votes[option.id] ?? option.votes,
  }));

  function handleSelect(id: string) {
    if (votedOptionId !== null) {
      return;
    }

    setVotes((previous) => ({
      ...previous,
      [id]: (previous[id] ?? 0) + 1,
    }));
    setVotedOptionId(id);
    setSelectedVariantId(id);
  }

  function handleConfirm(confirmation: PaymentConfirmation) {
    setRaisedInr((previous) => previous + detail.tokenPriceInr);
    setBackers((previous) => previous + 1);
    setSpots((previous) => Math.max(0, previous - 1));
    setHasPaid(true);
    setLastBackerName(confirmation.backerName);
    setLastVariantId(confirmation.variantId);
  }

  function handlePost(text: string) {
    const variantLabel =
      detail.pollOptions.find((option) => option.id === lastVariantId)?.label ??
      lastVariantId;

    setComments((previous) => [
      ...previous,
      {
        id: `local-${commentSequence.current++}`,
        name: lastBackerName,
        text,
        time: "just now",
        verified: true,
        variant: variantLabel,
      },
    ]);
  }

  return (
    <div
      data-testid="campaign-detail"
      data-id={campaign.id}
      className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]"
    >
      <div className="min-w-0 space-y-8">
        <CampaignHero campaign={campaign} detail={detail} />
        <BrandStory title={campaign.name} detail={detail} />
        <CoCreatorWall
          comments={comments}
          canPost={hasPaid}
          onPost={handlePost}
        />
      </div>

      <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-28 lg:self-start">
        <FundingCard
          raisedInr={raisedInr}
          targetInr={detail.targetInr}
          backers={backers}
          earlyBirdSpots={spots}
          label={`${campaign.name} escrow funding progress`}
        />

        <VariantPoll
          question={detail.pollQuestion}
          options={pollOptions}
          selectedId={selectedVariantId}
          votedOptionId={votedOptionId}
          onSelect={handleSelect}
          sizeOptions={detail.sizeOptions}
          selectedSize={selectedSize}
          onSelectSize={setSelectedSize}
        />

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 text-sm font-bold text-white shadow-sm shadow-brand/20 transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
        >
          {`Pre-Book Batch ${campaign.batch} • ₹${detail.tokenPriceInr.toLocaleString("en-IN")} Token`}
          <ArrowRight className="size-4" aria-hidden="true" />
        </button>
        <p className="inline-flex items-center justify-center gap-1.5 text-[11px] font-medium text-muted">
          <LockKeyhole className="size-3.5 text-fund" aria-hidden="true" />
          Token held in escrow · refunded if the goal is missed
        </p>
      </aside>

      {modalOpen ? (
        <PrebookModal
          open
          onClose={() => setModalOpen(false)}
          campaign={campaign}
          detail={detail}
          selectedVariantId={selectedVariantId}
          selectedSize={selectedSize}
          onConfirm={handleConfirm}
        />
      ) : null}
    </div>
  );
}

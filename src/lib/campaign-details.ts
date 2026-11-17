export type PollOption = {
  id: string;
  label: string;
  votes: number;
};

export type CampaignSpec = {
  label: string;
  value: string;
};

export type CoCreatorComment = {
  id: string;
  name: string;
  text: string;
  time: string;
  verified: boolean;
  variant?: string;
};

export type CampaignDetail = {
  tokenPriceInr: number;
  raisedInr: number;
  targetInr: number;
  initialBackers: number;
  earlyBirdSpots: number;
  story: string[];
  specs: CampaignSpec[];
  pollQuestion: string;
  pollOptions: PollOption[];
  sizeOptions?: string[];
  comments: CoCreatorComment[];
};

export const CAMPAIGN_DETAILS: Record<string, CampaignDetail> = {
  "miso-oat-bars": {
    tokenPriceInr: 1499,
    raisedInr: 638400,
    targetInr: 996000,
    initialBackers: 214,
    earlyBirdSpots: 12,
    story: [
      "Nori & Co. started with a frustrating breakfast: the bars that tasted good were mostly sugar, and the ones that were honest tasted like cardboard. Batch #004 is our third attempt at fixing that, built around upcycled rice bran from a neighbouring mill.",
      "Every batch is small, dated, and traceable. Backers decide the flavour before we commit to a production run, so nothing sits on a shelf waiting for a buyer.",
    ],
    specs: [
      { label: "Key ingredient", value: "Upcycled rice bran" },
      { label: "Protein", value: "9g per bar" },
      { label: "Shelf life", value: "6 months, no preservatives" },
      { label: "Allergens", value: "Contains sesame and oats" },
    ],
    pollQuestion: "Which flavour should we lock for Batch #004?",
    pollOptions: [
      { id: "miso-sesame", label: "Miso Sesame", votes: 50 },
      { id: "brown-butter", label: "Brown Butter", votes: 30 },
      { id: "chili-lime", label: "Chili Lime", votes: 20 },
    ],
    comments: [
      {
        id: "miso-c1",
        name: "Ananya R.",
        text: "The miso-sesame prototype was the first bar I actually finished. Locking it in!",
        time: "2 days ago",
        verified: true,
        variant: "Miso Sesame",
      },
      {
        id: "miso-c2",
        name: "Kabir M.",
        text: "Love that the rice bran is coming from a mill two towns over. Keep it local.",
        time: "4 days ago",
        verified: true,
        variant: "Brown Butter",
      },
      {
        id: "miso-c3",
        name: "Sneha P.",
        text: "Chili lime has my vote. A little heat at 8am is exactly what I need.",
        time: "1 week ago",
        verified: true,
        variant: "Chili Lime",
      },
    ],
  },
  "barrier-repair-cream": {
    tokenPriceInr: 2799,
    raisedInr: 1394400,
    targetInr: 1245000,
    initialBackers: 412,
    earlyBirdSpots: 8,
    story: [
      "Soft Focus Lab was founded by two dermatology nurses who were tired of recommending moisturisers that stung. This batch pairs a 5% ceramide complex with nothing else that has a smell, a sting, or a long ingredient list.",
      "The goal is already cleared, which means production is unlocked. Backers are now choosing the finish we make first — your pick sets next month's run.",
    ],
    specs: [
      { label: "Active", value: "5% ceramide complex" },
      { label: "Skin type", value: "Sensitive and reactive" },
      { label: "Size", value: "50ml amber glass" },
      { label: "Fragrance", value: "None added" },
    ],
    pollQuestion: "Which finish should we launch first?",
    pollOptions: [
      { id: "fragrance-free", label: "Fragrance-Free", votes: 40 },
      { id: "light-botanical", label: "Light Botanical", votes: 35 },
      { id: "citrus-fresh", label: "Citrus Fresh", votes: 25 },
    ],
    comments: [
      {
        id: "cream-c1",
        name: "Meera S.",
        text: "Finally a barrier cream that doesn't make my skin sting. Fragrance-free all the way.",
        time: "1 day ago",
        verified: true,
        variant: "Fragrance-Free",
      },
      {
        id: "cream-c2",
        name: "Rohan K.",
        text: "The ceramide concentration is what sold me. The glass jar is a nice bonus.",
        time: "3 days ago",
        verified: true,
        variant: "Light Botanical",
      },
      {
        id: "cream-c3",
        name: "Ishita D.",
        text: "I've used two sample jars already. Please make the citrus one next!",
        time: "6 days ago",
        verified: true,
        variant: "Citrus Fresh",
      },
    ],
  },
  "linen-utility-set": {
    tokenPriceInr: 7499,
    raisedInr: 321700,
    targetInr: 747000,
    initialBackers: 91,
    earlyBirdSpots: 5,
    story: [
      "Fieldwork Studio cuts relaxed, unisex clothing from a single European flax mill we visited last spring. The two-piece utility set is our first attempt at a year-round linen uniform that looks better the more you wear it.",
      "We only dye after the batch clears. Backers pick the colourway and their size now, so we can buy the right amount of fabric and dye lots instead of guessing.",
    ],
    specs: [
      { label: "Fabric", value: "100% European flax" },
      { label: "Weight", value: "165 gsm" },
      { label: "Fit", value: "Relaxed, unisex" },
      { label: "Care", value: "Machine wash cold, line dry" },
    ],
    pollQuestion: "Which colourway should we dye first?",
    pollOptions: [
      { id: "natural-flax", label: "Natural Flax", votes: 45 },
      { id: "washed-olive", label: "Washed Olive", votes: 35 },
      { id: "charcoal", label: "Charcoal", votes: 20 },
    ],
    sizeOptions: ["XS", "S", "M", "L", "XL", "XXL"],
    comments: [
      {
        id: "linen-c1",
        name: "Tara V.",
        text: "Washed olive, please. It'll go with everything I already own.",
        time: "2 days ago",
        verified: true,
        variant: "Washed Olive",
      },
      {
        id: "linen-c2",
        name: "Dev A.",
        text: "Grabbed an XL. The 165 gsm weight is exactly what I've been looking for.",
        time: "5 days ago",
        verified: true,
        variant: "Natural Flax",
      },
      {
        id: "linen-c3",
        name: "Nisha B.",
        text: "Natural flax for me — I want to see the fibre before the dye goes on.",
        time: "1 week ago",
        verified: true,
        variant: "Natural Flax",
      },
    ],
  },
};

export function getCampaignDetail(id: string): CampaignDetail | undefined {
  return CAMPAIGN_DETAILS[id];
}

export function getPollPercentages(
  options: PollOption[],
): Record<string, number> {
  const total = options.reduce((sum, option) => sum + option.votes, 0);

  if (total === 0) {
    return {};
  }

  return Object.fromEntries(
    options.map((option) => [
      option.id,
      Math.round((option.votes / total) * 100),
    ]),
  );
}

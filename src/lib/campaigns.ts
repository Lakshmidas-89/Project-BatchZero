import type { Category } from "@/context/app-state";

export type CampaignStatus = "Funding" | "Goal reached" | "At risk";

export type Campaign = {
  id: string;
  batch: string;
  name: string;
  category: Exclude<Category, "All">;
  summary: string;
  founder: string;
  price: number;
  retailPrice: number;
  fundedPercent: number;
  backers: number;
  pledged: number;
  goal: number;
  deadline: string;
  status: CampaignStatus;
};

export const CAMPAIGNS: Campaign[] = [
  {
    id: "miso-oat-bars",
    batch: "#004",
    name: "Miso Morning Oat Bars",
    category: "Food",
    summary: "Savory-sweet breakfast bars made with upcycled rice bran.",
    founder: "Nori & Co.",
    price: 18,
    retailPrice: 24,
    fundedPercent: 64,
    backers: 214,
    pledged: 7680,
    goal: 12000,
    deadline: "6 days left",
    status: "Funding",
  },
  {
    id: "barrier-repair-cream",
    batch: "#012",
    name: "Barrier Repair Cream",
    category: "Skincare",
    summary: "Ceramide-rich moisturizer for stressed, reactive skin.",
    founder: "Soft Focus Lab",
    price: 34,
    retailPrice: 42,
    fundedPercent: 112,
    backers: 412,
    pledged: 16800,
    goal: 15000,
    deadline: "9 days left",
    status: "Goal reached",
  },
  {
    id: "linen-utility-set",
    batch: "#007",
    name: "Linen Utility Set",
    category: "Fashion",
    summary: "Relaxed two-piece linen set cut for everyday wear.",
    founder: "Fieldwork Studio",
    price: 89,
    retailPrice: 118,
    fundedPercent: 43,
    backers: 91,
    pledged: 3874,
    goal: 9000,
    deadline: "2 days left",
    status: "At risk",
  },
];

export function filterCampaigns(
  campaigns: Campaign[],
  category: Category,
): Campaign[] {
  if (category === "All") {
    return campaigns;
  }

  return campaigns.filter((campaign) => campaign.category === category);
}

import { describe, expect, it } from "vitest";

import { CAMPAIGNS, filterCampaigns } from "@/lib/campaigns";

describe("filterCampaigns", () => {
  it("returns only campaigns in the selected category", () => {
    const result = filterCampaigns(CAMPAIGNS, "Food");

    expect(result).toHaveLength(1);
    expect(result.every((campaign) => campaign.category === "Food")).toBe(true);
  });

  it("returns every campaign when the filter is All", () => {
    expect(filterCampaigns(CAMPAIGNS, "All")).toHaveLength(CAMPAIGNS.length);
  });
});

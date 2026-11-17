import { describe, expect, it } from "vitest";

import { CAMPAIGNS } from "@/lib/campaigns";
import {
  CAMPAIGN_DETAILS,
  getCampaignDetail,
  getPollPercentages,
} from "@/lib/campaign-details";

describe("campaign details", () => {
  it("has a detail entry for every campaign on the home page", () => {
    for (const campaign of CAMPAIGNS) {
      expect(CAMPAIGN_DETAILS[campaign.id]).toBeDefined();
    }
  });

  it("looks up a known detail and returns undefined for an unknown id", () => {
    expect(getCampaignDetail("miso-oat-bars")?.tokenPriceInr).toBe(1499);
    expect(getCampaignDetail("nope")).toBeUndefined();
  });

  it("turns poll votes into rounded percentages", () => {
    expect(
      getPollPercentages([
        { id: "a", label: "A", votes: 50 },
        { id: "b", label: "B", votes: 30 },
        { id: "c", label: "C", votes: 20 },
      ]),
    ).toEqual({ a: 50, b: 30, c: 20 });
  });

  it("returns no percentages for an empty poll instead of dividing by zero", () => {
    expect(getPollPercentages([])).toEqual({});
  });

  it("offers apparel sizes only for the fashion campaign", () => {
    expect(getCampaignDetail("linen-utility-set")?.sizeOptions).toEqual([
      "XS",
      "S",
      "M",
      "L",
      "XL",
      "XXL",
    ]);
    expect(getCampaignDetail("miso-oat-bars")?.sizeOptions).toBeUndefined();
    expect(
      getCampaignDetail("barrier-repair-cream")?.sizeOptions,
    ).toBeUndefined();
  });

  it("marks every seeded co-creator comment as a verified backer", () => {
    for (const detail of Object.values(CAMPAIGN_DETAILS)) {
      expect(detail.comments).toHaveLength(3);
      for (const comment of detail.comments) {
        expect(comment.verified).toBe(true);
      }
    }
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BrandStory } from "./brand-story";
import { CampaignHero } from "./campaign-hero";
import { CoCreatorWall } from "./co-creator-wall";
import { CAMPAIGNS } from "@/lib/campaigns";
import { getCampaignDetail } from "@/lib/campaign-details";

const foodCampaign = CAMPAIGNS[0];
const foodDetail = getCampaignDetail("miso-oat-bars")!;

describe("campaign hero", () => {
  it("shows the batch identity and Indian-grouped token price", () => {
    render(<CampaignHero campaign={foodCampaign} detail={foodDetail} />);

    expect(screen.getByText(foodCampaign.name)).toBeInTheDocument();
    expect(screen.getByText("Batch #004")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("₹1,499 token")).toBeInTheDocument();
  });
});

describe("brand story", () => {
  it("renders every story paragraph and spec", () => {
    render(<BrandStory title="Miso Morning Oat Bars" detail={foodDetail} />);

    expect(
      screen.getByRole("heading", { name: "Miso Morning Oat Bars" }),
    ).toBeInTheDocument();
    for (const paragraph of foodDetail.story) {
      expect(screen.getByText(paragraph)).toBeInTheDocument();
    }
    for (const spec of foodDetail.specs) {
      expect(screen.getByText(spec.label)).toBeInTheDocument();
      expect(screen.getByText(spec.value)).toBeInTheDocument();
    }
  });
});

describe("co-creator wall", () => {
  it("labels all seeded paying backers as verified", () => {
    render(
      <CoCreatorWall
        comments={foodDetail.comments}
        canPost={false}
        onPost={vi.fn()}
      />,
    );

    expect(screen.getAllByText("Verified Backer")).toHaveLength(3);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("posts a trimmed note only when posting is unlocked", async () => {
    const user = userEvent.setup();
    const onPost = vi.fn();
    const { rerender } = render(
      <CoCreatorWall
        comments={foodDetail.comments}
        canPost={false}
        onPost={onPost}
      />,
    );

    rerender(
      <CoCreatorWall
        comments={foodDetail.comments}
        canPost
        onPost={onPost}
      />,
    );

    const textarea = screen.getByRole("textbox", { name: "Add your note" });
    await user.type(textarea, "  Worth the wait!  ");
    await user.click(screen.getByRole("button", { name: "Post to wall" }));

    expect(onPost).toHaveBeenCalledExactlyOnceWith("Worth the wait!");
    expect(textarea).toHaveValue("");
  });

  it("ignores an empty note", async () => {
    const user = userEvent.setup();
    const onPost = vi.fn();
    render(
      <CoCreatorWall comments={foodDetail.comments} canPost onPost={onPost} />,
    );

    await user.click(screen.getByRole("button", { name: "Post to wall" }));

    expect(onPost).not.toHaveBeenCalled();
  });
});

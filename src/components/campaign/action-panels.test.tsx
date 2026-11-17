import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FundingCard } from "./funding-card";
import { VariantPoll } from "./variant-poll";
import type { PollOption } from "@/lib/campaign-details";

const options: PollOption[] = [
  { id: "a", label: "Miso Sesame", votes: 50 },
  { id: "b", label: "Brown Butter", votes: 30 },
  { id: "c", label: "Chili Lime", votes: 20 },
];

describe("action panels", () => {
  beforeEach(() => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it("shows escrow funding figures, progress and urgency", () => {
    render(
      <FundingCard
        raisedInr={638400}
        targetInr={996000}
        backers={214}
        earlyBirdSpots={12}
        label="Miso Morning Oat Bars funding progress"
      />,
    );

    expect(screen.getByText("₹6,38,400")).toBeInTheDocument();
    expect(screen.getByText("₹9,96,000")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "64",
    );
    expect(screen.getByText("214 backers")).toBeInTheDocument();
    expect(screen.getByText("Early-Bird Spots Left")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText(/100% Escrow Protected/)).toBeInTheDocument();
  });

  it("renders poll percentages and counts only one vote", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const { rerender } = render(
      <VariantPoll
        question="Which flavour?"
        options={options}
        selectedId="a"
        votedOptionId={null}
        onSelect={onSelect}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Which flavour?" }),
    ).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("30%")).toBeInTheDocument();
    expect(screen.getByText("20%")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Brown Butter/ }));
    expect(onSelect).toHaveBeenCalledExactlyOnceWith("b");

    rerender(
      <VariantPoll
        question="Which flavour?"
        options={[
          options[0],
          { ...options[1], votes: 31 },
          options[2],
        ]}
        selectedId="b"
        votedOptionId="b"
        onSelect={onSelect}
      />,
    );

    expect(screen.getByText("31%")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Brown Butter/ }),
    ).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /Chili Lime/ }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("offers apparel sizes only when the campaign is fashion", async () => {
    const user = userEvent.setup();
    const onSelectSize = vi.fn();
    const { rerender } = render(
      <VariantPoll
        question="Which colourway?"
        options={options}
        selectedId="a"
        votedOptionId={null}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: "XL" })).not.toBeInTheDocument();

    rerender(
      <VariantPoll
        question="Which colourway?"
        options={options}
        selectedId="a"
        votedOptionId={null}
        onSelect={vi.fn()}
        sizeOptions={["XS", "S", "M", "L", "XL", "XXL"]}
        selectedSize="M"
        onSelectSize={onSelectSize}
      />,
    );

    for (const size of ["XS", "S", "M", "L", "XL", "XXL"]) {
      expect(
        screen.getByRole("button", { name: size }),
      ).toBeInTheDocument();
    }

    await user.click(screen.getByRole("button", { name: "XL" }));
    expect(onSelectSize).toHaveBeenCalledExactlyOnceWith("XL");
  });
});

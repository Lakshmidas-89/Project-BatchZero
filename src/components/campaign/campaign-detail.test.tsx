import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CampaignDetail } from "./campaign-detail";
import { CAMPAIGNS } from "@/lib/campaigns";
import { getCampaignDetail } from "@/lib/campaign-details";

const foodCampaign = CAMPAIGNS[0];
const foodDetail = getCampaignDetail("miso-oat-bars")!;
const fashionCampaign = CAMPAIGNS[2];
const fashionDetail = getCampaignDetail("linen-utility-set")!;

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

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

function payWithCard() {
  fireEvent.change(screen.getByLabelText("Backer Name"), {
    target: { value: "Asha T." },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "asha@example.com" },
  });
  fireEvent.click(screen.getByRole("tab", { name: "Card" }));
  fireEvent.change(screen.getByLabelText("Card Number"), {
    target: { value: "4242424242424242" },
  });
  fireEvent.change(screen.getByLabelText("Expiry"), {
    target: { value: "12/29" },
  });
  fireEvent.change(screen.getByLabelText("CVV"), {
    target: { value: "123" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: "Pay Token (Simulated Test Mode)" }),
  );
  act(() => {
    vi.advanceTimersByTime(1500);
  });
}

describe("campaign detail page", () => {
  it("renders the proof layout and the pre-book CTA", () => {
    render(<CampaignDetail campaign={foodCampaign} detail={foodDetail} />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      foodCampaign.name,
    );
    expect(screen.getByText("₹6,38,400")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: foodDetail.pollQuestion }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Verified Co-Creator Wall" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Pre-Book Batch #004 • ₹1,499 Token",
      }),
    ).toBeInTheDocument();
  });

  it("moves escrow funds, spots and backers, then unlocks the wall", () => {
    vi.useFakeTimers();
    render(<CampaignDetail campaign={foodCampaign} detail={foodDetail} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Pre-Book Batch #004 • ₹1,499 Token",
      }),
    );
    payWithCard();

    expect(screen.getByText("₹6,39,899")).toBeInTheDocument();
    expect(screen.getByText("215 backers")).toBeInTheDocument();
    expect(screen.getByText("Early-Bird Spots Left")).toBeInTheDocument();
    expect(screen.getByText("11")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    const noteField = screen.getByRole("textbox", { name: "Add your note" });
    fireEvent.change(noteField, { target: { value: "Worth the wait!" } });
    fireEvent.click(screen.getByRole("button", { name: "Post to wall" }));

    const note = screen.getByText("Worth the wait!");
    const card = note.closest("li")!;
    expect(within(card).getByText("Asha T.")).toBeInTheDocument();
    expect(within(card).getByText("Verified Backer")).toBeInTheDocument();
  });

  it("carries the chosen apparel size into the receipt", () => {
    vi.useFakeTimers();
    render(<CampaignDetail campaign={fashionCampaign} detail={fashionDetail} />);

    for (const size of ["XS", "S", "M", "L", "XL", "XXL"]) {
      expect(screen.getByRole("button", { name: size })).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole("button", { name: "XL" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "Pre-Book Batch #007 • ₹7,499 Token",
      }),
    );
    payWithCard();

    expect(screen.getByText(/Size XL/)).toBeInTheDocument();
  });

  it("renders a campaign whose detail has no poll options", () => {
    render(
      <CampaignDetail
        campaign={foodCampaign}
        detail={{ ...foodDetail, pollOptions: [] }}
      />,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      foodCampaign.name,
    );
    expect(
      screen.getByRole("button", { name: /Pre-Book Batch/ }),
    ).toBeInTheDocument();
  });

  it("announces new verified wall notes", () => {
    render(<CampaignDetail campaign={foodCampaign} detail={foodDetail} />);

    expect(
      screen.getByRole("list", { name: "Verified backer notes" }),
    ).toHaveAttribute("aria-live", "polite");
  });

  it("gives rapid wall posts distinct keys", () => {
    vi.useFakeTimers();
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<CampaignDetail campaign={foodCampaign} detail={foodDetail} />);

    fireEvent.click(screen.getByRole("button", { name: /Pre-Book Batch/ }));
    payWithCard();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    const noteField = screen.getByRole("textbox", { name: "Add your note" });
    fireEvent.change(noteField, { target: { value: "First note" } });
    fireEvent.click(screen.getByRole("button", { name: "Post to wall" }));
    fireEvent.change(noteField, { target: { value: "Second note" } });
    fireEvent.click(screen.getByRole("button", { name: "Post to wall" }));

    expect(screen.getByText("First note")).toBeInTheDocument();
    expect(screen.getByText("Second note")).toBeInTheDocument();
    expect(errors.mock.calls.flat().join(" ")).not.toContain("same key");
  });

  it("accepts repeat payments and floors early-bird spots at zero", () => {
    vi.useFakeTimers();
    render(
      <CampaignDetail
        campaign={foodCampaign}
        detail={{ ...foodDetail, earlyBirdSpots: 1 }}
      />,
    );

    const cta = screen.getByRole("button", { name: /Pre-Book Batch/ });
    fireEvent.click(cta);
    payWithCard();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    fireEvent.click(cta);
    payWithCard();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    const spots = screen.getByText("Early-Bird Spots Left").parentElement!;
    expect(spots).toHaveTextContent("0");
    expect(screen.getByText("216 backers")).toBeInTheDocument();
    expect(screen.getByText("₹6,41,398")).toBeInTheDocument();
  });
});

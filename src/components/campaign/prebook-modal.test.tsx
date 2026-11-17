import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { PrebookModal } from "./prebook-modal";
import { CAMPAIGNS } from "@/lib/campaigns";
import { getCampaignDetail } from "@/lib/campaign-details";
import {
  createReceipt,
  downloadReceipt,
  formatReceiptText,
  type EscrowReceipt,
} from "@/lib/receipt";

const foodCampaign = CAMPAIGNS[0];
const fashionCampaign = CAMPAIGNS[2];
const foodDetail = getCampaignDetail("miso-oat-bars")!;
const fashionDetail = getCampaignDetail("linen-utility-set")!;

const baseReceipt: EscrowReceipt = {
  id: "BZ-TEST1234",
  campaignName: "Miso Morning Oat Bars",
  batch: "#004",
  backerName: "Asha T.",
  email: "asha@example.com",
  variantLabel: "Miso Sesame",
  amountInr: 1499,
  paymentMethod: "UPI",
  issuedAt: "2026-11-17T10:00:00.000Z",
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("escrow receipt", () => {
  it("generates a receipt id and ISO timestamp", () => {
    const receipt = createReceipt({
      ...baseReceipt,
      id: undefined,
      issuedAt: undefined,
    });

    expect(receipt.id).toMatch(/^BZ-[A-Z0-9]{8}$/);
    expect(new Date(receipt.issuedAt).toISOString()).toBe(receipt.issuedAt);
  });

  it("renders the locked funds confirmation in plain text", () => {
    const text = formatReceiptText(baseReceipt);

    expect(text).toContain("ESCROW RECEIPT");
    expect(text).toContain("Asha T.");
    expect(text).toContain("₹1,499");
    expect(text).toContain("safely locked");
  });

  it("downloads the receipt as a text file", () => {
    let downloadedName = "";
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:receipt");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      function mockClick(this: HTMLAnchorElement) {
        downloadedName = this.download;
      },
    );

    downloadReceipt(baseReceipt);

    expect(downloadedName).toBe("BZ-TEST1234.txt");
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
  });
});

describe("pre-book modal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <PrebookModal
        open={false}
        onClose={vi.fn()}
        campaign={foodCampaign}
        detail={foodDetail}
        selectedVariantId="miso-sesame"
        onConfirm={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders backer, variant and payment fields without a size for food", () => {
    render(
      <PrebookModal
        open
        onClose={vi.fn()}
        campaign={foodCampaign}
        detail={foodDetail}
        selectedVariantId="miso-sesame"
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Backer Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Selected Variant")).toHaveValue(
      "miso-sesame",
    );
    expect(screen.getByRole("tab", { name: "UPI" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Card" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Size")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Pay Token (Simulated Test Mode)" }),
    ).toBeInTheDocument();
  });

  it("carries the selected size for fashion", () => {
    render(
      <PrebookModal
        open
        onClose={vi.fn()}
        campaign={fashionCampaign}
        detail={fashionDetail}
        selectedVariantId="washed-olive"
        selectedSize="XL"
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Size")).toHaveValue("XL");
  });

  it("confirms payment only after 1.5 seconds and shows a receipt", async () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    render(
      <PrebookModal
        open
        onClose={onClose}
        campaign={foodCampaign}
        detail={foodDetail}
        selectedVariantId="miso-sesame"
        onConfirm={onConfirm}
      />,
    );

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
      vi.advanceTimersByTime(1499);
    });
    expect(onConfirm).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onConfirm).toHaveBeenCalledExactlyOnceWith({
      backerName: "Asha T.",
      email: "asha@example.com",
      variantId: "miso-sesame",
      paymentMethod: "Card",
    });

    expect(screen.getByText("ESCROW RECEIPT")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download Receipt" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});

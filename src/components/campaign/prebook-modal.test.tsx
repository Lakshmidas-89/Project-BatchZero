import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
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

  it("downloads the receipt before revoking its object URL", () => {
    vi.useFakeTimers();
    let downloadedName = "";
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:receipt");
    const revoke = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      function mockClick(this: HTMLAnchorElement) {
        downloadedName = this.download;
      },
    );

    downloadReceipt(baseReceipt);

    expect(downloadedName).toBe("BZ-TEST1234.txt");
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(revoke).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(0);
    });
    expect(revoke).toHaveBeenCalledExactlyOnceWith("blob:receipt");
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

function MountableModal({ onClose }: { onClose?: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open pre-book
      </button>
      {open ? (
        <PrebookModal
          open
          onClose={() => {
            setOpen(false);
            onClose?.();
          }}
          campaign={foodCampaign}
          detail={foodDetail}
          selectedVariantId="miso-sesame"
          onConfirm={vi.fn()}
        />
      ) : null}
    </>
  );
}

describe("pre-book modal dialog focus", () => {
  it("moves focus into the dialog and restores it to the trigger on close", () => {
    const onClose = vi.fn();
    render(<MountableModal onClose={onClose} />);
    const trigger = screen.getByRole("button", { name: "Open pre-book" });
    trigger.focus();

    fireEvent.click(trigger);

    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);

    fireEvent.click(
      screen.getByRole("button", { name: "Close pre-book dialog" }),
    );
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it("traps Tab and Shift+Tab inside the dialog", () => {
    render(<MountableModal />);
    fireEvent.click(screen.getByRole("button", { name: "Open pre-book" }));

    const dialog = screen.getByRole("dialog");
    const focusables = Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      ),
    );
    expect(focusables.length).toBeGreaterThan(1);

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    last.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    first.focus();
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });
});

function fillCardDetails() {
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
}

function startPayment() {
  fillCardDetails();
  fireEvent.click(
    screen.getByRole("button", { name: "Pay Token (Simulated Test Mode)" }),
  );
}

describe("pre-book modal close and cancellation", () => {
  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(
      <PrebookModal
        open
        onClose={onClose}
        campaign={foodCampaign}
        detail={foodDetail}
        selectedVariantId="miso-sesame"
        onConfirm={vi.fn()}
      />,
    );

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes on a backdrop mouse down but not on the dialog", () => {
    const onClose = vi.fn();
    const { container } = render(
      <PrebookModal
        open
        onClose={onClose}
        campaign={foodCampaign}
        detail={foodDetail}
        selectedVariantId="miso-sesame"
        onConfirm={vi.fn()}
      />,
    );

    fireEvent.mouseDown(container.firstElementChild as HTMLElement);
    expect(onClose).toHaveBeenCalledOnce();

    fireEvent.mouseDown(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("cancels a pending payment when the modal closes", () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    const props = {
      onClose: vi.fn(),
      campaign: foodCampaign,
      detail: foodDetail,
      selectedVariantId: "miso-sesame",
      onConfirm,
    };
    const { rerender } = render(<PrebookModal open {...props} />);

    startPayment();
    rerender(<PrebookModal open={false} {...props} />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("cancels a pending payment when the modal unmounts", () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    const { unmount } = render(
      <PrebookModal
        open
        onClose={vi.fn()}
        campaign={foodCampaign}
        detail={foodDetail}
        selectedVariantId="miso-sesame"
        onConfirm={onConfirm}
      />,
    );

    startPayment();
    unmount();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

describe("pre-book modal payment tabs", () => {
  it("links each tab to a panel and supports arrow, Home and End keys", () => {
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

    const upi = screen.getByRole("tab", { name: "UPI" });
    const card = screen.getByRole("tab", { name: "Card" });
    expect(upi).toHaveAttribute("aria-controls", "upi-panel");
    expect(card).toHaveAttribute("aria-controls", "card-panel");
    expect(screen.getByRole("tabpanel", { name: "UPI" })).toHaveAttribute(
      "id",
      "upi-panel",
    );

    fireEvent.keyDown(upi, { key: "ArrowRight" });
    expect(card).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Card" })).toHaveAttribute(
      "id",
      "card-panel",
    );
    expect(screen.getByLabelText("Card Number")).toBeInTheDocument();

    fireEvent.keyDown(card, { key: "ArrowLeft" });
    expect(upi).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText("UPI ID")).toBeInTheDocument();

    fireEvent.keyDown(upi, { key: "End" });
    expect(card).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(card, { key: "Home" });
    expect(upi).toHaveAttribute("aria-selected", "true");
  });
});

describe("pre-book modal payment coverage", () => {
  it("confirms a UPI payment with the selected variant", () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    render(
      <PrebookModal
        open
        onClose={vi.fn()}
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
    fireEvent.change(screen.getByLabelText("UPI ID"), {
      target: { value: "asha@upi" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Pay Token (Simulated Test Mode)" }),
    );
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(onConfirm).toHaveBeenCalledExactlyOnceWith({
      backerName: "Asha T.",
      email: "asha@example.com",
      variantId: "miso-sesame",
      paymentMethod: "UPI",
    });
  });

  it("downloads the receipt from the modal button", () => {
    vi.useFakeTimers();
    let downloadedName = "";
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:receipt");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(
      function mockClick(this: HTMLAnchorElement) {
        downloadedName = this.download;
      },
    );
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

    startPayment();
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    fireEvent.click(screen.getByRole("button", { name: "Download Receipt" }));

    expect(downloadedName).toMatch(/^BZ-[A-Z0-9]{8}\.txt$/);
  });

  it("moves focus to the receipt heading when the form swaps to the receipt", () => {
    vi.useFakeTimers();
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

    startPayment();
    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(document.activeElement).toBe(
      screen.getByRole("heading", { name: "ESCROW RECEIPT" }),
    );
  });

  it("does not make tabpanels redundant tab stops", () => {
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

    expect(screen.getByRole("tabpanel", { name: "UPI" })).not.toHaveAttribute(
      "tabindex",
    );
    fireEvent.click(screen.getByRole("tab", { name: "Card" }));
    expect(screen.getByRole("tabpanel", { name: "Card" })).not.toHaveAttribute(
      "tabindex",
    );
  });
});

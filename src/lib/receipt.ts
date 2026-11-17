export type PaymentMethod = "UPI" | "Card";

export type EscrowReceipt = {
  id: string;
  campaignName: string;
  batch: string;
  backerName: string;
  email: string;
  variantLabel: string;
  size?: string;
  amountInr: number;
  paymentMethod: PaymentMethod;
  issuedAt: string;
};

export function createReceipt(
  input: Omit<EscrowReceipt, "id" | "issuedAt"> & {
    id?: string;
    issuedAt?: string;
  },
): EscrowReceipt {
  const generatedId =
    "BZ-" +
    Math.random()
      .toString(36)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .padEnd(8, "0")
      .slice(0, 8);

  return {
    ...input,
    id: input.id ?? generatedId,
    issuedAt: input.issuedAt ?? new Date().toISOString(),
  };
}

export function formatReceiptText(receipt: EscrowReceipt): string {
  return [
    "================================",
    "ESCROW RECEIPT — SIMULATED TEST MODE",
    "================================",
    `Receipt: ${receipt.id}`,
    `Issued: ${receipt.issuedAt}`,
    `Campaign: ${receipt.campaignName} (Batch ${receipt.batch})`,
    `Backer: ${receipt.backerName}`,
    `Email: ${receipt.email}`,
    `Variant: ${receipt.variantLabel}${receipt.size ? ` · Size ${receipt.size}` : ""}`,
    `Amount locked: ₹${receipt.amountInr.toLocaleString("en-IN")}`,
    `Payment method: ${receipt.paymentMethod}`,
    "Status: funds are safely locked in escrow until this batch clears its goal.",
    "This is a simulated receipt. No real payment was processed.",
  ].join("\n");
}

export function downloadReceipt(receipt: EscrowReceipt): void {
  const blob = new Blob([formatReceiptText(receipt)], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = `${receipt.id}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  // Firefox can cancel a download when its blob URL is revoked in the same
  // task as the click, so release it on the next tick instead.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

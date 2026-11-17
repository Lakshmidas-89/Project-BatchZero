"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, LockKeyhole, X } from "lucide-react";

import {
  createReceipt,
  downloadReceipt,
  type EscrowReceipt,
  type PaymentMethod,
} from "@/lib/receipt";
import type { Campaign } from "@/lib/campaigns";
import type { CampaignDetail } from "@/lib/campaign-details";

export type PaymentConfirmation = {
  backerName: string;
  email: string;
  variantId: string;
  size?: string;
  paymentMethod: PaymentMethod;
};

export function PrebookModal({
  open,
  onClose,
  campaign,
  detail,
  selectedVariantId,
  selectedSize,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  campaign: Campaign;
  detail: CampaignDetail;
  selectedVariantId: string;
  selectedSize?: string;
  onConfirm: (confirmation: PaymentConfirmation) => void;
}) {
  const [backerName, setBackerName] = useState("");
  const [email, setEmail] = useState("");
  const [variantId, setVariantId] = useState(selectedVariantId);
  const [size, setSize] = useState(selectedSize ?? detail.sizeOptions?.[0] ?? "");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState<EscrowReceipt | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  if (!open) {
    return null;
  }

  const variantLabel =
    detail.pollOptions.find((option) => option.id === variantId)?.label ??
    variantId;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (processing || receipt) {
      return;
    }

    setProcessing(true);

    timer.current = setTimeout(() => {
      const confirmation: PaymentConfirmation = {
        backerName: backerName.trim(),
        email: email.trim(),
        variantId,
        ...(detail.sizeOptions ? { size } : {}),
        paymentMethod,
      };

      const nextReceipt = createReceipt({
        campaignName: campaign.name,
        batch: campaign.batch,
        backerName: confirmation.backerName,
        email: confirmation.email,
        variantLabel,
        ...(confirmation.size ? { size: confirmation.size } : {}),
        amountInr: detail.tokenPriceInr,
        paymentMethod,
      });

      setReceipt(nextReceipt);
      setProcessing(false);
      onConfirm(confirmation);
    }, 1500);
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-ink/60 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="prebook-title"
        className="relative w-full max-w-lg rounded-3xl border border-line bg-card p-5 shadow-2xl sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close pre-book dialog"
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border border-line text-muted transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        {receipt ? (
          <div>
            <div className="flex items-center gap-2 text-fund">
              <CheckCircle2 className="size-5" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em]">
                Simulated Test Mode
              </span>
            </div>
            <h2
              id="prebook-title"
              className="mt-3 text-2xl font-bold tracking-tight text-ink"
            >
              ESCROW RECEIPT
            </h2>
            <p className="mt-1 text-sm text-muted">
              {receipt.id} · {campaign.name}
            </p>

            <dl className="mt-5 divide-y divide-line rounded-2xl border border-line bg-canvas/60 px-4">
              {[
                ["Backer", receipt.backerName],
                ["Email", receipt.email],
                ["Batch", receipt.batch],
                ["Variant", receipt.size ? `${receipt.variantLabel} · Size ${receipt.size}` : receipt.variantLabel],
                ["Amount locked", `₹${receipt.amountInr.toLocaleString("en-IN")}`],
                ["Payment method", receipt.paymentMethod],
                ["Issued", new Date(receipt.issuedAt).toLocaleString("en-IN")],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 py-2.5"
                >
                  <dt className="text-xs text-muted">{label}</dt>
                  <dd className="text-right text-xs font-semibold text-ink">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-fund/15 bg-fund-soft px-3 py-2.5 text-[11px] font-medium leading-5 text-fund">
              <LockKeyhole className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              Funds are safely locked in escrow until this batch clears its goal.
              This is a simulated receipt — no real payment was processed.
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => downloadReceipt(receipt)}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-fund text-sm font-semibold text-white shadow-sm shadow-fund/20 transition-colors hover:bg-fund/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fund/40 focus-visible:ring-offset-2"
              >
                Download Receipt
              </button>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-line bg-white text-sm font-semibold text-ink transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
              Pre-book token
            </p>
            <h2
              id="prebook-title"
              className="mt-1 text-xl font-bold tracking-tight text-ink sm:text-2xl"
            >
              Back Batch {campaign.batch}
            </h2>
            <p className="mt-1 text-xs text-muted">
              ₹{detail.tokenPriceInr.toLocaleString("en-IN")} is held in escrow,
              not charged. Refunded automatically if the goal is missed.
            </p>

            <div className="mt-5 grid gap-4">
              <div>
                <label
                  htmlFor="backer-name"
                  className="text-xs font-semibold text-ink"
                >
                  Backer Name
                </label>
                <input
                  id="backer-name"
                  required
                  value={backerName}
                  onChange={(event) => setBackerName(event.target.value)}
                  placeholder="Your full name"
                  className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20"
                />
              </div>

              <div>
                <label
                  htmlFor="backer-email"
                  className="text-xs font-semibold text-ink"
                >
                  Email
                </label>
                <input
                  id="backer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="selected-variant"
                    className="text-xs font-semibold text-ink"
                  >
                    Selected Variant
                  </label>
                  <select
                    id="selected-variant"
                    value={variantId}
                    onChange={(event) => setVariantId(event.target.value)}
                    className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20"
                  >
                    {detail.pollOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {detail.sizeOptions ? (
                  <div>
                    <label
                      htmlFor="selected-size"
                      className="text-xs font-semibold text-ink"
                    >
                      Size
                    </label>
                    <select
                      id="selected-size"
                      value={size}
                      onChange={(event) => setSize(event.target.value)}
                      className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20"
                    >
                      {detail.sizeOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-line pt-4">
                <div role="tablist" className="flex gap-2">
                  {(["UPI", "Card"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      role="tab"
                      aria-selected={paymentMethod === method}
                      onClick={() => setPaymentMethod(method)}
                      className={`rounded-lg border px-4 py-1.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 ${
                        paymentMethod === method
                          ? "border-brand bg-brand-soft text-brand"
                          : "border-line bg-white text-muted hover:border-brand/30"
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>

                {paymentMethod === "UPI" ? (
                  <div className="mt-3">
                    <label
                      htmlFor="upi-vpa"
                      className="text-xs font-semibold text-ink"
                    >
                      UPI ID
                    </label>
                    <input
                      id="upi-vpa"
                      required
                      placeholder="name@upi"
                      className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20"
                    />
                  </div>
                ) : (
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="card-number"
                        className="text-xs font-semibold text-ink"
                      >
                        Card Number
                      </label>
                      <input
                        id="card-number"
                        required
                        inputMode="numeric"
                        placeholder="4242 4242 4242 4242"
                        className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="card-expiry"
                        className="text-xs font-semibold text-ink"
                      >
                        Expiry
                      </label>
                      <input
                        id="card-expiry"
                        required
                        placeholder="MM/YY"
                        className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="card-cvv"
                        className="text-xs font-semibold text-ink"
                      >
                        CVV
                      </label>
                      <input
                        id="card-cvv"
                        required
                        inputMode="numeric"
                        placeholder="123"
                        className="mt-1.5 h-10 w-full rounded-xl border border-line bg-white px-3 text-sm outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white shadow-sm shadow-brand/20 transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-70"
            >
              {processing ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  Processing…
                </>
              ) : (
                "Pay Token (Simulated Test Mode)"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

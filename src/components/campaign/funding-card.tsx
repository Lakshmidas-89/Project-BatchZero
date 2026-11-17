"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Flame, ShieldCheck, Users } from "lucide-react";

import { Progress } from "@/components/ui/progress";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

function getServerReducedMotionSnapshot() {
  return true;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot,
  );
}

function useCountUp(target: number) {
  const reduceMotion = usePrefersReducedMotion();
  const [display, setDisplay] = useState(target);
  const current = useRef(target);
  const mounted = useRef(false);

  useEffect(() => {
    // SSR and the first client render must agree on the amount. Only animate
    // subsequent target changes, so the figure never flashes back to zero.
    if (!mounted.current) {
      mounted.current = true;
      current.current = target;
      return;
    }

    if (reduceMotion) {
      current.current = target;
      return;
    }

    let frame = 0;
    const startedAt = performance.now();
    const from = current.current;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / 600);
      const next = from + (target - from) * (1 - Math.pow(1 - progress, 3));

      current.current = next;
      setDisplay(next);

      if (progress < 1) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [target, reduceMotion]);

  return reduceMotion ? target : display;
}

export function FundingCard({
  raisedInr,
  targetInr,
  backers,
  earlyBirdSpots,
  label,
}: {
  raisedInr: number;
  targetInr: number;
  backers: number;
  earlyBirdSpots: number;
  label: string;
}) {
  const displayRaised = useCountUp(raisedInr);
  const fundedPercent =
    targetInr > 0 ? Math.round((raisedInr / targetInr) * 100) : 0;

  return (
    <section className="rounded-3xl border border-line bg-card p-5 shadow-sm sm:p-6">
      <h2 className="sr-only">Escrow funding</h2>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
            Escrow balance
          </p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-ink">
            ₹{Math.round(displayRaised).toLocaleString("en-IN")}
          </p>
          <p className="mt-1 text-xs text-muted">
            of <span>₹{targetInr.toLocaleString("en-IN")}</span> target
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-fund/15 bg-fund-soft px-2.5 py-1 text-[11px] font-bold text-fund">
          {fundedPercent}% funded
        </span>
      </div>

      <Progress
        value={fundedPercent}
        tone="fund"
        label={label}
        className="mt-4 h-2.5"
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
          <Users className="size-4" aria-hidden="true" />
          {backers} backers
        </span>

        <span className="inline-flex items-center gap-2 rounded-full border border-alert/15 bg-alert-soft px-3 py-1.5">
          <Flame className="size-3.5 text-alert" aria-hidden="true" />
          <span className="text-[11px] font-semibold text-alert">
            Early-Bird Spots Left
          </span>
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-alert">
            {earlyBirdSpots}
          </span>
        </span>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-xl border border-fund/15 bg-fund-soft px-3 py-2.5">
        <ShieldCheck
          className="mt-0.5 size-4 shrink-0 text-fund"
          aria-hidden="true"
        />
        <p className="text-[11px] font-medium leading-5 text-fund">
          <span className="font-bold">100% Escrow Protected</span> — funds are
          locked until the batch clears its goal.
        </p>
      </div>
    </section>
  );
}

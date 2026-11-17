"use client";

import { useState } from "react";
import { MessageSquarePlus, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import type { CoCreatorComment } from "@/lib/campaign-details";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CoCreatorWall({
  comments,
  canPost,
  onPost,
}: {
  comments: CoCreatorComment[];
  canPost: boolean;
  onPost: (text: string) => void;
}) {
  const [note, setNote] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = note.trim();

    if (!trimmed) {
      return;
    }

    onPost(trimmed);
    setNote("");
  }

  return (
    <section className="rounded-3xl border border-line bg-card p-5 sm:p-7">
      <SectionHeading
        eyebrow="Backed, not guessed"
        title="Verified Co-Creator Wall"
        description="Only shoppers who have pre-booked this batch can post here. Every backer below has money in escrow."
      />

      <ul className="mt-6 space-y-4">
        {comments.map((comment) => (
          <li
            key={comment.id}
            className="rounded-2xl border border-line bg-canvas/60 p-4"
          >
            <div className="flex items-start gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white"
                aria-hidden="true"
              >
                {initials(comment.name)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold text-ink">
                    {comment.name}
                  </span>
                  {comment.verified ? (
                    <Badge variant="fund">
                      <ShieldCheck className="size-3" aria-hidden="true" />
                      Verified Backer
                    </Badge>
                  ) : null}
                  <span className="text-[11px] text-muted">{comment.time}</span>
                </div>
                <p className="mt-1.5 text-sm leading-6 text-muted">
                  {comment.text}
                </p>
                {comment.variant ? (
                  <p className="mt-1.5 text-[11px] font-medium text-brand">
                    Backed {comment.variant}
                  </p>
                ) : null}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {canPost ? (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-2xl border border-fund/20 bg-fund-soft p-4"
        >
          <label
            htmlFor="co-creator-note"
            className="flex items-center gap-1.5 text-sm font-semibold text-ink"
          >
            <MessageSquarePlus className="size-4 text-fund" aria-hidden="true" />
            Add your note
          </label>
          <p className="mt-1 text-xs text-muted">
            You&apos;re a verified backer. Tell the maker why you&apos;re in.
          </p>
          <textarea
            id="co-creator-note"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="What made you pre-book this batch?"
            className="mt-3 w-full resize-none rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink shadow-sm outline-none placeholder:text-muted/70 focus-visible:border-fund focus-visible:ring-2 focus-visible:ring-fund/20"
          />
          <button
            type="submit"
            className="mt-3 inline-flex h-9 items-center justify-center rounded-xl bg-fund px-4 text-xs font-semibold text-white shadow-sm shadow-fund/20 transition-colors hover:bg-fund/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fund/40 focus-visible:ring-offset-2"
          >
            Post to wall
          </button>
        </form>
      ) : null}
    </section>
  );
}

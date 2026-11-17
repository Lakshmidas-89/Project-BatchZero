# Campaign Detail & Validation Page — Design

**Date:** 2026-11-17
**Route:** `/campaigns/[id]`
**Status:** Approved approach (hero choice confirmed by partner)

## Intent

Give a shopper everything they need to validate a batch and commit a pre-book token, in one
place: proof of demand (funding + verified backers), a say in what gets made (variant poll), and
a safe-feeling, simulated escrow checkout. It extends the existing BatchZero UI shell, it does
not replace it.

## Goals

- A 60/40 detail layout: editorial proof on the left, persistent action panel on the right.
- Live-feeling escrow state: raised amount, target, backer count and progress bar respond to a
  simulated token payment.
- A variant poll whose percentage bars redraw immediately on a vote.
- A simulated pre-book modal with a believable payment flow and a downloadable escrow receipt.
- A "Verified Co-Creator Wall" that only paying backers can post to.
- Discoverability from the existing home cards.

## Non-goals

- No real payments, no backend, no persistence across reloads.
- No real image assets — the hero is a CSS illustration (partner-confirmed).
- No auth, no user accounts, no email sending.
- No changes to the dollar-denominated home page data model.

## Constraints

- Next.js 16.4.6, React 19.3, Tailwind v4, `cacheComponents: true`, typed routes.
- Dynamic segments with `cacheComponents` require `generateStaticParams()` (or a Suspense
  boundary) so params are known at build time. Campaign IDs are static and known, so use
  `generateStaticParams()`.
- Existing design tokens: `canvas`, `card`, `line`, `ink`, `muted`, `brand`, `brand-soft`,
  `fund` (emerald), `fund-soft`, `alert`, `alert-soft`. Emerald = escrow/funding.
- Vitest + Testing Library with `@` → `src` alias and jsdom.

## Approaches considered

1. **Server page + client island (chosen).** Server component resolves the route param and
   hands typed campaign/detail data to one client component that owns all interactive state.
   Fits `cacheComponents`, keeps params out of client Suspense, and is straightforward to test
   because the client component takes props.
2. **Fully client page with `useParams()`.** Simpler file count, but with `cacheComponents`
   an un-prerendered param forces a Suspense boundary and the page can't statically validate.
   Rejected.
3. **Context-based global store.** Would let the home cards reflect a payment after navigating
   back, but adds unnecessary plumbing for a simulated, session-only flow. Rejected; local
   state is enough. The only global change is the existing role/category context, untouched.

## Design

### Data — `src/lib/campaign-details.ts`

A `CAMPAIGN_DETAILS: Record<string, CampaignDetail>` keyed by the existing campaign IDs. Each
entry supplies:

- `tokenPriceInr` — pre-book token price in rupees (e.g. 1499 / 2799 / 7499).
- `raisedInr`, `targetInr`, `initialBackers` — starting ₹ funding state for the detail page,
  seeded from the campaign's USD `pledged`/`goal`/`backers` but stored explicitly so the copy is
  controlled. *(Builder call: the design originally omitted these; explicit fields avoid a
  runtime conversion rate and keep the home page's USD model untouched.)*
- `earlyBirdSpots` — starting urgency count.
- `story` — 1–2 short brand-story paragraphs.
- `specs` — 3–4 label/value pairs (ingredients for Food/Skincare, materials for Fashion).
- `pollQuestion` and `pollOptions` (id, label, starting votes) — flavours for Food, scents /
  actives for Skincare, styles / colours for Fashion.
- `sizeOptions` — `["XS","S","M","L","XL","XXL"]` for Fashion only.
- `comments` — seeded Co-Creator Wall entries (name, text, relative time, `verified: true`).

Separate detail data keeps the existing USD campaign fields intact for the home page; the
detail page renders its own ₹ amounts.

### Route — `src/app/campaigns/[id]/page.tsx`

- `generateStaticParams()` returns the three campaign IDs.
- Default export is `async`, uses `PageProps<"/campaigns/[id]">`, `await params`, looks up the
  campaign; `notFound()` for an unknown ID.
- Renders `<main id="main">` with `<CampaignDetail campaign={campaign} detail={detail} />`.
- `generateMetadata()` gives the page a campaign-specific title.

### Client component — `src/components/campaign/campaign-detail.tsx`

Owns all interactive state and passes slices to presentational children in
`src/components/campaign/`:

- `campaign-hero.tsx` — large CSS product illustration: category-tinted gradient panel,
  concentric decorative shapes, oversized `CategoryMark`, batch/category badges, price badge.
- `brand-story.tsx` — story paragraphs + specs grid.
- `co-creator-wall.tsx` — seeded + newly posted comments; each paying backer shows a green
  `ShieldCheck` + "Verified Backer" badge. After a successful payment, an "Add your note"
  textarea appears; submitting adds a verified comment with the backer's name and chosen variant.
- `funding-card.tsx` — amount raised (animated count-up), target, animated emerald `Progress`
  bar, backer count, "Early-Bird Spots Left" badge (decrements on payment), and a
  "100% Escrow Protected" info box.
- `variant-poll.tsx` — option buttons with `aria-pressed`; one vote per session; percentage
  bars recompute from local vote counts immediately. Fashion also renders an XS–XXL size
  selector whose selection is shared with the modal.
- `prebook-modal.tsx` — dialog with Backer Name, Email, Selected Variant (and Size for
  Fashion), UPI / Card tabs with representative fields, and a "Pay Token (Simulated Test
  Mode)" button. On submit: 1.5s processing state (spinner + progress indicator), then
  `onConfirmed()` increments raised amount by `tokenPriceInr`, increments backers, decrements
  early-bird spots, and reveals the receipt. Receipt includes a generated ID, campaign/batch,
  backer, variant/size, amount, payment method, timestamp and escrow-lock confirmation, with
  an on-screen view plus a "Download Receipt" button that writes a `.txt` file from a Blob.
  Escape/backdrop close, focus handling, and `aria-modal`/`role="dialog"`.

State lives in `CampaignDetail` so the funding card, poll selection, wall, and modal stay in
sync. Early-bird spots and poll votes also update locally on payment/vote.

*(Builder call: simulated payments are repeatable in a session — each successful payment adds
`tokenPriceInr`, one backer, and consumes one early-bird spot, and each can post its own verified
note. Only the poll is one-vote-per-session. This keeps the "live" increments demonstrable.)*

### Home integration

`ShopperCampaignCard` in `src/components/home/shopper-view.tsx` gets a "View batch details" link
and the "Join the batch" button becomes a `Link` to `/campaigns/{id}`. Typed-route template
strings will be cast to the generated `Route` type if needed.

### Styling / accessibility

- Reuse `Badge`, `Progress`, `CategoryMark`, `SectionHeading` and the existing tokens.
- 60/40 via `lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]`; single column on mobile; right panel
  `lg:sticky lg:top-28 lg:self-start`.
- Respect `prefers-reduced-motion` (already global). Label progress bars, use real buttons,
  keyboard-accessible dialog, visible focus rings.

### Tests — `src/components/campaign/campaign-detail.test.tsx`

- Renders funding card, story, specs and seeded verified comments.
- Poll click updates percentages and locks further votes.
- Fashion campaign shows XS–XXL and the modal carries the selected size.
- With fake timers, paying advances 1.5s, then amount + backers update, receipt appears with a
  download button, and posting a note adds a new verified comment.

## Left to the builder

- Exact copy, micro-interactions, and CSS detail.
- How the typed `Route` cast is expressed (import path from generated route types).
- Whether the receipt is `.txt` or `.html`; default is `.txt`.

# Shopper Discovery Feed — Short Design

**Date:** 2026-11-17
**Status:** Approved (partner said "continue" after choosing Option A + SVG placeholders)

## Intent

Make `/` the Shopper Discovery Feed for BatchZero: a browse-and-filter surface where
shoppers see six realistic Indian D2C pre-order campaigns, understand the escrow
safety net at a glance, and open a campaign detail page. This is the shopper-facing
front door; it replaces the demo role-toggle landing page as the main route.

## Goals

- New structured seed module `src/data/seedCampaigns.ts` with exactly six campaigns
  (2 Food, 2 Skincare, 2 Fashion) using the supplied names, targets, current amounts,
  token prices, and compliance badges.
- Each campaign carries a 3-option variant poll (question + options with vote counts),
  backer count, days left, and a local high-resolution product placeholder image.
- `/` renders: compact 3-step escrow trust banner ("Back Early Concepts" → "Funds
  Locked in Escrow" → "Shipped or 100% Auto-Refunded"), working category tabs
  (All/Food/Skincare/Fashion), working search bar, and a 3-column responsive grid.
- Cards show product image, category + compliance badges, emerald funding bar with
  `₹current / ₹target` and `% funded` (Indian digit grouping via `en-IN`), backer
  count, days left, and an "Active Poll" tag. Clicking a card navigates to
  `/campaigns/[id]`.
- A campaign detail route at `/campaigns/[id]` that reads the seed data and shows the
  campaign, its poll, and escrow messaging; unknown ids show a not-found state.
- Existing tests keep passing.

## Non-goals

- No backend, database, payment, escrow integration, or poll-vote persistence.
- No changes to the founder view or the legacy `src/lib/campaigns.ts` demo data.
- No real product photography; placeholders are intentionally local SVGs.

## Constraints

- Next.js 16.4.6 / React 19 / Tailwind 4 / lucide-react / TypeScript, per `package.json`.
- Next.js 16 route props are async: dynamic pages use `PageProps<'/campaigns/[id]'>` and
  `await params` (verified in `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md`).
- `next/image` with local SVG placeholders: static string paths from `/public` with
  explicit `width`/`height` (verified in `.../12-images.md`); no `remotePatterns` needed.
- Global `Category` type and `CATEGORIES` live in `src/context/app-state.tsx`; reuse them
  so the navbar pills and feed tabs share one source of truth.
- Vitest + Testing Library + jsdom is the test stack; existing tests must stay green.

## Approaches

- **A — Focused shopper feed (chosen):** `/` renders a new self-contained discovery
  feed. Legacy `HomeView`, founder view, and their tests remain in the repo untouched
  but are no longer mounted at `/`; the navbar role toggle and category pills are
  removed from the header so the feed's own filter bar is the single source of
  filtering (and so those controls aren't dead on `/campaigns/[id]`). Cleanest match
  to the spec, least churn in shared state.
- **B — Keep the role-toggle shell (rejected):** `/` keeps `HomeView` and swaps only its
  shopper branch. Preserves the founder demo but drags hero/stats/founder UI into a
  page the spec didn't ask for and needs more test rewrites.

- **Images:** local category-themed SVG placeholders (chosen) — resolution-independent,
  offline, no external image host config. Generated AI product photos were declined.

## Design / implementation notes

Files to add:

- `src/data/seedCampaigns.ts` — `Campaign` type (id, name, category, compliance badge,
  target, current, tokenPrice, backers, daysLeft, image, summary, poll) + `SEED_CAMPAIGNS`.
  Helpers: `formatINR`, `fundedPercent`, `getCampaignById`.
- `public/images/campaigns/*.svg` — six distinct, high-res SVG product placeholders.
- `src/components/shopper/escrow-trust-banner.tsx` — compact 3-step banner.
- `src/components/shopper/campaign-filters.tsx` — category tabs + search input.
- `src/components/shopper/campaign-card.tsx` — card with image, badges, progress, stats,
  poll tag; whole card is a `next/link` to `/campaigns/[id]`.
- `src/components/shopper/shopper-discovery-feed.tsx` — client component composing the
  above; local `query` state, category from `useAppState`.
- `src/app/campaigns/[id]/page.tsx` — async dynamic route; `notFound()` for unknown ids.
- `src/app/campaigns/[id]/not-found.tsx` — friendly not-found state.
- Tests: `src/data/seedCampaigns.test.ts`, `src/components/shopper/shopper-discovery-feed.test.tsx`.

Files to edit:

- `src/app/page.tsx` — render `ShopperDiscoveryFeed` instead of `HomeView`.
- `src/components/layout/navbar.tsx` — drop `RoleToggle` and `CategoryPills`.
- `src/app/globals.css` — register the emerald fund token if needed (already present).

Decisions left to the builder (my calls, noted for review):

- Poll questions/options and vote counts are invented but realistic per category.
- Backers and days-left values are invented but plausible.
- Search matches campaign name, summary, category, and compliance badge, case-insensitively.
- `en-IN` formatting renders ₹1,00,000 exactly as specified.

## Verification

`npm test`, `npm run lint`, `npm run build`, and a dev-server smoke check of `/` and one
`/campaigns/[id]` URL.

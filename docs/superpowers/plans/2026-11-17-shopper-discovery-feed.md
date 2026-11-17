# Shopper Discovery Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/` a shopper discovery feed backed by six Indian D2C seed campaigns, with escrow trust banner, category/search filters, campaign cards, and a `/campaigns/[id]` detail route.

**Architecture:** A standalone typed seed module owns all campaign data and formatting helpers. A client `ShopperDiscoveryFeed` composes a presentational trust banner, a filter bar bound to the existing global `Category` state plus local search text, and link-wrapped campaign cards. A thin async App Router page reads the seed module for detail views and delegates rendering to a presentational `CampaignDetail`.

**Tech Stack:** Next.js 16.4.6 App Router, React 19, Tailwind 4, lucide-react, TypeScript, Vitest + Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-11-17-shopper-discovery-feed-design.md`

## Global Constraints

- Keep the six supplied names, categories, targets, current amounts, token prices, and compliance badges verbatim (see Task 1 table).
- Render money with `en-IN` grouping: ₹1,00,000, ₹42,500. Use `formatINR` — never hard-code formatted strings.
- Funding bar is emerald (`text-fund` / `bg-fund`, token `#059669` in `src/app/globals.css`).
- Product images are local SVG files under `public/images/campaigns/`, referenced as `/images/campaigns/<id>.svg`; `next/image` skips optimization for `.svg` sources automatically (verified in `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`, "dangerouslyAllowSVG").
- Do not modify `src/lib/campaigns.ts`, `src/components/home/*`, or their tests. Those components stay in the repo but off `/`.
- All user-visible currency uses the ₹ symbol and Indian grouping; all copy is English.
- Every task ends with `npm test` green before committing; final task also runs lint/build.

## Review Focus

- **Unknown `/campaigns/[id]` id** — must show a friendly not-found state, never a crash or blank page. Test: `getCampaignById("does-not-exist")` returns `undefined` (Task 1) and `CampaignNotFound` renders its message + home link (Task 5).
- **Search that matches nothing** — must show an empty state, not an empty grid. Test: feed test types "zzzz" and asserts the empty-state message (Task 4).
- **Search beyond the name** — "FSSAI" must find the ragi campaign via its compliance badge, and "skincare" must find skincare campaigns via category. Tests in Task 4.
- **Indian digit grouping / percentages** — `formatINR(100000) === "₹1,00,000"` and `fundedPercent` rounds (₹42,500/₹50,000 → 85). Tests in Task 1.
- **Poll vote totals / zero-vote safety** — `pollTotalVotes` sums options and vote-share rendering must not divide by zero. Test in Task 1; guard with `total > 0 ? ... : 0` in Task 5.

---

### Task 1: Seed campaign module and helpers

**Files:**
- Create: `src/data/seedCampaigns.ts`
- Test: `src/data/seedCampaigns.test.ts`

**Interfaces:**
- Produces: `CampaignCategory = "Food" | "Skincare" | "Fashion"`; `PollOption = { id: string; label: string; votes: number }`; `VariantPoll = { question: string; options: readonly [PollOption, PollOption, PollOption] }`; `SeedCampaign = { id, name, category, summary, founder, batch, complianceBadge, target, current, tokenPrice, backers, daysLeft, image, poll }` (all fields typed as above; `image: string`); `SEED_CAMPAIGNS: readonly SeedCampaign[]`; `formatINR(amount: number): string`; `fundedPercent(campaign: Pick<SeedCampaign, "current" | "target">): number`; `getCampaignById(id: string): SeedCampaign | undefined`; `pollTotalVotes(poll: VariantPoll): number`; `filterSeedCampaigns(campaigns: readonly SeedCampaign[], category: "All" | CampaignCategory, query: string): SeedCampaign[]`.

- [ ] **Step 1: Write the failing test file**

```ts
import { describe, expect, it } from "vitest";
import {
  SEED_CAMPAIGNS,
  filterSeedCampaigns,
  formatINR,
  fundedPercent,
  getCampaignById,
  pollTotalVotes,
} from "@/data/seedCampaigns";

describe("SEED_CAMPAIGNS", () => {
  it("has the six specified campaigns with exact money and badges", () => {
    expect(SEED_CAMPAIGNS).toHaveLength(6);
    expect(
      SEED_CAMPAIGNS.map((c) => [c.name, c.category, c.target, c.current, c.tokenPrice, c.complianceBadge]),
    ).toEqual([
      ["Ragi & Peri-Peri Protein Crisps", "Food", 50000, 42500, 199, "FSSAI Applied"],
      ["Filter Coffee & Ashwagandha Cold Brew", "Food", 75000, 31000, 249, "Lab Tested"],
      ["Kumkumadi & 5% Niacinamide Gel Sunscreen", "Skincare", 100000, 88000, 299, "Dermatologist Formulated"],
      ["Kokum Butter & Rice Water Lip Mask", "Skincare", 40000, 14000, 149, "CDSCO Ready"],
      ["Handloom Bamboo-Cotton Oversized Tees", "Fashion", 80000, 64000, 399, "Zero-Waste Sizing"],
      ["Upcycled Banarasi & Denim Crossbody Bags", "Fashion", 60000, 18000, 349, "Artisan Verified"],
    ]);
  });

  it("gives every campaign a 3-option poll, backers, days left, and an image", () => {
    for (const c of SEED_CAMPAIGNS) {
      expect(c.poll.options).toHaveLength(3);
      expect(c.poll.question.length).toBeGreaterThan(0);
      expect(c.backers).toBeGreaterThan(0);
      expect(c.daysLeft).toBeGreaterThan(0);
      expect(c.image).toBe(`/images/campaigns/${c.id}.svg`);
    }
  });
});

describe("helpers", () => {
  it("formats rupees with Indian grouping", () => {
    expect(formatINR(100000)).toBe("₹1,00,000");
    expect(formatINR(42500)).toBe("₹42,500");
    expect(formatINR(199)).toBe("₹199");
  });

  it("rounds funded percentage", () => {
    expect(fundedPercent({ current: 42500, target: 50000 })).toBe(85);
    expect(fundedPercent({ current: 31000, target: 75000 })).toBe(41);
  });

  it("looks up campaigns by id", () => {
    expect(getCampaignById(SEED_CAMPAIGNS[0].id)?.name).toBe(SEED_CAMPAIGNS[0].name);
    expect(getCampaignById("does-not-exist")).toBeUndefined();
  });

  it("sums poll votes", () => {
    expect(pollTotalVotes(SEED_CAMPAIGNS[0].poll)).toBe(
      SEED_CAMPAIGNS[0].poll.options.reduce((sum, o) => sum + o.votes, 0),
    );
  });

  it("filters by category and case-insensitive query across name, summary, category and badge", () => {
    expect(filterSeedCampaigns(SEED_CAMPAIGNS, "Food", "").map((c) => c.id)).toEqual([
      "ragi-peri-peri-protein-crisps",
      "filter-coffee-ashwagandha-cold-brew",
    ]);
    expect(filterSeedCampaigns(SEED_CAMPAIGNS, "All", "FSSAI").map((c) => c.id)).toEqual([
      "ragi-peri-peri-protein-crisps",
    ]);
    expect(filterSeedCampaigns(SEED_CAMPAIGNS, "All", "SKINCARE")).toHaveLength(2);
    expect(filterSeedCampaigns(SEED_CAMPAIGNS, "All", "zzzz")).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/data/seedCampaigns.test.ts`
Expected: FAIL — cannot find module `@/data/seedCampaigns`.

- [ ] **Step 3: Implement `src/data/seedCampaigns.ts`**

Export the types and functions listed in Interfaces. `formatINR` uses `new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })`. `fundedPercent` returns `Math.round((current / target) * 100)`. `filterSeedCampaigns` lowercases the query and matches against `name`, `summary`, `category`, and `complianceBadge`; an empty query matches all. Use these exact ids, in this order, with these invented-but-realistic fields:

| id | founder / batch | summary | backers | daysLeft | poll question → options (label: votes) |
| --- | --- | --- | --- | --- | --- |
| `ragi-peri-peri-protein-crisps` | Millets & More / `#BZ-011` | Roasted ragi crisps with a peri-peri kick — protein-forward, pressure-fried, and gluten-free. | 312 | 9 | Which flavour should we launch first? → Classic Peri-Peri: 142, Smoky Himalayan Salt: 98, Mint Chutney: 72 |
| `filter-coffee-ashwagandha-cold-brew` | Kettle & Root / `#BZ-014` | Slow-steeped filter coffee blended with ashwagandha for a calm, focused cold brew. | 184 | 14 | What should the first cold brew taste like? → Filter Coffee Forward: 88, Extra Ashwagandha: 61, Balanced 50-50: 35 |
| `kumkumadi-niacinamide-gel-sunscreen` | Sansa Skinlab / `#BZ-006` | A kumkumadi-infused gel sunscreen with 5% niacinamide for Indian skin and humidity. | 596 | 6 | Which finish do you want? → Dewy Glow: 240, Matte Invisible: 289, Tinted Warm: 67 |
| `kokum-butter-rice-water-lip-mask` | Kokum Studio / `#BZ-019` | An overnight lip mask combining kokum butter and fermented rice water for soft lips. | 127 | 11 | Pick your everyday lip mask scent → Unscented: 54, Rose Kokum: 41, Vanilla Rice: 32 |
| `handloom-bamboo-cotton-oversized-tees` | Loom & Line / `#BZ-009` | Breathable handloom bamboo-cotton tees in a relaxed oversized cut with zero-waste patterning. | 268 | 8 | Choose the first drop colour → Undyed Natural: 121, Indigo Wash: 94, Charcoal Black: 53 |
| `upcycled-banarasi-denim-crossbody-bags` | Reweave Atelier / `#BZ-021` | One-of-a-kind crossbody bags stitched from upcycled Banarasi silk and surplus denim. | 94 | 17 | Which silhouette should we stitch first? → Sling / Crossbody: 48, Mini Tote: 29, Waist Pouch: 17 |

Give each poll option a stable kebab-case `id`. `image` is derived as `/images/campaigns/${id}.svg`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/data/seedCampaigns.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add src/data/seedCampaigns.ts src/data/seedCampaigns.test.ts
git commit -m "feat: add Indian D2C seed campaigns and helpers"
```

---

### Task 2: Local product placeholder images

**Files:**
- Create: `public/images/campaigns/ragi-peri-peri-protein-crisps.svg`
- Create: `public/images/campaigns/filter-coffee-ashwagandha-cold-brew.svg`
- Create: `public/images/campaigns/kumkumadi-niacinamide-gel-sunscreen.svg`
- Create: `public/images/campaigns/kokum-butter-rice-water-lip-mask.svg`
- Create: `public/images/campaigns/handloom-bamboo-cotton-oversized-tees.svg`
- Create: `public/images/campaigns/upcycled-banarasi-denim-crossbody-bags.svg`
- Test: `src/data/seedCampaigns.images.test.ts`

**Interfaces:**
- Consumes: `SEED_CAMPAIGNS[].image` and `.id` from Task 1.
- Produces: six valid SVG files at the paths above; each `viewBox="0 0 1200 900"`, a category-themed gradient background (amber/orange Food, green/emerald Skincare, indigo/rose Fashion), a simple stylised product silhouette, and the campaign short name in large text. No external fonts or network assets.

- [ ] **Step 1: Write the failing test**

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SEED_CAMPAIGNS } from "@/data/seedCampaigns";

describe("campaign placeholder images", () => {
  it.each(SEED_CAMPAIGNS)("provides a valid SVG for $id", (campaign) => {
    const svg = readFileSync(join(process.cwd(), "public", campaign.image), "utf8");
    expect(svg).toContain("<svg");
    expect(svg).toContain('viewBox="0 0 1200 900"');
    expect(svg).toContain("</svg>");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/data/seedCampaigns.images.test.ts`
Expected: FAIL — ENOENT for the first image path.

- [ ] **Step 3: Create the six SVGs**

Write each file by hand (or one small generator script run once, then delete the script). Keep each under ~2 KB. Use `<defs><linearGradient>` for the background, a few `<path>`/`<ellipse>` shapes for the product silhouette, and a `<text>` label. Escape `&` as `&amp;` in names.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/data/seedCampaigns.images.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add public/images/campaigns src/data/seedCampaigns.images.test.ts
git commit -m "feat: add local SVG product placeholders"
```

---

### Task 3: Compact escrow trust banner

**Files:**
- Create: `src/components/shopper/escrow-trust-banner.tsx`
- Test: `src/components/shopper/escrow-trust-banner.test.tsx`

**Interfaces:**
- Produces: `EscrowTrustBanner(): ReactElement` — a presentational component with no props, no hooks, safe to render from a client parent.

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EscrowTrustBanner } from "@/components/shopper/escrow-trust-banner";

describe("EscrowTrustBanner", () => {
  it("shows the three escrow steps in order", () => {
    render(<EscrowTrustBanner />);
    const text = screen.getByText(/Back Early Concepts/i).parentElement?.textContent ?? "";
    expect(text).toContain("Funds Locked in Escrow");
    expect(text).toContain("Shipped or 100% Auto-Refunded");
    expect(screen.getAllByText(/→|ArrowRight/).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/shopper/escrow-trust-banner.test.tsx`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement the banner**

A single compact `section` with `aria-label="Escrow trust promise"`. Three inline steps, each numbered `1.` `2.` `3.` with the exact copy from the spec, separated by `ArrowRight` icons from lucide-react. Use `text-[11px] sm:text-xs`, `rounded-2xl border border-line bg-white px-4 py-3`, emerald accent on step 3. Keep it one row on desktop and wrapping rows on mobile. Adjust the test in Step 1 to match your final wrapper if the `parentElement` assertion is too brittle — assert the three strings are in the document and that two `ArrowRight` icons have `aria-hidden="true"`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/shopper/escrow-trust-banner.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/shopper/escrow-trust-banner.tsx src/components/shopper/escrow-trust-banner.test.tsx
git commit -m "feat: add compact escrow trust banner"
```

---

### Task 4: Campaign card, filter bar, and discovery feed

**Files:**
- Create: `src/components/shopper/campaign-card.tsx`
- Create: `src/components/shopper/campaign-filters.tsx`
- Create: `src/components/shopper/shopper-discovery-feed.tsx`
- Test: `src/components/shopper/shopper-discovery-feed.test.tsx`

**Interfaces:**
- Consumes: `SeedCampaign`, `SEED_CAMPAIGNS`, `formatINR`, `fundedPercent`, `filterSeedCampaigns` from Task 1; `useAppState` / `CATEGORIES` from `src/context/app-state.tsx`; `EscrowTrustBanner` from Task 3; `Progress`, `Badge` from `src/components/ui`.
- Produces: `CampaignCard({ campaign }: { campaign: SeedCampaign }): ReactElement`; `CampaignFilters({ query, onQueryChange }: { query: string; onQueryChange: (value: string) => void }): ReactElement`; `ShopperDiscoveryFeed(): ReactElement`.

- [ ] **Step 1: Write the failing feed test**

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ShopperDiscoveryFeed } from "@/components/shopper/shopper-discovery-feed";
import { AppStateProvider } from "@/context/app-state";

function renderFeed() {
  return render(
    <AppStateProvider>
      <ShopperDiscoveryFeed />
    </AppStateProvider>,
  );
}

describe("ShopperDiscoveryFeed", () => {
  it("renders all six cards with funding, badges, backers, days and Active Poll", () => {
    renderFeed();
    expect(screen.getAllByRole("link", { name: /view campaign/i })).toHaveLength(6);
    expect(screen.getByText("₹42,500 / ₹50,000")).toBeInTheDocument();
    expect(screen.getByText("85% funded")).toBeInTheDocument();
    expect(screen.getByText("FSSAI Applied")).toBeInTheDocument();
    expect(screen.getByText("312 backers")).toBeInTheDocument();
    expect(screen.getByText("9 days left")).toBeInTheDocument();
    expect(screen.getAllByText("Active Poll")).toHaveLength(6);
  });

  it("filters by the category tabs", async () => {
    const user = userEvent.setup();
    renderFeed();
    await user.click(screen.getByRole("button", { name: "Skincare" }));
    expect(screen.getAllByRole("link", { name: /view campaign/i })).toHaveLength(2);
    expect(screen.queryByText("Ragi & Peri-Peri Protein Crisps")).not.toBeInTheDocument();
  });

  it("searches names, badges and categories case-insensitively, and shows an empty state", async () => {
    const user = userEvent.setup();
    renderFeed();
    const search = screen.getByRole("searchbox", { name: /search campaigns/i });
    await user.type(search, "FSSAI");
    expect(screen.getAllByRole("link", { name: /view campaign/i })).toHaveLength(1);
    await user.clear(search);
    await user.type(search, "zzzz");
    expect(screen.getByText(/no campaigns match/i)).toBeInTheDocument();
    expect(screen.queryAllByRole("link", { name: /view campaign/i })).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/shopper/shopper-discovery-feed.test.tsx`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Implement the three components**

- `CampaignCard`: `Link href={`/campaigns/${campaign.id}`}` with `aria-label={`View campaign: ${campaign.name}`}` wrapping an `article`. Include `Image src={campaign.image} alt={campaign.name} width={1200} height={900} className="h-40 w-full object-cover"` — `.svg` is auto-unoptimized, no config needed. Overlay the category `Badge` and compliance `Badge` on the image. Below: name, batch · founder, summary, `₹current / ₹target` + `% funded` using `formatINR`/`fundedPercent`, `<Progress value={fundedPercent(campaign)} tone="fund" />`, backers with `Users` icon, days left with `Clock3` icon, token price with `formatINR(campaign.tokenPrice)`, and a "Active Poll" tag with `MessageSquare` icon.
- `CampaignFilters`: `role="searchbox"` input with `aria-label="Search campaigns"` and a `nav aria-label="Filter by category"` of four `aria-pressed` buttons from `CATEGORIES`, using global `category`/`setCategory`.
- `ShopperDiscoveryFeed`: `"use client"`, local `query` state, computes `filterSeedCampaigns(SEED_CAMPAIGNS, category, query)`, renders `EscrowTrustBanner`, `SectionHeading`, `CampaignFilters`, a `grid gap-5 sm:grid-cols-2 xl:grid-cols-3`, and an empty state containing "No campaigns match your filters." when the list is empty.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/shopper/shopper-discovery-feed.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/shopper/campaign-card.tsx src/components/shopper/campaign-filters.tsx src/components/shopper/shopper-discovery-feed.tsx src/components/shopper/shopper-discovery-feed.test.tsx
git commit -m "feat: add shopper discovery feed with filters and cards"
```

---

### Task 5: Campaign detail route

**Files:**
- Create: `src/components/shopper/campaign-detail.tsx`
- Create: `src/components/shopper/campaign-detail.test.tsx`
- Create: `src/components/shopper/campaign-not-found.tsx`
- Create: `src/components/shopper/campaign-not-found.test.tsx`
- Create: `src/app/campaigns/[id]/page.tsx`
- Create: `src/app/campaigns/[id]/not-found.tsx`

**Interfaces:**
- Consumes: `SeedCampaign`, `getCampaignById`, `SEED_CAMPAIGNS`, `formatINR`, `fundedPercent`, `pollTotalVotes` from Task 1; `CampaignCard` styling conventions from Task 4.
- Produces: `CampaignDetail({ campaign }: { campaign: SeedCampaign }): ReactElement`; `CampaignNotFound(): ReactElement`; default exports for the two route files. `getCampaignById` and `generateStaticParams` come from Task 1's module.

- [ ] **Step 1: Write the failing tests**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CampaignDetail } from "@/components/shopper/campaign-detail";
import { CampaignNotFound } from "@/components/shopper/campaign-not-found";
import { SEED_CAMPAIGNS } from "@/data/seedCampaigns";

describe("CampaignDetail", () => {
  it("shows the campaign, funding, and interactive-looking poll results", () => {
    render(<CampaignDetail campaign={SEED_CAMPAIGNS[0]} />);
    expect(screen.getByRole("heading", { name: SEED_CAMPAIGNS[0].name })).toBeInTheDocument();
    expect(screen.getByText("85% funded")).toBeInTheDocument();
    expect(screen.getByText("Which flavour should we launch first?")).toBeInTheDocument();
    expect(screen.getByText("Classic Peri-Peri")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to batches/i })).toHaveAttribute("href", "/");
  });
});

describe("CampaignNotFound", () => {
  it("offers a way back", () => {
    render(<CampaignNotFound />);
    expect(screen.getByText(/campaign not found/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to batches/i })).toHaveAttribute("href", "/");
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test -- src/components/shopper/campaign-detail.test.tsx src/components/shopper/campaign-not-found.test.tsx`
Expected: FAIL — cannot find modules.

- [ ] **Step 3: Implement the presentational components and routes**

- `CampaignDetail`: hero with the SVG `Image`, category + compliance badges, name, founder/batch, summary; funding panel with `formatINR`, `% funded`, `<Progress tone="fund" />`; stat row (backers, days left, token price); poll panel listing all three options with `Math.round((votes / Math.max(1, pollTotalVotes(poll))) * 100)` width bars (read-only — no voting persistence); escrow reassurance copy; `Link href="/"` labelled "Back to batches".
- `CampaignNotFound`: message "Campaign not found" and the same "Back to batches" link.
- `src/app/campaigns/[id]/page.tsx`: `export function generateStaticParams()` returning `{ id: campaign.id }` for all seed campaigns. Default export `async function CampaignPage(props: PageProps<'/campaigns/[id]'>) { const { id } = await props.params; const campaign = getCampaignById(id); if (!campaign) notFound(); return <main id="main" ...><CampaignDetail campaign={campaign} /></main>; }` inside `src/app/layout.tsx`'s existing shell. Import `notFound` from `next/navigation`.
- `src/app/campaigns/[id]/not-found.tsx`: default export rendering `<CampaignNotFound />` inside a `main` wrapper.

Note: `PageProps` is a globally generated helper available after `next dev`/`next build`; if the test runner complains, the route files are not imported by the presentational tests, so this will not affect Vitest.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npm test -- src/components/shopper/campaign-detail.test.tsx src/components/shopper/campaign-not-found.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/shopper/campaign-detail.tsx src/components/shopper/campaign-detail.test.tsx src/components/shopper/campaign-not-found.tsx src/components/shopper/campaign-not-found.test.tsx src/app/campaigns
git commit -m "feat: add campaign detail route and not-found state"
```

---

### Task 6: Wire the homepage, simplify the navbar, and verify

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/layout/navbar.tsx`

**Interfaces:**
- Consumes: `ShopperDiscoveryFeed` from Task 4.

- [ ] **Step 1: Switch `/` to the new feed**

Replace `HomeView` with `ShopperDiscoveryFeed` in `src/app/page.tsx`, keeping the existing `<main id="main" className="flex-1">` + `max-w-7xl` container.

- [ ] **Step 2: Simplify the navbar**

Remove the `RoleToggle` and `CategoryPills` imports and their two child blocks from `src/components/layout/navbar.tsx`. Keep the `BatchZero` logo link to `/` and the sticky header. The legacy components and their tests stay untouched.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS — all new tests plus the pre-existing `campaigns`, `app-state`, and `home-view` tests.

- [ ] **Step 4: Lint and build**

Run: `npm run lint && npm run build`
Expected: no lint errors; build succeeds and lists `/` and `/campaigns/[id]` as routes.

- [ ] **Step 5: Smoke-test in a browser**

Run `npm run dev`, visit `/` (confirm six cards, working tabs/search, compact banner) and `/campaigns/ragi-peri-peri-protein-crisps` (confirm detail renders and poll shows). Visit `/campaigns/nope` and confirm the not-found state. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/app/page.tsx src/components/layout/navbar.tsx docs/superpowers
git commit -m "feat: ship shopper discovery feed as homepage"
```

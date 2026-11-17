# Campaign Detail & Validation Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `/campaigns/[id]` with a 60/40 proof/action layout, live escrow funding, an interactive variant poll, and a simulated token pre-book flow that produces a verified comment and a downloadable escrow receipt.

**Architecture:** A static server route resolves the known campaign ID via `generateStaticParams()` and hands typed data to one client island that owns all interactive state. Presentational components in `src/components/campaign/` receive props; pure data and receipt helpers live in `src/lib/` so they are unit-testable. No backend or persistence.

**Tech Stack:** Next.js 16.4.6 (App Router, `cacheComponents: true`), React 19.3, TypeScript, Tailwind v4, lucide-react, Vitest + Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-17-campaign-detail-page-design.md`

## Global Constraints

- Next.js `16.4.6`, React `19.3.0`, `cacheComponents: true`, typed routes enabled.
- Reuse existing tokens `canvas/card/line/ink/muted/brand/brand-soft/fund/fund-soft/alert/alert-soft`; emerald (`fund`) is reserved for escrow/funding.
- Do **not** modify the USD fields on `Campaign` in `src/lib/campaigns.ts`; the detail page uses its own INR data.
- Hero is a CSS illustration only — no image files, no remote image URLs, no new runtime dependencies.
- Simulated payments are repeatable; the poll is one vote per session.
- Keep all user-facing copy in English; rupee amounts use `₹` and Indian grouping (`toLocaleString("en-IN")`).
- Respect `prefers-reduced-motion` (already global in `globals.css`); add visible focus rings and ARIA labels.
- Every task ends with `npm test` passing (plus `npm run lint` in the final task). Commit after each task.

## Review Focus

| Input / condition | Expected behavior | Test that pins it |
| --- | --- | --- |
| Unknown `/campaigns/does-not-exist` | Calls `notFound()` → 404, never a crash or empty page | Task 2: `generateStaticParams`/page test with `notFound` mocked |
| Fashion campaign (`linen-utility-set`) | XS–XXL size selector appears on poll and flows into the modal/receipt; non-fashion hides it | Task 4 size test + Task 6 integration test |
| Payment timing | No amount/backer change before 1.5s; exactly one increment after | Task 5 fake-timer test + Task 6 integration test |
| Poll clicked twice | Only the first vote counts; percentages do not change again | Task 4 double-click test |
| Verified badge | Only paid/seeded paying backers show the green "Verified Backer" badge | Task 3 wall test + Task 6 posted-note test |

---

### Task 1: Detail data model and pure helpers

**Files:**
- Create: `src/lib/campaign-details.ts`
- Test: `src/lib/campaign-details.test.ts`

**Interfaces:**
- Consumes: `Campaign` and `CAMPAIGNS` from `src/lib/campaigns.ts`.
- Produces:
  - `type PollOption = { id: string; label: string; votes: number }`
  - `type CampaignSpec = { label: string; value: string }`
  - `type CoCreatorComment = { id: string; name: string; text: string; time: string; verified: boolean; variant?: string }`
  - `type CampaignDetail = { tokenPriceInr: number; raisedInr: number; targetInr: number; initialBackers: number; earlyBirdSpots: number; story: string[]; specs: CampaignSpec[]; pollQuestion: string; pollOptions: PollOption[]; sizeOptions?: string[]; comments: CoCreatorComment[] }`
  - `const CAMPAIGN_DETAILS: Record<string, CampaignDetail>`
  - `function getCampaignDetail(id: string): CampaignDetail | undefined`
  - `function getPollPercentages(options: PollOption[]): Record<string, number>`

- [ ] **Step 1: Write the failing test** in `src/lib/campaign-details.test.ts`:
  - `CAMPAIGN_DETAILS` has an entry for each of the three `CAMPAIGNS` ids.
  - `getCampaignDetail("miso-oat-bars")` returns its detail; `getCampaignDetail("nope")` is `undefined`.
  - `getPollPercentages([{id:"a",votes:50},{id:"b",votes:30},{id:"c",votes:20}])` returns `{a:50,b:30,c:20}`.
  - `getPollPercentages([])` returns `{}` (no divide-by-zero).
  - The Fashion entry has `sizeOptions` equal to `["XS","S","M","L","XL","XXL"]`; the Food and Skincare entries have no `sizeOptions`.
  - Every seeded comment has `verified: true`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/lib/campaign-details.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/lib/campaign-details.ts`**

Define the types above and `CAMPAIGN_DETAILS` keyed by the three campaign ids. Use these exact values:
  - `miso-oat-bars`: `tokenPriceInr: 1499`, `raisedInr: 638400`, `targetInr: 996000`, `initialBackers: 214`, `earlyBirdSpots: 12`; poll question "Which flavour should we lock for Batch #004?", options Miso Sesame (50), Brown Butter (30), Chili Lime (20); specs about upcycled rice bran, 9g protein, 6-month shelf life, sesame/oats allergens; 3 verified comments.
  - `barrier-repair-cream`: `tokenPriceInr: 2799`, `raisedInr: 1394400`, `targetInr: 1245000`, `initialBackers: 412`, `earlyBirdSpots: 8`; poll question "Which finish should we launch first?", options Fragrance-Free (40), Light Botanical (35), Citrus Fresh (25); specs about 5% ceramide complex, sensitive skin, 50ml, no fragrance; 3 verified comments.
  - `linen-utility-set`: `tokenPriceInr: 7499`, `raisedInr: 321700`, `targetInr: 747000`, `initialBackers: 91`, `earlyBirdSpots: 5`; poll question "Which colourway should we dye first?", options Natural Flax (45), Washed Olive (35), Charcoal (20); `sizeOptions` XS–XXL; specs about 100% European flax, 165 gsm, relaxed unisex fit, cold machine wash; 3 verified comments.
  - Write 1–2 short brand-story paragraphs per campaign.
  - `getPollPercentages` returns `{}` for an empty array; otherwise `Math.round((votes / total) * 100)` keyed by option id.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/lib/campaign-details.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/campaign-details.ts src/lib/campaign-details.test.ts
git commit -m "feat: add campaign detail data and poll helpers"
```

---

### Task 2: Dynamic route page

**Files:**
- Create: `src/app/campaigns/[id]/page.tsx`
- Test: `src/app/campaigns/[id]/page.test.tsx`

**Interfaces:**
- Consumes: `CAMPAIGNS`, `Campaign` from `src/lib/campaigns.ts`; `getCampaignDetail`, `CampaignDetail` from Task 1; `CampaignDetail` component from Task 6 (import is fine before it exists as long as the test file is added in Task 6 — for this task, render a placeholder `<div data-testid="campaign-detail" data-id={campaign.id} />` and replace it in Task 6).
- Produces: `default async function Page(props: PageProps<"/campaigns/[id]">)`, `generateStaticParams()`, `generateMetadata()`.

- [ ] **Step 1: Write the failing test** in `src/app/campaigns/[id]/page.test.tsx`:
  - Mock `next/navigation`'s `notFound` with `vi.fn()`.
  - `generateStaticParams()` returns exactly the three campaign ids.
  - Calling the page with `params: Promise.resolve({ id: "miso-oat-bars" })` returns an element whose rendered output contains the campaign id (render the returned element with Testing Library).
  - Calling with `params: Promise.resolve({ id: "unknown" })` triggers the mocked `notFound`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/app/campaigns/[id]/page.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement the page**

Use `PageProps<"/campaigns/[id]">`, `await props.params`, `CAMPAIGNS.find(...)`, `getCampaignDetail(id)`; call `notFound()` if either is missing. Return `<main id="main" className="flex-1">` with the container classes used by `src/app/page.tsx` and the placeholder element. `generateMetadata()` reads the same params and returns `{ title: `${campaign.name} · BatchZero` }` (fall back to `"Batch not found · BatchZero"`).

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/app/campaigns/[id]/page.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "src/app/campaigns/[id]/page.tsx" "src/app/campaigns/[id]/page.test.tsx"
git commit -m "feat: add /campaigns/[id] route with static params"
```

---

### Task 3: Left-column proof components

**Files:**
- Create: `src/components/campaign/campaign-hero.tsx`
- Create: `src/components/campaign/brand-story.tsx`
- Create: `src/components/campaign/co-creator-wall.tsx`
- Test: `src/components/campaign/left-column.test.tsx`

**Interfaces:**
- Consumes: `Campaign` from `src/lib/campaigns.ts`; `CampaignDetail`, `CoCreatorComment` from Task 1; `Badge`, `CategoryMark`, `SectionHeading` from `src/components/ui/`.
- Produces:
  - `CampaignHero({ campaign, detail }: { campaign: Campaign; detail: CampaignDetail })`
  - `BrandStory({ title, detail }: { title: string; detail: CampaignDetail })`
  - `CoCreatorWall({ comments, canPost, onPost }: { comments: CoCreatorComment[]; canPost: boolean; onPost: (text: string) => void })`

- [ ] **Step 1: Write the failing test** in `src/components/campaign/left-column.test.tsx`:
  - `CampaignHero` renders the campaign name, batch, category, and a `₹` token price in Indian grouping.
  - `BrandStory` renders every story paragraph and every spec label/value from the Food detail.
  - `CoCreatorWall` renders 3 comments; every seeded comment has a visible text "Verified Backer"; each badge has an accessible green-check icon (use `getByText("Verified Backer")` count === 3).
  - `CoCreatorWall` with `canPost={false}` shows no textarea.
  - `CoCreatorWall` with `canPost` shows a textarea labelled "Add your note" and a "Post to wall" button; typing and clicking calls `onPost` with the exact text.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/campaign/left-column.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the three components**

  - `CampaignHero`: large `aspect-[4/3]` rounded panel with a category-tinted `bg-gradient-to-br`, two decorative concentric ring divs, a large `CategoryMark size="lg"`, top badges (`Badge` for category and "Batch {campaign.batch}"), and a price chip showing `₹{detail.tokenPriceInr.toLocaleString("en-IN")} token`. No `<img>`.
  - `BrandStory`: `SectionHeading` eyebrow "The Story", `title={title}`, then paragraphs and a 2-column specs grid with hairline dividers.
  - `CoCreatorWall`: `SectionHeading` "Verified Co-Creator Wall"; comment cards with avatar initials, name, relative time, comment text, chosen variant when present, and a green `Badge variant="fund"` containing `ShieldCheck` + "Verified Backer" when `comment.verified`. When `canPost`, render a labelled textarea and "Post to wall" button that calls `onPost(text.trim())` and clears the input (ignore empty submissions).

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/campaign/left-column.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/campaign/campaign-hero.tsx src/components/campaign/brand-story.tsx src/components/campaign/co-creator-wall.tsx src/components/campaign/left-column.test.tsx
git commit -m "feat: add campaign hero, story and verified backer wall"
```

---

### Task 4: Escrow funding card and variant poll

**Files:**
- Create: `src/components/campaign/funding-card.tsx`
- Create: `src/components/campaign/variant-poll.tsx`
- Test: `src/components/campaign/action-panels.test.tsx`

**Interfaces:**
- Consumes: `PollOption`, `CampaignDetail` from Task 1; `Progress`, `Badge` from `src/components/ui/`; `ShieldCheck`, `Users`, `Flame` from `lucide-react`.
- Produces:
  - `FundingCard({ raisedInr, targetInr, backers, earlyBirdSpots, label }: { raisedInr: number; targetInr: number; backers: number; earlyBirdSpots: number; label: string })`
  - `VariantPoll({ question, options, selectedId, votedOptionId, onSelect, sizeOptions, selectedSize, onSelectSize }: { question: string; options: PollOption[]; selectedId: string; votedOptionId: string | null; onSelect: (id: string) => void; sizeOptions?: string[]; selectedSize?: string; onSelectSize?: (size: string) => void })`

- [ ] **Step 1: Write the failing test** in `src/components/campaign/action-panels.test.tsx`:
  - `FundingCard` renders `₹6,38,400` and `₹9,96,000`, a `progressbar` with `aria-valuenow=64`, "214 backers", "Early-Bird Spots Left", "12", and "100% Escrow Protected".
  - `VariantPoll` renders the question and all option labels with percentages `50%`, `30%`, `20%`.
  - Clicking option `b` calls `onSelect("b")`; after re-render with `votedOptionId="b"` and incremented votes, its percentage updates and repeated clicks do not call `onSelect` again.
  - With `sizeOptions` present, buttons XS through XXL render and clicking "XL" calls `onSelectSize("XL")`; without `sizeOptions`, no size buttons render.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/campaign/action-panels.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement the two components**

  - `FundingCard`: use the existing `Progress` with `tone="fund"` and `value={(raisedInr / targetInr) * 100}`. Mount-animate the displayed raised amount from 0 to `raisedInr` with `requestAnimationFrame`/`useEffect` over ~600ms and render `₹{Math.round(display).toLocaleString("en-IN")}`; always render the final value when `prefers-reduced-motion` is set (check `window.matchMedia`). Show an emerald-shaded info box with `ShieldCheck` and the exact copy "100% Escrow Protected — funds are locked until the batch clears its goal."
  - `VariantPoll`: each option is a button with `aria-pressed={selectedId === option.id}` and `disabled={votedOptionId !== null}`; below each, a thin bar width set from `getPollPercentages(options)[option.id]` and the percentage text. When `sizeOptions` exists, render a labelled size row of buttons with `aria-pressed` for the selected size.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/campaign/action-panels.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/campaign/funding-card.tsx src/components/campaign/variant-poll.tsx src/components/campaign/action-panels.test.tsx
git commit -m "feat: add live funding card and variant poll"
```

---

### Task 5: Receipt utilities and pre-book modal

**Files:**
- Create: `src/lib/receipt.ts`
- Create: `src/components/campaign/prebook-modal.tsx`
- Test: `src/components/campaign/prebook-modal.test.tsx`

**Interfaces:**
- Consumes: `Campaign` from `src/lib/campaigns.ts`; `CampaignDetail`, `PollOption` from Task 1; `getPollPercentages` from Task 1 (not needed here); `Progress` from UI.
- Produces:
  - `type PaymentMethod = "UPI" | "Card"`
  - `type PaymentConfirmation = { backerName: string; email: string; variantId: string; size?: string; paymentMethod: PaymentMethod }`
  - `type EscrowReceipt = { id: string; campaignName: string; batch: string; backerName: string; email: string; variantLabel: string; size?: string; amountInr: number; paymentMethod: PaymentMethod; issuedAt: string }`
  - `function createReceipt(input: Omit<EscrowReceipt, "id" | "issuedAt"> & { id?: string; issuedAt?: string }): EscrowReceipt`
  - `function formatReceiptText(receipt: EscrowReceipt): string`
  - `function downloadReceipt(receipt: EscrowReceipt): void`
  - `PrebookModal({ open, onClose, campaign, detail, selectedVariantId, selectedSize, onConfirm }: { open: boolean; onClose: () => void; campaign: Campaign; detail: CampaignDetail; selectedVariantId: string; selectedSize?: string; onConfirm: (confirmation: PaymentConfirmation) => void })`

- [ ] **Step 1: Write the failing test** in `src/components/campaign/prebook-modal.test.tsx`:
  - `createReceipt` produces an id matching `/^BZ-[A-Z0-9]{8}$/` and sets `issuedAt` to a valid ISO string when omitted; `formatReceiptText` contains "ESCROW RECEIPT", the backer name, `₹1,499`, and "safely locked".
  - `downloadReceipt` creates a Blob and clicks an anchor with a `.txt` download filename (mock `URL.createObjectURL` and `HTMLAnchorElement.prototype.click`).
  - The modal returns `null` when `open={false}`.
  - With `open`, it renders fields labelled "Backer Name", "Email", "Selected Variant", UPI and Card tabs, and a button named "Pay Token (Simulated Test Mode)".
  - The Fashion detail renders the "Size" field with the selected size; the Food detail does not.
  - Typing name/email, choosing the Card tab, clicking pay, and advancing fake timers by 1499ms does **not** call `onConfirm`; advancing to 1500ms calls it once with `{ backerName, email, variantId, size, paymentMethod: "Card" }` and shows the receipt with a "Download Receipt" button and a "Done" button that calls `onClose`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/campaign/prebook-modal.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement receipt helpers and the modal**

  - `src/lib/receipt.ts`: `createReceipt` generates `BZ-` + 8 uppercase alphanumeric chars (accept an injected `id` for deterministic tests) and `issuedAt = new Date().toISOString()` when omitted. `formatReceiptText` builds a plain-text block with the exact wording "ESCROW RECEIPT" and "funds are safely locked" plus every receipt field; rupee amounts via `toLocaleString("en-IN")`. `downloadReceipt` uses `new Blob([formatReceiptText(receipt)], { type: "text/plain;charset=utf-8" })`, creates an object URL, appends a temporary `<a download={`${receipt.id}.txt`}>`, clicks it, then revokes the URL.
  - `prebook-modal.tsx`: `"use client"`; `role="dialog"` with `aria-modal="true"` and `aria-labelledby`; Close button and Escape/backdrop call `onClose`. Native `<form onSubmit>` with required name/email (email `type="email"`), a read-only/settable variant `<select>` defaulting to `selectedVariantId`, an optional size `<select>` only when `detail.sizeOptions` exists (default `selectedSize`), and role=tab UPI/Card buttons with `aria-selected`. UPI tab shows a VPA input; Card tab shows card number/expiry/CVV inputs (simulated, no validation beyond `required`). Payment button shows a spinner + "Processing…" and is disabled while processing. Use `setTimeout(..., 1500)`; clear on unmount. After the delay, build the receipt via `createReceipt` (using the resolved variant label and amount `detail.tokenPriceInr`), call `onConfirm(confirmation)`, and render the receipt on-screen with a "Download Receipt" button wired to `downloadReceipt`.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/campaign/prebook-modal.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/receipt.ts src/components/campaign/prebook-modal.tsx src/components/campaign/prebook-modal.test.tsx
git commit -m "feat: add simulated escrow checkout and receipt"
```

---

### Task 6: Assemble the client island and wire the home cards

**Files:**
- Create: `src/components/campaign/campaign-detail.tsx`
- Modify: `src/app/campaigns/[id]/page.tsx` (replace the placeholder from Task 2 with the real component)
- Modify: `src/app/campaigns/[id]/page.test.tsx` (assert the real component receives the campaign)
- Modify: `src/components/home/shopper-view.tsx` (turn "Join the batch" into a link; add "View batch details")
- Test: `src/components/campaign/campaign-detail.test.tsx`

**Interfaces:**
- Consumes: all components from Tasks 3–5; `Campaign` from `src/lib/campaigns.ts`; `CampaignDetail` data type from Task 1.
- Produces: `CampaignDetail` component (client) with props `{ campaign: Campaign; detail: CampaignDetailData }` — import the data type aliased as `CampaignDetailData` to avoid a name clash with the component.

- [ ] **Step 1: Write the failing test** in `src/components/campaign/campaign-detail.test.tsx`:
  - With the Food campaign/detail, the page renders hero, funding card (`₹6,38,400`), poll, wall, and the CTA named `/Pre-Book Batch #004 • ₹1,499 Token/`.
  - Clicking the CTA opens the modal; with fake timers, fill name/email and pay, advance 1500ms: the funding card shows `₹6,39,899` and "215 backers", and "Early-Bird Spots Left" shows `11`.
  - After payment, click "Done" to close the receipt; the wall exposes "Add your note", and posting "Worth the wait!" adds a comment with a "Verified Backer" badge next to the backer's name.
  - With the Fashion campaign, XS–XXL appear; select "XL", pay, and the receipt shows size `XL`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/components/campaign/campaign-detail.test.tsx`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `src/components/campaign/campaign-detail.tsx` and wire everything**

  - `"use client"`; local state: `raised = detail.raisedInr`, `backers = detail.initialBackers`, `spots = detail.earlyBirdSpots`, `votes: Record<string, number>` seeded from `pollOptions`, `votedOptionId: string | null`, `selectedVariantId = pollOptions[0].id`, `selectedSize = detail.sizeOptions?.[2]`, `modalOpen`, `hasPaid`, `comments = detail.comments`.
  - Layout: outer `<div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">`; left column stacks hero, story (`<BrandStory title={campaign.name} detail={detail} />`), wall; right column is `lg:sticky lg:top-28 lg:self-start` and stacks funding card, poll, and a full-width brand CTA button labelled `Pre-Book Batch {campaign.batch} • ₹{tokenPriceInr} Token` that sets `modalOpen=true`.
  - `handleSelect(id)`: if `votedOptionId !== null` return; set votes `+1`, set `votedOptionId`, and set `selectedVariantId` to the voted option so the modal reflects the poll choice.
  - `onConfirm`: `raised += tokenPriceInr`, `backers += 1`, `spots = Math.max(0, spots - 1)`, `hasPaid = true`. The modal stays open showing the receipt; clicking its "Done" button calls `onClose`, and the wall unlocks via `hasPaid`.
  - `onPost(text)`: append `{ id: `local-${Date.now()}`, name: lastBackerName, text, time: "just now", verified: true, variant: resolved variant label }`.
  - Replace the placeholder in the page with `<CampaignDetail campaign={campaign} detail={detail} />`.
  - In `shopper-view.tsx`, wrap the card in a `Link` to `/campaigns/${campaign.id}` (cast the href to the generated `Route` type if TypeScript requires it), relabel the button "Join the batch" → keep as-is inside the link, and add a small "View batch details" link in the card footer.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/components/campaign/campaign-detail.test.tsx "src/app/campaigns/[id]/page.test.tsx"`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/campaign/campaign-detail.tsx src/components/campaign/campaign-detail.test.tsx "src/app/campaigns/[id]/page.tsx" "src/app/campaigns/[id]/page.test.tsx" src/components/home/shopper-view.tsx
git commit -m "feat: assemble campaign detail page and link home cards"
```

---

### Task 7: Full verification and documentation

**Files:**
- Modify: `README.md` (mention the new route and its features)
- No new source files.

**Interfaces:**
- Consumes: all prior tasks.

- [ ] **Step 1: Run the whole test suite**

Run: `npm test`
Expected: PASS with all suites green.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: no errors or warnings.

- [ ] **Step 3: Run a production build**

Run: `npm run build`
Expected: successful build; the output lists `/campaigns/[id]` with the three known ids prerendered.

- [ ] **Step 4: Update README**

Add a short "Campaign detail page" section describing the route, the 60/40 layout, the poll, the simulated escrow checkout, and that all payments/receipts are test-mode only.

- [ ] **Step 5: Commit**

```bash
git add README.md
git commit -m "docs: document campaign detail page"
```

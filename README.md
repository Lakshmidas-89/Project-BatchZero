# BatchZero

**Validate Before You Manufacture.**

BatchZero is a demand-first pre-order platform for small-batch makers. Founders launch a batch, shoppers pledge into escrow, and production unlocks only when the batch clears its minimum. This repository is the initial UI shell and design system for the product.

Built by **Team Nexvoid**.

## What's in this build

- Persistent top navbar with the BatchZero logo, BETA pill, tagline, category pills, and a one-click Shopper/Founder role toggle.
- Shopper view with a hero, featured batch, trust stats, live batch cards, funding progress, deadlines, and escrow messaging. Batch cards link through to the full campaign detail page.
- Campaign detail pages at `/campaigns/[id]` with a 60/40 proof/action layout, a variant poll, a verified co-creator wall, and a simulated token pre-book checkout.
- Founder view with a batch control room covering escrow totals, backers, deadlines, and refund/goal-reached states.
- Shared escrow explainer and a footer crediting Team Nexvoid.
- Mobile-first responsive layout verified at 1440px, 390px, and 360px with no horizontal overflow.

Role and category are held in a global React context, so switching views or filtering batches is instant and requires no login.

## Campaign detail page

Each shopper card opens `/campaigns/[id]` (for example `/campaigns/miso-oat-bars`). The page is a server route that prerenders all three known batches and hands its data to one client island:

- **Left 60%** — a CSS product illustration, the brand story and specs, and a co-creator wall where paying backers carry a green "Verified Backer" badge.
- **Right 40%** — a sticky escrow card with a live raised/target figure and animated emerald bar, a one-vote-per-session variant poll (plus XS–XXL sizes for fashion), and the `Pre-Book Batch #1 • ₹[token] Token` CTA.

The CTA opens a checkout modal with backer details, a UPI/Card tab choice, and a 1.5-second simulated payment. On success the escrow total, backer count, and early-bird spots update in place, the wall unlocks for a verified note, and a downloadable escrow receipt appears. **All payments and receipts are simulated test mode — no money moves and no real payment is processed.**

## Design tokens

| Token | Value | Use |
| --- | --- | --- |
| Canvas | `#F8FAFC` | Page background |
| Card | `#FFFFFF` | Cards and surfaces |
| Border | `#E2E8F0` | Hairlines and dividers |
| Deep Indigo | `#4F46E5` | Primary CTAs and brand accents |
| Emerald | `#059669` | Escrow and funding progress |
| Coral | `#E11D48` | Deadlines and refund states |

Tokens live in `src/app/globals.css` and are exposed as Tailwind v4 theme colors (`bg-canvas`, `bg-card`, `border-line`, `bg-brand`, `bg-fund`, `bg-alert`).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |

## Tech stack

- Next.js 16 (App Router, Turbopack)
- React 19 + TypeScript
- Tailwind CSS v4
- Lucide React icons
- Vitest + Testing Library

## Project structure

```text
src/
├── app/
│   ├── globals.css        # Design tokens and base styles
│   ├── icon.svg           # BatchZero app icon
│   ├── campaigns/[id]/    # Detail route with static params and metadata
│   ├── layout.tsx         # Metadata, providers, navbar, footer
│   └── page.tsx           # Home route
├── components/
│   ├── app/               # Role toggle and category pills
│   ├── campaign/          # Hero, story, wall, funding, poll, checkout modal
│   ├── home/              # Shopper, founder, hero, escrow sections
│   ├── layout/            # Navbar and footer
│   └── ui/                # Badge, progress, stat, heading, category mark
├── context/
│   └── app-state.tsx      # Global role + category state
└── lib/
    ├── campaign-details.ts # INR detail data and poll helpers
    ├── campaigns.ts       # Mock batch data and filtering
    ├── cn.ts              # Class name helper
    └── receipt.ts         # Simulated escrow receipt helpers
```

## Tests

The role toggle, category filtering, shopper/founder view swaps, campaign detail route, live funding card, variant poll, verified wall, simulated checkout, receipt helpers, and home-card links are covered by Vitest and Testing Library.

```bash
npm test
```

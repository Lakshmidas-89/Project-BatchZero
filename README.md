# BatchZero

**Validate Before You Manufacture.**

BatchZero is a demand-first pre-order platform for small-batch makers. Founders launch a batch, shoppers pledge into escrow, and production unlocks only when the batch clears its minimum. This repository is the initial UI shell and design system for the product.

Built by **Team Nexvoid**.

## What's in this build

- Persistent top navbar with the BatchZero logo, BETA pill, tagline, category pills, and a one-click Shopper/Founder role toggle.
- Shopper view with a hero, featured batch, trust stats, live batch cards, funding progress, deadlines, and escrow messaging.
- Founder view with a batch control room covering escrow totals, backers, deadlines, and refund/goal-reached states.
- Shared escrow explainer and a footer crediting Team Nexvoid.
- Mobile-first responsive layout verified at 1440px, 390px, and 360px with no horizontal overflow.

Role and category are held in a global React context, so switching views or filtering batches is instant and requires no login.

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
│   ├── layout.tsx         # Metadata, providers, navbar, footer
│   └── page.tsx           # Home route
├── components/
│   ├── app/               # Role toggle and category pills
│   ├── home/              # Shopper, founder, hero, escrow sections
│   ├── layout/            # Navbar and footer
│   └── ui/                # Badge, progress, stat, heading, category mark
├── context/
│   └── app-state.tsx      # Global role + category state
└── lib/
    ├── campaigns.ts       # Mock batch data and filtering
    └── cn.ts              # Class name helper
```

## Tests

The role toggle, category filtering, campaign filtering, and shopper/founder view swaps are covered by Vitest and Testing Library.

```bash
npm test
```

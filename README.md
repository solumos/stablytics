# Stablytics — The Stablecoin Market Map

A living market map and directory of every company building the stablecoin
economy: issuers, chains, infrastructure, payments, on/off-ramps, wallets,
custody, DeFi, RWA, oracles, and compliance.

- **Landscape** (`/`) — the whole landscape on one board, grouped into 5 themes
  and 18 categories, tiled as company logos.
- **Directory** (`/companies`) — search and filter every company.
- **Profiles** (`/companies/[slug]`) — a page per company (statically generated).

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS v4 · shadcn / base-ui.
Deployed on Vercel.

## Data

`src/data/companies.json` is the source of truth — one entry per company; edit it
directly to add or correct companies (fields are in `src/data/types.ts`).

- `src/data/taxonomy.ts` — the 5 groups + 18 categories (keys, labels, colors).
- `src/data/companies.ts` — loaders + the `FEATURED` list that controls which
  logos lead each category on the landscape.
- `public/company-logos/` — prefetched logos, with a runtime fallback in
  `src/components/company-logo.tsx` (DuckDuckGo icon → favicon → monogram).

## Develop

```bash
npm run dev     # http://localhost:3000
npm run build   # production build
```

## Releasing & deploying

Production is the `main` branch, deployed automatically by Vercel; tag releases
with SemVer. See **[RELEASING.md](./RELEASING.md)**.

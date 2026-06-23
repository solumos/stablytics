// Single source of truth for how the market map is organized.
// GROUPS are the broad bands of the landscape; CATEGORIES are the columns within them.

export interface Group {
  key: string;
  label: string;
  description: string;
  /** Accent color (hex) used across the landscape + category pages */
  accent: string;
}

export interface Category {
  key: string;
  label: string;
  blurb: string;
  /** Parent group key */
  group: string;
}

export const GROUPS: Group[] = [
  {
    key: "issuance",
    label: "Stablecoins & Issuers",
    description: "The dollars themselves — who mints them and how they hold the peg.",
    accent: "#10b981", // emerald
  },
  {
    key: "infrastructure",
    label: "Infrastructure",
    description: "The chains, issuance rails, bridges and oracles that move and secure stablecoins.",
    accent: "#0ea5e9", // sky
  },
  {
    key: "distribution",
    label: "Distribution & Access",
    description: "How stablecoins reach businesses and people — payments, ramps, wallets, cards.",
    accent: "#8b5cf6", // violet
  },
  {
    key: "defi",
    label: "DeFi & Yield",
    description: "Where stablecoins earn, lend, and connect to real-world assets.",
    accent: "#f59e0b", // amber
  },
  {
    key: "trust",
    label: "Trust & Compliance",
    description: "Custody, analytics and the banks standing behind the reserves.",
    accent: "#f43f5e", // rose
  },
];

export const CATEGORIES: Category[] = [
  // Issuance
  { key: "issuers-fiat", label: "Fiat-Backed Issuers", blurb: "Reserve-backed fiat stablecoins", group: "issuance" },
  { key: "issuers-decentralized", label: "Decentralized Stablecoins", blurb: "Crypto-backed & algorithmic", group: "issuance" },
  { key: "issuers-yield", label: "Yield-Bearing Dollars", blurb: "Synthetic & yield-bearing", group: "issuance" },
  // Infrastructure
  { key: "chains", label: "Stablecoin Chains", blurb: "Networks built for settlement", group: "infrastructure" },
  { key: "infra-orchestration", label: "Issuance & Orchestration", blurb: "Stablecoin-as-a-service & money movement", group: "infrastructure" },
  { key: "bridges", label: "Bridges & Interop", blurb: "Cross-chain transfer & messaging", group: "infrastructure" },
  { key: "oracles", label: "Oracles & Data", blurb: "Price feeds & on-chain data", group: "infrastructure" },
  // Distribution
  { key: "payments-psp", label: "Payments & PSPs", blurb: "Processors on stablecoin rails", group: "distribution" },
  { key: "onofframp", label: "On / Off-Ramps", blurb: "Fiat ⇄ crypto conversion", group: "distribution" },
  { key: "wallets", label: "Wallets", blurb: "Consumer & embedded wallets", group: "distribution" },
  { key: "cards", label: "Cards & Spending", blurb: "Stablecoin-linked cards", group: "distribution" },
  { key: "crossborder", label: "Cross-Border & Remittances", blurb: "Global B2B & consumer payments", group: "distribution" },
  { key: "exchanges", label: "Exchanges", blurb: "Major venues & liquidity", group: "distribution" },
  // DeFi & Yield
  { key: "defi", label: "DeFi: Lending & Yield", blurb: "Lending, DEXs & yield", group: "defi" },
  { key: "rwa", label: "RWA & Tokenization", blurb: "Tokenized treasuries & assets", group: "defi" },
  // Trust & Compliance
  { key: "custody", label: "Custody & Security", blurb: "Institutional custody & keys", group: "trust" },
  { key: "compliance", label: "Compliance & Analytics", blurb: "AML, screening & risk", group: "trust" },
  { key: "banking-reserves", label: "Banking & Reserves", blurb: "Banks & asset managers", group: "trust" },
];

export const CATEGORY_MAP: Record<string, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c])
);

export const GROUP_MAP: Record<string, Group> = Object.fromEntries(
  GROUPS.map((g) => [g.key, g])
);

export function categoriesForGroup(groupKey: string): Category[] {
  return CATEGORIES.filter((c) => c.group === groupKey);
}

export function groupForCategory(catKey: string): Group | undefined {
  const c = CATEGORY_MAP[catKey];
  return c ? GROUP_MAP[c.group] : undefined;
}

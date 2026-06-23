import rawData from "./companies.json";
import type { Company } from "./types";
import { CATEGORY_MAP } from "./taxonomy";

export const companies: Company[] = (rawData as Company[])
  .slice()
  .sort((a, b) => a.name.localeCompare(b.name));

const BY_SLUG = new Map(companies.map((c) => [c.slug, c]));

export const totalCompanies = companies.length;

export function getCompany(slug: string): Company | undefined {
  return BY_SLUG.get(slug);
}

/** Only the category keys that exist in the taxonomy (defensive against data drift). */
export function validCategories(c: Company): string[] {
  return (c.categories || []).filter((k) => CATEGORY_MAP[k]);
}

export function companiesByCategory(key: string): Company[] {
  return companies.filter((c) => c.categories?.includes(key));
}

export function countByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of companies) {
    for (const k of c.categories || []) {
      counts[k] = (counts[k] || 0) + 1;
    }
  }
  return counts;
}

// --- Prominence ranking (for the landscape map ordering + capping) ---
// Hand-curated set of widely-recognized companies that should lead their
// category, ordered roughly by global prominence. Everything else falls back
// to a data-driven heuristic (public/funding/breadth/age).
const FEATURED: string[] = [
  "tether", "circle", "coinbase", "binance", "stripe", "paypal", "visa", "mastercard", "blackrock", "ripple", "paxos",
  "sky", "ethena", "tron", "ethereum", "solana", "base", "plasma", "tempo",
  "robinhood", "revolut", "block", "nubank", "adyen", "checkout.com", "worldpay", "nuvei",
  "kraken", "okx", "bybit", "crypto.com", "gemini", "bitstamp",
  "moonpay", "ramp network", "transak", "banxa",
  "metamask", "phantom", "trust wallet", "rabby wallet", "safe", "privy", "turnkey", "dynamic", "crossmint",
  "fireblocks", "anchorage digital", "bitgo", "copper", "bny mellon", "customers bank", "cross river bank", "sygnum bank",
  "rain", "reap", "immersve", "baanx",
  "bvnk", "conduit", "bitso business", "felix pago", "mural pay", "yellow card",
  "aave", "curve finance", "uniswap", "morpho", "maple finance", "pendle", "ondo finance", "usual", "frax finance",
  "securitize", "superstate", "hashnote", "franklin templeton",
  "layerzero", "wormhole", "axelar", "chainlink", "pyth network", "redstone",
  "chainalysis", "elliptic", "trm labs",
  "first digital", "agora", "m0", "brale", "perena", "noble",
  "hyperliquid", "arbitrum", "optimism", "polygon", "avalanche", "sui", "aptos", "stellar", "celo", "near protocol",
];
const FEATURED_INDEX = new Map(FEATURED.map((n, i) => [n, i]));

function prominence(c: Company): number {
  const fi = FEATURED_INDEX.get(c.name.toLowerCase());
  if (fi !== undefined) return 10000 - fi;
  let s = 0;
  const f = `${c.funding || ""} ${c.stage || ""}`.toLowerCase();
  if (/public|ipo|nyse|nasdaq|listed/.test(f)) s += 6;
  if (/\$\s?\d+(\.\d+)?\s?b/.test(f)) s += 5;
  else if (/\$\s?[1-9]\d{2}\s?m/.test(f)) s += 3;
  else if (/\$\s?\d+\s?m/.test(f)) s += 1;
  s += Math.min((c.categories || []).length, 4);
  s += Math.min((c.keyProducts || []).length, 4) * 0.5;
  s += Math.min((c.stablecoins || []).length, 5) * 0.4;
  s += Math.min((c.chains || []).length, 6) * 0.25;
  const yr = parseInt(c.founded || "");
  if (yr && yr <= 2017) s += 1.5;
  else if (yr && yr <= 2020) s += 0.5;
  return s;
}

/** Companies in a category, most prominent first (for the landscape map). */
export function topByCategory(key: string, limit?: number): Company[] {
  const list = companiesByCategory(key)
    .slice()
    .sort((a, b) => prominence(b) - prominence(a) || a.name.localeCompare(b.name));
  return limit ? list.slice(0, limit) : list;
}

export function searchCompanies(q: string): Company[] {
  const term = q.trim().toLowerCase();
  if (!term) return companies;
  return companies.filter(
    (c) =>
      c.name.toLowerCase().includes(term) ||
      c.tagline?.toLowerCase().includes(term) ||
      c.description?.toLowerCase().includes(term) ||
      c.hq?.toLowerCase().includes(term) ||
      c.stablecoins?.some((s) => s.toLowerCase().includes(term)) ||
      c.keyProducts?.some((p) => p.toLowerCase().includes(term))
  );
}

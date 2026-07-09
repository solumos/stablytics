// Client-side dataset for the directory: the slim field subset only
// (see scripts/gen-slim-companies.mjs). The full companies.json stays
// server-only — import "@/data/companies" for server code.
import rawData from "./companies.slim.json";
import type { CompanySummary } from "./types";

export const companies: CompanySummary[] = (rawData as CompanySummary[])
  .slice()
  // Locale pinned: this sort also runs at build time, and the prerendered
  // grid order must match the client's or hydration falls back to a full
  // client re-render in locales with different collation (da, cs, tr, …).
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

export function searchCompanies(q: string): CompanySummary[] {
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

export function countByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const c of companies) {
    for (const k of c.categories || []) {
      counts[k] = (counts[k] || 0) + 1;
    }
  }
  return counts;
}

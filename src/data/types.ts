export interface Company {
  /** Display name, e.g. "Circle" */
  name: string;
  /** URL-safe identifier, e.g. "circle" */
  slug: string;
  /** Taxonomy category keys this company belongs to (see taxonomy.ts) */
  categories: string[];
  /** Short positioning line, <= ~10 words */
  tagline: string;
  /** 2-3 sentence description */
  description: string;
  /** Primary website (https URL) */
  website: string;
  /** Twitter/X handle or URL */
  twitter?: string;
  /** Headquarters, "City, Country" */
  hq?: string;
  /** Founding year as a string, e.g. "2013" */
  founded?: string;
  /** Funding/maturity stage, e.g. "Series B", "Public", "Acquired" */
  stage?: string;
  /** Funding summary, e.g. "$200M raised" */
  funding?: string;
  /** Notable products */
  keyProducts?: string[];
  /** Stablecoins issued or natively supported (tickers/names) */
  stablecoins?: string[];
  /** Associated chains */
  chains?: string[];
  /** Bare primary domain for logo lookup, e.g. "circle.com" */
  logoDomain?: string;
  /** Explicit local logo path override (e.g. "/issuers/circle.png") */
  logo?: string;
  /** One sharp fact on why the company matters */
  notable?: string;
  /** "active" | "acquired" | "defunct" */
  status?: string;
}

/**
 * The subset of Company shipped to the client for the directory
 * (cards + search). Must stay in sync with SLIM_FIELDS in
 * scripts/gen-slim-companies.mjs: using a field here that isn't in
 * SLIM_FIELDS typechecks but renders undefined, so change both together.
 */
export type CompanySummary = Pick<
  Company,
  | "name"
  | "slug"
  | "categories"
  | "tagline"
  | "description"
  | "logo"
  | "hq"
  | "stablecoins"
  | "keyProducts"
>;

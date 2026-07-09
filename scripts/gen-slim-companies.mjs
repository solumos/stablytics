// Generates src/data/companies.slim.json — the client-side dataset for the
// directory (cards + search). Keeping the full companies.json out of the
// client bundle saves ~365KB raw / ~60KB gz on /companies.
// Runs automatically via the predev/prebuild npm scripts.
// SLIM_FIELDS must stay in sync with CompanySummary in src/data/types.ts.
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const SLIM_FIELDS = [
  "name",
  "slug",
  "categories",
  "tagline",
  "description",
  "logo",
  "hq",
  "stablecoins",
  "keyProducts",
];

const companies = JSON.parse(
  readFileSync(join(root, "src/data/companies.json"), "utf8")
);

const slim = companies.map((c) =>
  Object.fromEntries(SLIM_FIELDS.filter((f) => f in c).map((f) => [f, c[f]]))
);

const out = join(root, "src/data/companies.slim.json");
writeFileSync(out, JSON.stringify(slim) + "\n");
console.log(`gen-slim-companies: wrote ${slim.length} companies to ${out}`);

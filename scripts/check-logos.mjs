// Asserts every `logo` path in companies.json resolves to a file under
// public/. CompanyLogo has no runtime fallback for broken local paths
// (a missing `logo` field renders a monogram) — this check is what keeps
// broken image tiles out of production. Runs via the prebuild npm script.
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const companies = JSON.parse(
  readFileSync(join(root, "src/data/companies.json"), "utf8")
);

const broken = companies.filter(
  (c) => c.logo && !existsSync(join(root, "public", c.logo))
);

if (broken.length > 0) {
  console.error("check-logos: broken logo paths in companies.json:");
  for (const c of broken) console.error(`  ${c.slug}: ${c.logo}`);
  process.exit(1);
}
console.log(`check-logos: all ${companies.filter((c) => c.logo).length} logo paths resolve`);

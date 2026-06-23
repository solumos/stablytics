import { GROUPS, categoriesForGroup } from "@/data/taxonomy";
import { companiesByCategory, topByCategory, totalCompanies } from "@/data/companies";
import { CATEGORIES } from "@/data/taxonomy";
import { CompanyLogo } from "./company-logo";

// Readable text color (dark on light accents like amber, white otherwise).
function readableOn(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return L > 0.6 ? "#1c1407" : "#ffffff";
}

function LogoTile({
  slug,
  name,
  logo,
  domain,
}: {
  slug: string;
  name: string;
  logo?: string;
  domain?: string;
}) {
  return (
    <a
      href={`/companies/${slug}`}
      title={name}
      className="flex h-5 w-5 items-center justify-center rounded-[3px] bg-white p-[1.5px] ring-1 ring-black/5 transition hover:z-10 hover:scale-125 hover:ring-2 hover:ring-[var(--accent)]"
    >
      <CompanyLogo name={name} src={logo} domain={domain} className="h-full w-full bg-transparent" />
    </a>
  );
}

function CategoryBox({
  catKey,
  label,
  accent,
  headerText,
}: {
  catKey: string;
  label: string;
  accent: string;
  headerText: string;
}) {
  const all = topByCategory(catKey); // every company, prominence-ordered
  return (
    <div className="overflow-hidden rounded-md border border-border/50 bg-card/20">
      <div
        className="flex items-center justify-between gap-1.5 px-1.5 py-[3px]"
        style={{ backgroundColor: accent }}
      >
        <a
          href={`/companies?category=${catKey}`}
          className="truncate text-[0.62rem] font-bold leading-tight hover:underline"
          style={{ color: headerText }}
        >
          {label}
        </a>
        <span
          className="text-[0.55rem] font-semibold tabular-nums"
          style={{ color: headerText, opacity: 0.85 }}
        >
          {all.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-[3px] p-1">
        {all.map((c) => (
          <LogoTile key={c.slug} slug={c.slug} name={c.name} logo={c.logo} domain={c.logoDomain} />
        ))}
      </div>
    </div>
  );
}

export function MarketMap() {
  return (
    <div className="mx-auto max-w-[120rem] px-3 py-4 sm:px-4">
      {/* Compact poster header */}
      <div className="mb-3 flex flex-col gap-1 border-b border-border/40 pb-2.5 sm:flex-row sm:items-baseline sm:justify-between">
        <h1 className="text-lg font-bold tracking-tight sm:text-xl">
          The Stablecoin Market Map
        </h1>
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{totalCompanies}</span> companies ·{" "}
          {CATEGORIES.length} categories ·{" "}
          <a href="/companies" className="text-emerald-400 hover:underline">
            search the directory →
          </a>
        </p>
      </div>

      {/* Five groups as parallel columns so the whole landscape fits one board */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {GROUPS.map((group) => {
          const cats = categoriesForGroup(group.key);
          const headerText = readableOn(group.accent);
          const groupTotal = new Set(
            cats.flatMap((c) => companiesByCategory(c.key).map((co) => co.slug))
          ).size;
          return (
            <section
              key={group.key}
              className="flex flex-col gap-2"
              style={{ ["--accent" as string]: group.accent }}
            >
              <div
                className="rounded-md px-2 py-1"
                style={{ backgroundColor: group.accent }}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-xs font-bold tracking-tight" style={{ color: headerText }}>
                    {group.label}
                  </h2>
                  <span
                    className="text-[0.6rem] font-semibold"
                    style={{ color: headerText, opacity: 0.85 }}
                  >
                    {groupTotal}
                  </span>
                </div>
              </div>
              {cats.map((cat) => (
                <CategoryBox
                  key={cat.key}
                  catKey={cat.key}
                  label={cat.label}
                  accent={group.accent}
                  headerText={headerText}
                />
              ))}
            </section>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground/70">
        The full landscape · {totalCompanies} companies · hover a logo for its name ·{" "}
        <a href="/companies" className="text-emerald-400 hover:underline">
          open the searchable directory →
        </a>
      </p>
    </div>
  );
}

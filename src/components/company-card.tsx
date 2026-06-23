import type { Company } from "@/data/types";
import { CATEGORY_MAP, GROUP_MAP } from "@/data/taxonomy";
import { CompanyLogo } from "./company-logo";

export function CompanyCard({ company }: { company: Company }) {
  const cats = (company.categories || [])
    .map((k) => CATEGORY_MAP[k])
    .filter(Boolean)
    .slice(0, 3);

  return (
    <a
      href={`/companies/${company.slug}`}
      className="group flex flex-col rounded-xl border border-border/60 bg-card/30 p-4 transition-colors hover:border-border hover:bg-card/60"
    >
      <div className="flex items-center gap-3">
        <CompanyLogo
          name={company.name}
          src={company.logo}
          domain={company.logoDomain}
          className="h-10 w-10"
        />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold leading-tight">{company.name}</h3>
          <p className="truncate text-xs text-muted-foreground">{company.tagline}</p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
        {company.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-1">
        {cats.map((c) => {
          const g = GROUP_MAP[c.group];
          return (
            <span
              key={c.key}
              className="rounded-full px-2 py-0.5 text-[0.65rem] font-medium"
              style={{ backgroundColor: `${g.accent}1a`, color: g.accent }}
            >
              {c.label}
            </span>
          );
        })}
      </div>
    </a>
  );
}

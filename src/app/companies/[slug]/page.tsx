import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  Banknote,
  Calendar,
  ExternalLink,
  Globe,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { companies, getCompany, validCategories } from "@/data/companies";
import { CATEGORY_MAP, GROUP_MAP, groupForCategory } from "@/data/taxonomy";
import { CompanyLogo } from "@/components/company-logo";
import { CompanyCard } from "@/components/company-card";

export function generateStaticParams() {
  return companies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCompany(slug);
  if (!c) return { title: "Company not found — Stablytics" };
  return {
    title: `${c.name} — Stablytics`,
    description: c.tagline || c.description,
  };
}

function Pills({ label, items }: { label: string; items?: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span
            key={it}
            className="rounded-md border border-border/50 bg-muted/30 px-2 py-1 text-xs"
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = getCompany(slug);
  if (!company) notFound();

  const cats = validCategories(company).map((k) => CATEGORY_MAP[k]);
  const primaryGroup = company.categories
    .map((k) => groupForCategory(k))
    .find(Boolean);
  const accent = primaryGroup?.accent ?? "#10b981";

  const related = companies
    .filter(
      (c) =>
        c.slug !== company.slug &&
        c.categories?.some((k) => company.categories?.includes(k))
    )
    .map((c) => ({
      c,
      overlap: c.categories.filter((k) => company.categories.includes(k)).length,
    }))
    .sort((a, b) => b.overlap - a.overlap)
    .slice(0, 6)
    .map((x) => x.c);

  const facts = [
    company.founded && { icon: Calendar, label: "Founded", value: company.founded },
    company.hq && { icon: MapPin, label: "HQ", value: company.hq },
    company.stage && { icon: TrendingUp, label: "Stage", value: company.stage },
    company.funding && { icon: Banknote, label: "Funding", value: company.funding },
  ].filter(Boolean) as { icon: LucideIcon; label: string; value: string }[];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <a
        href="/companies"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Directory
      </a>

      {/* Header */}
      <div className="flex flex-col gap-5 border-b border-border/50 pb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <CompanyLogo
            name={company.name}
            src={company.logo}
            domain={company.logoDomain}
            className="h-16 w-16"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {company.name}
              </h1>
              {company.status && company.status !== "active" && (
                <span className="rounded-full border border-border/60 px-2 py-0.5 text-[0.65rem] uppercase tracking-wide text-muted-foreground">
                  {company.status}
                </span>
              )}
            </div>
            <p className="mt-1 text-muted-foreground">{company.tagline}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {cats.map((c) => {
                const g = GROUP_MAP[c.group];
                return (
                  <a
                    key={c.key}
                    href={`/companies?category=${c.key}`}
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium transition-opacity hover:opacity-80"
                    style={{ backgroundColor: `${g.accent}1a`, color: g.accent }}
                  >
                    {c.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: accent }}
          >
            <Globe className="h-4 w-4" /> Visit site
          </a>
        )}
      </div>

      {/* Body */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              About
            </h2>
            <p className="leading-relaxed text-foreground/90">{company.description}</p>
          </div>

          {company.notable && (
            <div
              className="rounded-xl border-l-2 bg-card/30 p-4 text-sm text-foreground/90"
              style={{ borderColor: accent }}
            >
              {company.notable}
            </div>
          )}

          <Pills label="Stablecoins" items={company.stablecoins} />
          <Pills label="Key products" items={company.keyProducts} />
          <Pills label="Chains" items={company.chains} />
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {facts.length > 0 && (
            <div className="rounded-xl border border-border/60 bg-card/30 p-4">
              <dl className="space-y-3">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-start gap-3">
                    <f.icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <dt className="text-xs text-muted-foreground">{f.label}</dt>
                      <dd className="text-sm font-medium">{f.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="flex flex-col gap-2">
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Globe className="h-4 w-4" />
                {company.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {company.twitter && (
              <a
                href={
                  company.twitter.startsWith("http")
                    ? company.twitter
                    : `https://x.com/${company.twitter.replace(/^@/, "")}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
                {company.twitter.startsWith("http") ? "X / Twitter" : company.twitter}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12 border-t border-border/50 pt-8">
          <h2 className="mb-4 text-lg font-semibold">Related companies</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <CompanyCard key={c.slug} company={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

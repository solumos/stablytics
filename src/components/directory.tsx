"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { companies, searchCompanies, countByCategory } from "@/data/companies";
import { GROUPS, categoriesForGroup, CATEGORY_MAP } from "@/data/taxonomy";
import type { Company } from "@/data/types";
import { CompanyCard } from "./company-card";
import { cn } from "@/lib/utils";

const COUNTS = countByCategory();

/**
 * Pure view shared by the interactive directory and the static fallback.
 * Handlers are optional so the same markup can be prerendered into the
 * page's static HTML (see DirectoryFallback).
 */
function DirectoryView({
  q,
  activeCat,
  results,
  onQChange,
  onCategory,
}: {
  q: string;
  activeCat: string | null;
  results: Company[];
  onQChange?: (q: string) => void;
  onCategory?: (key: string | null) => void;
}) {
  const activeLabel = activeCat ? CATEGORY_MAP[activeCat]?.label : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Directory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {companies.length} companies across the stablecoin economy.
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-xl">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search by name, product, stablecoin, location…"
          value={q}
          readOnly={!onQChange}
          onChange={onQChange ? (e) => onQChange(e.target.value) : undefined}
          className="h-11 w-full rounded-xl border border-border/50 bg-muted/30 pl-10 pr-10 text-sm placeholder:text-muted-foreground/60 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
        />
        {q && (
          <button
            onClick={() => onQChange?.("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category filters */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => onCategory?.(null)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              !activeCat
                ? "border-foreground/30 bg-foreground/10 text-foreground"
                : "border-border/50 text-muted-foreground hover:text-foreground"
            )}
          >
            All ({companies.length})
          </button>
        </div>
        {GROUPS.map((group) => (
          <div key={group.key} className="flex flex-wrap items-center gap-1.5">
            <span
              className="mr-1 text-[0.65rem] font-semibold uppercase tracking-wide"
              style={{ color: group.accent }}
            >
              {group.label}
            </span>
            {categoriesForGroup(group.key).map((cat) => {
              const active = activeCat === cat.key;
              const count = COUNTS[cat.key] || 0;
              return (
                <button
                  key={cat.key}
                  onClick={() => onCategory?.(active ? null : cat.key)}
                  className="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
                  style={
                    active
                      ? { backgroundColor: group.accent, borderColor: group.accent, color: "#fff" }
                      : { borderColor: `${group.accent}40`, color: "var(--muted-foreground)" }
                  }
                >
                  {cat.label} <span className="opacity-60">{count}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Results */}
      <div className="mb-3 text-sm text-muted-foreground">
        {results.length} {results.length === 1 ? "result" : "results"}
        {activeLabel ? ` in ${activeLabel}` : ""}
        {q.trim() ? ` for "${q.trim()}"` : ""}
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => (
            <CompanyCard key={c.slug} company={c} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card/20 py-16 text-center text-sm text-muted-foreground">
          No companies match your filters.
        </div>
      )}
    </div>
  );
}

/**
 * Default-state directory (all companies, no filters) with no interactivity.
 * Used as the Suspense fallback around <Directory /> so the full listing is
 * prerendered into the page's static HTML; React swaps in the interactive
 * version (identical markup for the default state) at hydration.
 */
export function DirectoryFallback() {
  return <DirectoryView q="" activeCat={null} results={companies} />;
}

export function Directory() {
  const sp = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(() => sp.get("q") || "");
  const [activeCat, setActiveCat] = useState<string | null>(() => sp.get("category"));

  // Reconcile with the URL when it changes externally (e.g. header search,
  // or a category link from the landscape map). setState bails on equal values.
  useEffect(() => {
    const urlQ = sp.get("q") || "";
    const urlCat = sp.get("category");
    setQ((prev) => (prev === urlQ ? prev : urlQ));
    setActiveCat((prev) => (prev === urlCat ? prev : urlCat));
  }, [sp]);

  function setCategory(next: string | null) {
    setActiveCat(next);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (next) params.set("category", next);
    const qs = params.toString();
    router.replace(qs ? `/companies?${qs}` : "/companies", { scroll: false });
  }

  const results = useMemo(() => {
    let list = q.trim() ? searchCompanies(q) : companies;
    if (activeCat) list = list.filter((c) => c.categories?.includes(activeCat));
    return list;
  }, [q, activeCat]);

  return (
    <DirectoryView
      q={q}
      activeCat={activeCat}
      results={results}
      onQChange={setQ}
      onCategory={setCategory}
    />
  );
}

"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Activity, Search, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Dashboard", exact: true },
  { href: "/chains", label: "Chains" },
  { href: "/coins", label: "Coins" },
  { href: "/issuers", label: "Issuers" },
  { href: "/protocols", label: "Protocols" },
];

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const segments = pathname.split("/");
  const isChainPage = segments[1] === "chains" && segments.length > 2;
  const chainSlugFromPath = isChainPage ? segments[2] : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = search.trim();
    if (!q) return;

    const prefix = isChainPage ? `/chains/${chainSlugFromPath}` : "/chains/ethereum";
    if (/^0x[a-fA-F0-9]{64}$/.test(q)) {
      router.push(`${prefix}/tx/${q}`);
    } else if (/^0x[a-fA-F0-9]{40}$/.test(q)) {
      router.push(`${prefix}/address/${q}`);
    } else if (/^\d+$/.test(q)) {
      router.push(`${prefix}/block/${q}`);
    } else {
      router.push(`${prefix}/tx/${q}`);
    }
    setSearch("");
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-3 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Activity className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">Stablytics</span>
        </a>

        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 transition-colors hover:bg-muted/50 hover:text-foreground",
                isActive(link.href, link.exact)
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {isChainPage && (
          <form
            onSubmit={handleSearch}
            className="hidden flex-1 max-w-md sm:flex"
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by address / txn hash / block"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border border-border/50 bg-muted/30 pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/20"
              />
            </div>
          </form>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/40 px-4 py-3 md:hidden">
          {isChainPage && (
            <form onSubmit={handleSearch} className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search address / txn / block"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border/50 bg-muted/30 pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus:border-emerald-500/50 focus:outline-none"
                />
              </div>
            </form>
          )}
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

"use client";

import { usePathname, useParams, notFound } from "next/navigation";
import { cn } from "@/lib/utils";
import { getChain } from "@/lib/chains/registry";

export default function ChainExplorerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const slug = params.slug as string;
  const chain = getChain(slug);

  if (!chain) return notFound();

  const base = `/chains/${slug}`;
  const subNav = [
    { href: base, label: "Stablecoins", exact: true },
    ...(chain.explorerEnabled
      ? [
          { href: `${base}/performance`, label: "Performance" },
          { href: `${base}/blocks`, label: "Blocks" },
          { href: `${base}/transactions`, label: "Transactions" },
        ]
      : []),
  ];

  return (
    <div>
      <div className="border-b border-border/30 bg-background/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 overflow-x-auto py-2 text-sm">
            <div className="flex items-center gap-1.5 mr-4">
              <div
                className="h-2 w-2 animate-pulse rounded-full"
                style={{ backgroundColor: chain.color }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: chain.color }}
              >
                {chain.name}
                {chain.explorerEnabled ? " Mainnet" : ""}
              </span>
            </div>
            {subNav.map((link) => {
                const isActive = link.exact
                  ? pathname === link.href
                  : pathname.startsWith(link.href);
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                      isActive
                        ? "bg-muted/60 text-foreground"
                        : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </a>
                );
              })}
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/skeleton";
import { ISSUERS, SYMBOL_TO_ISSUER } from "@/lib/stablecoins/issuers";

interface StablecoinData {
  symbol: string;
  name: string;
  supply: number;
  mechanism: string;
  chainCount: number;
}

interface Issuer {
  slug: string;
  name: string;
  type: string;
  coins: { symbol: string; supply: number }[];
  totalSupply: number;
  chainCount: number;
}

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

const typeColors: Record<string, string> = {
  Centralized: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Decentralized: "bg-purple-500/10 text-purple-400 border-purple-500/20",
};

export default function IssuersPage() {
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stablecoins")
      .then((r) => r.json())
      .then((d) => {
        // Merge all categories
        const allCoins: StablecoinData[] = [
          ...(d.topStablecoins || []),
          ...((d.nonUsdGroups || []) as { stablecoins: StablecoinData[] }[]).flatMap(
            (g) => g.stablecoins
          ),
          ...(d.yieldBearingTokens || []),
        ];
        if (!allCoins.length) return;

        // Group by issuer using our profile data
        const map = new Map<string, Issuer>();
        for (const coin of allCoins) {
          const issuerSlug = SYMBOL_TO_ISSUER.get(coin.symbol);
          const profile = issuerSlug
            ? ISSUERS.find((i) => i.slug === issuerSlug)
            : null;

          const key = profile?.slug || coin.name;
          const existing = map.get(key);
          if (existing) {
            existing.coins.push({ symbol: coin.symbol, supply: coin.supply });
            existing.totalSupply += coin.supply;
            existing.chainCount = Math.max(existing.chainCount, coin.chainCount);
          } else {
            map.set(key, {
              slug: profile?.slug || "",
              name: profile?.name || coin.name,
              type: profile?.type || (coin.mechanism === "fiat-backed" ? "Centralized" : "Decentralized"),
              coins: [{ symbol: coin.symbol, supply: coin.supply }],
              totalSupply: coin.supply,
              chainCount: coin.chainCount,
            });
          }
        }

        const sorted = Array.from(map.values()).sort(
          (a, b) => b.totalSupply - a.totalSupply
        );
        setIssuers(sorted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Issuers</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stablecoin issuers ranked by total supply under management
        </p>
      </div>

      <Card className="border-border/40 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {loading ? "Loading..." : `${issuers.length} issuers`}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-xs w-10">#</TableHead>
                <TableHead className="text-xs">Issuer</TableHead>
                <TableHead className="text-xs text-right">Total Supply</TableHead>
                <TableHead className="text-xs">Stablecoins</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs text-right">Max Chains</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i} className="border-border/40">
                      <TableCell colSpan={6}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : issuers.map((issuer, i) => (
                    <TableRow
                      key={issuer.name}
                      className="border-border/40 hover:bg-muted/30 cursor-pointer"
                      onClick={() => {
                        if (issuer.slug) window.location.href = `/issuers/${issuer.slug}`;
                      }}
                    >
                      <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        {issuer.slug ? (
                          <a href={`/issuers/${issuer.slug}`} className="text-sm font-medium text-emerald-400 hover:underline">
                            {issuer.name}
                          </a>
                        ) : (
                          <span className="text-sm font-medium">{issuer.name}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {fmtUsd(issuer.totalSupply)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {issuer.coins.map((c) => (
                            <Badge
                              key={c.symbol}
                              variant="outline"
                              className="text-[10px] border-border/50 text-muted-foreground"
                            >
                              {c.symbol} {fmtUsd(c.supply)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${typeColors[issuer.type] || "border-border/50 text-muted-foreground"}`}
                        >
                          {issuer.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {issuer.chainCount}
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

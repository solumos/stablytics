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
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import { CHAINS, type ChainConfig } from "@/lib/chains/registry";
import { getChainLogo } from "@/lib/chains/logos";

interface ChainData {
  chain: string;
  totalSupply: number;
  change24h: number;
  change7d: number;
  change30d: number;
  dominantStablecoin: string;
  dominantStablecoinPct: number;
  topStablecoins: { symbol: string; supply: number; pct: number }[];
  stablecoinCount: number;
}

interface Overview {
  totalGlobalSupply: number;
  chains: ChainData[];
}

const CHAIN_COLORS: Record<string, string> = {
  Ethereum: "#627EEA",
  Tron: "#FF0013",
  BSC: "#F0B90B",
  Solana: "#9945FF",
  Avalanche: "#E84142",
  Polygon: "#8247E5",
  Arbitrum: "#28A0F0",
  Optimism: "#FF0420",
  Base: "#0052FF",
  TON: "#0098EA",
  Sui: "#4DA2FF",
  Celo: "#FCFF52",
  "zkSync Era": "#8B8DFC",
  Linea: "#61DFFF",
  Scroll: "#FFEEDA",
  Tempo: "#34d399",
  Stable: "#3B82F6",
  Hyperliquid: "#77F2A1", Plasma: "#FF6B35",
};

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function Change({ value }: { value: number }) {
  if (value === 0) return <span className="text-muted-foreground">—</span>;
  const pos = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${pos ? "text-emerald-400" : "text-red-400"}`}>
      {pos ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(value).toFixed(2)}%
    </span>
  );
}

export default function ChainsPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stablecoins")
      .then((r) => r.json())
      .then((d) => {
        if (d.chains) {
          // Add any registry chains missing from DefiLlama
          const existingNames = new Set(d.chains.map((c: ChainData) => c.chain));
          for (const cfg of CHAINS) {
            if (!existingNames.has(cfg.name) && cfg.explorerEnabled) {
              d.chains.push({
                chain: cfg.name,
                totalSupply: 0,
                change24h: 0,
                change7d: 0,
                change30d: 0,
                dominantStablecoin: "—",
                dominantStablecoinPct: 0,
                topStablecoins: [],
                stablecoinCount: 0,
              });
            }
          }
          setData(d);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Chains</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stablecoin supply and movement across all tracked chains
        </p>
      </div>

      <Card className="border-border/40 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {loading ? "Loading..." : `${data?.chains.length} chains tracked`}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-xs w-10">#</TableHead>
                <TableHead className="text-xs">Chain</TableHead>
                <TableHead className="text-xs text-right">Total Supply</TableHead>
                <TableHead className="text-xs text-right">Market Share</TableHead>
                <TableHead className="text-xs text-right">24h</TableHead>
                <TableHead className="text-xs text-right">7d</TableHead>
                <TableHead className="text-xs text-right">30d</TableHead>
                <TableHead className="text-xs">Top Stablecoin</TableHead>
                <TableHead className="text-xs text-right">Assets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 15 }).map((_, i) => (
                    <TableRow key={i} className="border-border/40">
                      <TableCell colSpan={9}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : data?.chains.map((chain, i) => (
                    <TableRow
                      key={chain.chain}
                      className="border-border/40 hover:bg-muted/30 cursor-pointer"
                      onClick={() => {
                        const cfg = CHAINS.find((c) => c.name === chain.chain);
                        if (cfg) window.location.href = `/chains/${cfg.slug}`;
                      }}
                    >
                      <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        {(() => {
                          const cfg = CHAINS.find((c) => c.name === chain.chain);
                          const logo = cfg ? getChainLogo(cfg.slug) : undefined;
                          return (
                            <div className="flex items-center gap-2">
                              {logo ? (
                                <img src={logo} alt={chain.chain} className="h-5 w-5 rounded-full" />
                              ) : (
                                <div className="h-5 w-5 rounded-full" style={{ backgroundColor: CHAIN_COLORS[chain.chain] || "#6B7280" }} />
                              )}
                              <a
                                href={`/chains/${cfg?.slug || "#"}`}
                                className="text-sm font-medium hover:underline"
                                style={{ color: CHAIN_COLORS[chain.chain] || undefined }}
                              >
                                {chain.chain}
                              </a>
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {fmtUsd(chain.totalSupply)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {data ? ((chain.totalSupply / data.totalGlobalSupply) * 100).toFixed(1) : 0}%
                      </TableCell>
                      <TableCell className="text-right"><Change value={chain.change24h} /></TableCell>
                      <TableCell className="text-right"><Change value={chain.change7d} /></TableCell>
                      <TableCell className="text-right"><Change value={chain.change30d} /></TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium">{chain.dominantStablecoin}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {chain.dominantStablecoinPct.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {chain.stablecoinCount}
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

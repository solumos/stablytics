"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCoinLogo } from "@/lib/stablecoins/logos";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MetricCardSkeleton,
  Skeleton,
} from "@/components/skeleton";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  Coins,
} from "lucide-react";
import { getChain } from "@/lib/chains/registry";

interface ChainStableData {
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

// Map DefiLlama chain names to our slugs for lookup
const DEFILLAMA_NAME_MAP: Record<string, string> = {
  Ethereum: "Ethereum", Tron: "Tron", BSC: "BSC", Solana: "Solana",
  Avalanche: "Avalanche", Polygon: "Polygon", Arbitrum: "Arbitrum",
  "OP Mainnet": "Optimism", Base: "Base", TON: "TON", Sui: "Sui",
  Celo: "Celo", "ZKsync Era": "zkSync Era", Linea: "Linea",
  Scroll: "Scroll", Tempo: "Tempo", Stable: "Stable",
};

export default function ChainStablecoinPage() {
  const params = useParams();
  const slug = params.slug as string;
  const chain = getChain(slug);

  const [data, setData] = useState<ChainStableData | null>(null);
  const [globalSupply, setGlobalSupply] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug === "tempo") {
      // Tempo: fetch directly from Tempo token list API (not DefiLlama)
      fetch("/api/tempo?action=tokens")
        .then((r) => r.json())
        .then((tempoData) => {
          const tokens = (tempoData.tokens || [])
            .filter((t: any) => t.totalSupply !== "0")
            .sort((a: any, b: any) => Number(BigInt(b.totalSupply)) - Number(BigInt(a.totalSupply)));
          const totalSupply = tokens.reduce(
            (s: number, t: any) => s + Number(BigInt(t.totalSupply)) / 10 ** t.decimals,
            0
          );
          const topStablecoins = tokens.map((t: any) => {
            const supply = Number(BigInt(t.totalSupply)) / 10 ** t.decimals;
            return {
              symbol: t.symbol,
              supply,
              pct: totalSupply > 0 ? (supply / totalSupply) * 100 : 0,
            };
          });
          setData({
            chain: "Tempo",
            totalSupply,
            change24h: 0,
            change7d: 0,
            change30d: 0,
            dominantStablecoin: topStablecoins[0]?.symbol || "—",
            dominantStablecoinPct: topStablecoins[0]?.pct || 0,
            topStablecoins,
            stablecoinCount: tokens.length,
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      // All other chains: use DefiLlama data
      fetch("/api/stablecoins")
        .then((r) => r.json())
        .then((d) => {
          if (d.chains && chain) {
            const match = d.chains.find(
              (c: ChainStableData) => c.chain === chain.name
            );
            if (match && match.totalSupply > 0) {
              setData(match);
            }
            setGlobalSupply(d.totalGlobalSupply || 0);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [chain, slug]);

  if (!chain) return notFound();

  const color = chain.color;
  const marketShare = data && globalSupply > 0
    ? (data.totalSupply / globalSupply) * 100
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Stablecoins on {chain.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Stablecoin supply, composition, and movement on {chain.name}
        </p>
      </div>

      {/* Metrics */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      ) : data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
          <Card className="border-border/40 bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Stablecoin Supply</span>
                <DollarSign className="h-4 w-4 text-muted-foreground/60" />
              </div>
              <p className="mt-2 text-2xl font-bold">{fmtUsd(data.totalSupply)}</p>
              <Change value={data.change24h} />
              <span className="ml-1 text-xs text-muted-foreground">24h</span>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Global Market Share</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{marketShare.toFixed(2)}%</p>
              <p className="text-xs text-muted-foreground">of all stablecoin supply</p>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Supply Change</span>
                <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
              </div>
              <div className="mt-2 flex items-baseline gap-3">
                <div><Change value={data.change7d} /><span className="ml-1 text-xs text-muted-foreground">7d</span></div>
                <div><Change value={data.change30d} /><span className="ml-1 text-xs text-muted-foreground">30d</span></div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/40 bg-card/50">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Stablecoins</span>
                <Coins className="h-4 w-4 text-muted-foreground/60" />
              </div>
              <p className="mt-2 text-2xl font-bold">{data.stablecoinCount}</p>
              <p className="text-xs text-muted-foreground">
                {data.dominantStablecoin} dominant ({data.dominantStablecoinPct.toFixed(0)}%)
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-border/40 bg-card/50 mb-6">
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">
              No stablecoin supply data available for {chain.name} yet.
              {chain.explorerEnabled && " Use the explorer tabs to browse on-chain activity."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stablecoin breakdown table */}
      {data && data.topStablecoins.length > 0 && (
        <Card className="border-border/40 bg-card/50 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stablecoins on {chain.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-xs w-10">#</TableHead>
                  <TableHead className="text-xs">Stablecoin</TableHead>
                  <TableHead className="text-xs text-right">Supply</TableHead>
                  <TableHead className="text-xs text-right">Share</TableHead>
                  <TableHead className="text-xs"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topStablecoins.map((coin, i) => (
                  <TableRow
                    key={coin.symbol}
                    className="border-border/40 hover:bg-muted/30 cursor-pointer"
                    onClick={() => window.location.href = `/chains/${slug}/coins/${coin.symbol.toLowerCase()}`}
                  >
                    <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <a
                        href={`/chains/${slug}/coins/${coin.symbol.toLowerCase()}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                        style={{ color }}
                      >
                        {getCoinLogo(coin.symbol) && <img src={getCoinLogo(coin.symbol)} alt="" className="h-4 w-4 rounded-full" />}
                        {coin.symbol}
                      </a>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">{fmtUsd(coin.supply)}</TableCell>
                    <TableCell className="text-right">
                      {/* Visual bar */}
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs text-muted-foreground">{coin.pct.toFixed(1)}%</span>
                        <div className="h-1.5 w-16 rounded-full bg-muted/30 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${Math.min(coin.pct, 100)}%`, backgroundColor: color }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-xs text-muted-foreground">View →</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Explorer links available via the sub-nav tabs above */}
    </div>
  );
}

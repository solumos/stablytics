"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, ArrowDownRight, Shield, DollarSign } from "lucide-react";
import { CHAINS } from "@/lib/chains/registry";
import { getChainLogo } from "@/lib/chains/logos";
import { getCoinLogo } from "@/lib/stablecoins/logos";
import { DetailRowSkeleton, PageHeaderSkeleton, MetricCardSkeleton } from "@/components/skeleton";
import { SYMBOL_TO_ISSUER, getIssuerBySlug } from "@/lib/stablecoins/issuers";

interface ChainBreakdown {
  chain: string;
  supply: number;
  change24h: number;
  change7d: number;
  change30d: number;
  pctOfTotal: number;
}

interface CoinDetail {
  symbol: string;
  name: string;
  pegType: string;
  mechanism: string;
  totalSupply: number;
  price: number | null;
  change24h: number;
  change7d: number;
  change30d: number;
  chainCount: number;
  chains: ChainBreakdown[];
}

const CHAIN_COLORS: Record<string, string> = {
  Ethereum: "#627EEA", Tron: "#FF0013", BSC: "#F0B90B", Solana: "#9945FF",
  Avalanche: "#E84142", Polygon: "#8247E5", Arbitrum: "#28A0F0",
  "OP Mainnet": "#FF0420", Base: "#0052FF", TON: "#0098EA", Sui: "#4DA2FF",
  Celo: "#FCFF52", "ZKsync Era": "#8B8DFC", Linea: "#61DFFF",
  Scroll: "#FFEEDA", Tempo: "#34d399", Stable: "#3B82F6",
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

const mechLabels: Record<string, string> = {
  "fiat-backed": "Fiat-Backed",
  "crypto-backed": "Crypto-Backed",
  algorithmic: "Algorithmic",
};

const mechColors: Record<string, string> = {
  "fiat-backed": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "crypto-backed": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  algorithmic: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function CoinDetailPage() {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();
  const [coin, setCoin] = useState<CoinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const issuerSlug = SYMBOL_TO_ISSUER.get(symbol);
  const issuer = issuerSlug ? getIssuerBySlug(issuerSlug) : null;

  useEffect(() => {
    fetch(`/api/stablecoin-detail?symbol=${symbol}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setCoin(d);
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [symbol]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
        <div className="rounded-lg border border-border/40 bg-card/50">
          {Array.from({ length: 10 }).map((_, i) => <DetailRowSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (error || !coin) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Coin Not Found</h1>
        <p className="mt-2 text-muted-foreground">{error || `No data for ${symbol}`}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <a href="/coins" className="text-sm text-muted-foreground hover:text-foreground">Coins</a>
          <span className="text-muted-foreground/40">/</span>
        </div>
        <div className="flex items-center gap-3">
          {getCoinLogo(symbol) && <img src={getCoinLogo(symbol)} alt={symbol} className="h-8 w-8 rounded-full" />}
          <h1 className="text-2xl font-bold tracking-tight">{coin.symbol}</h1>
          <span className="text-lg text-muted-foreground">{coin.name}</span>
          <Badge variant="outline" className={`text-xs ${mechColors[coin.mechanism] || "border-border/50"}`}>
            {mechLabels[coin.mechanism] || coin.mechanism}
          </Badge>
          <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
            {coin.pegType.replace("pegged", "")}
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Total Supply</span>
            <p className="mt-1 text-2xl font-bold">{fmtUsd(coin.totalSupply)}</p>
            <Change value={coin.change24h} />
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Price</span>
            <p className="mt-1 text-2xl font-bold">
              {coin.price ? `$${coin.price.toFixed(4)}` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Chains</span>
            <p className="mt-1 text-2xl font-bold">{coin.chainCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">30d Change</span>
            <p className="mt-1 text-2xl font-bold"><Change value={coin.change30d} /></p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-6">
        {/* Collateralization info */}
        <Card className="border-border/40 bg-card/50 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="h-4 w-4" /> Collateralization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1">Mechanism</h4>
              <p>{mechLabels[coin.mechanism] || coin.mechanism}</p>
            </div>
            {issuer && (
              <>
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Backing</h4>
                  <p>{issuer.collateralization}</p>
                </div>
                {issuer.auditor && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Auditor</h4>
                    <p>{issuer.auditor}</p>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1">Issuer</h4>
                  <a
                    href={`/issuers/${issuer.slug}`}
                    className="text-emerald-400 hover:underline"
                  >
                    {issuer.name}
                  </a>
                </div>
              </>
            )}
            {!issuer && (
              <p className="text-muted-foreground">
                No detailed collateralization data available for this stablecoin.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Chain breakdown table */}
        <Card className="border-border/40 bg-card/50 lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <DollarSign className="h-4 w-4" /> Supply by Chain
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-xs w-10">#</TableHead>
                  <TableHead className="text-xs">Chain</TableHead>
                  <TableHead className="text-xs text-right">Supply</TableHead>
                  <TableHead className="text-xs text-right">Share</TableHead>
                  <TableHead className="text-xs text-right">24h</TableHead>
                  <TableHead className="text-xs text-right">7d</TableHead>
                  <TableHead className="text-xs text-right">30d</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coin.chains.map((chain, i) => {
                  const cfg = CHAINS.find((c) => c.name === chain.chain);
                  const href = cfg ? `/chains/${cfg.slug}/coins/${symbol.toLowerCase()}` : undefined;
                  const logo = cfg ? getChainLogo(cfg.slug) : undefined;
                  return (
                  <TableRow
                    key={chain.chain}
                    className="border-border/40 hover:bg-muted/30 cursor-pointer"
                    onClick={() => { if (href) window.location.href = href; }}
                  >
                    <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {logo ? (
                          <img src={logo} alt={chain.chain} className="h-4 w-4 rounded-full" />
                        ) : (
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: CHAIN_COLORS[chain.chain] || "#6B7280" }}
                          />
                        )}
                        {href ? (
                          <a href={href} className="text-sm font-medium hover:underline" style={{ color: CHAIN_COLORS[chain.chain] }}>{chain.chain}</a>
                        ) : (
                          <span className="text-sm font-medium">{chain.chain}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">{fmtUsd(chain.supply)}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {chain.pctOfTotal.toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-right"><Change value={chain.change24h} /></TableCell>
                    <TableCell className="text-right"><Change value={chain.change7d} /></TableCell>
                    <TableCell className="text-right"><Change value={chain.change30d} /></TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

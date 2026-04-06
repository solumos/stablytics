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
import {
  MetricCardSkeleton,
  PageHeaderSkeleton,
  Skeleton,
} from "@/components/skeleton";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { shortenAddress, shortenHash } from "@/lib/format";
import { getChain } from "@/lib/chains/registry";
import { SYMBOL_TO_ISSUER, getIssuerBySlug } from "@/lib/stablecoins/issuers";

interface OverviewData {
  chain: string;
  chainSlug: string;
  symbol: string;
  contractAddress: string | null;
  metadata: { name: string; symbol: string; decimals: number; logo: string | null } | null;
  supply: {
    supply: number;
    change24h: number;
    change7d: number;
    change30d: number;
    globalSupply: number;
  } | null;
  explorerEnabled: boolean;
}

interface Transfer {
  blockNum: string;
  hash: string;
  from: string;
  to: string;
  value: number | null;
  asset: string | null;
  category: string;
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

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="ml-1.5 inline-flex text-muted-foreground hover:text-foreground">
      {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

export default function ChainCoinPage() {
  const params = useParams();
  const slug = params.slug as string;
  const symbol = (params.symbol as string).toUpperCase();
  const chain = getChain(slug);
  const color = chain?.color || "#34d399";

  const issuerSlug = SYMBOL_TO_ISSUER.get(symbol);
  const issuer = issuerSlug ? getIssuerBySlug(issuerSlug) : null;

  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [transfersLoading, setTransfersLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/chain-coin?chain=${slug}&symbol=${symbol}&action=overview`)
      .then((r) => r.json())
      .then((d) => { if (!d.error) setOverview(d); setLoading(false); })
      .catch(() => setLoading(false));

    fetch(`/api/chain-coin?chain=${slug}&symbol=${symbol}&action=transfers`)
      .then((r) => r.json())
      .then((d) => { if (d.transfers) setTransfers(d.transfers); setTransfersLoading(false); })
      .catch(() => setTransfersLoading(false));
  }, [slug, symbol]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  const supply = overview?.supply;
  const chainDominance = supply && supply.globalSupply > 0
    ? (supply.supply / supply.globalSupply) * 100
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb + Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <a href={`/chains/${slug}`} className="hover:text-foreground" style={{ color }}>{chain?.name}</a>
          <span>/</span>
          <a href={`/coins/${symbol.toLowerCase()}`} className="hover:text-foreground">{symbol}</a>
        </div>
        <div className="flex items-center gap-3">
          {overview?.metadata?.logo && (
            <img src={overview.metadata.logo} alt={symbol} className="h-10 w-10 rounded-full" />
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {symbol} on {chain?.name}
            </h1>
            {overview?.metadata?.name && (
              <p className="text-sm text-muted-foreground">{overview.metadata.name}</p>
            )}
          </div>
          {issuer && (
            <a href={`/issuers/${issuer.slug}`}>
              <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground hover:text-foreground">
                by {issuer.name}
              </Badge>
            </a>
          )}
        </div>
        {overview?.contractAddress && (
          <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            Contract:
            <a
              href={`/chains/${slug}/address/${overview.contractAddress}`}
              className="font-mono hover:underline"
              style={{ color }}
            >
              {overview.contractAddress}
            </a>
            <CopyBtn text={overview.contractAddress} />
          </p>
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Supply on {chain?.name}</span>
              <DollarSign className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <p className="mt-2 text-2xl font-bold">{supply ? fmtUsd(supply.supply) : "—"}</p>
            {supply && <Change value={supply.change24h} />}
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Chain Dominance</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{chainDominance.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">of {symbol} global supply</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">7d Change</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <p className="mt-2 text-2xl font-bold">{supply ? <Change value={supply.change7d} /> : "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">30d Change</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{supply ? <Change value={supply.change30d} /> : "—"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Context cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 mb-6">
        {issuer && (
          <Card className="border-border/40 bg-card/50">
            <CardContent className="p-5">
              <h3 className="text-xs font-medium text-muted-foreground mb-2">Issuer</h3>
              <a href={`/issuers/${issuer.slug}`} className="text-sm font-medium hover:underline" style={{ color }}>
                {issuer.name}
              </a>
              <p className="mt-1 text-xs text-muted-foreground">{issuer.collateralization}</p>
            </CardContent>
          </Card>
        )}
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <h3 className="text-xs font-medium text-muted-foreground mb-2">Quick Links</h3>
            <div className="flex flex-wrap gap-2">
              <a href={`/coins/${symbol.toLowerCase()}`} className="inline-flex items-center gap-1 rounded-md bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                {symbol} Global <ExternalLink className="h-3 w-3" />
              </a>
              <a href={`/chains/${slug}`} className="inline-flex items-center gap-1 rounded-md bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                {chain?.name} Explorer <ExternalLink className="h-3 w-3" />
              </a>
              {overview?.contractAddress && (
                <a href={`/chains/${slug}/address/${overview.contractAddress}`} className="inline-flex items-center gap-1 rounded-md bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                  Contract <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent transfers */}
      <Card className="border-border/40 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recent {symbol} Transfers on {chain?.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-xs">Txn Hash</TableHead>
                <TableHead className="text-xs">From</TableHead>
                <TableHead className="text-xs">To</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs text-right">Block</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfersLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i} className="border-border/40">
                      <TableCell colSpan={5}><Skeleton className="h-4 w-full" /></TableCell>
                    </TableRow>
                  ))
                : transfers.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                        {overview?.explorerEnabled
                          ? "No recent transfers found"
                          : "Transfer data not available for this chain"}
                      </TableCell>
                    </TableRow>
                  )
                  : transfers.map((t, i) => (
                    <TableRow key={`${t.hash}-${i}`} className="border-border/40 hover:bg-muted/30">
                      <TableCell>
                        <a href={`/chains/${slug}/tx/${t.hash}`} className="font-mono text-xs hover:underline" style={{ color }}>
                          {shortenHash(t.hash)}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a href={`/chains/${slug}/address/${t.from}`} className="font-mono text-xs hover:underline" style={{ color }}>
                          {shortenAddress(t.from)}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a href={`/chains/${slug}/address/${t.to}`} className="font-mono text-xs hover:underline" style={{ color }}>
                          {shortenAddress(t.to)}
                        </a>
                      </TableCell>
                      <TableCell className="text-right text-xs font-medium">
                        {t.value !== null
                          ? t.value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                          : "—"}{" "}
                        <span className="text-muted-foreground">{symbol}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <a href={`/chains/${slug}/block/${parseInt(t.blockNum, 16)}`} className="text-xs hover:underline" style={{ color }}>
                          {parseInt(t.blockNum, 16).toLocaleString()}
                        </a>
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

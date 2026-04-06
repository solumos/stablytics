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
import { ArrowUpRight, ArrowDownRight, ExternalLink, Building2, Shield, FileCheck, Scale } from "lucide-react";
import { DetailRowSkeleton, PageHeaderSkeleton, MetricCardSkeleton } from "@/components/skeleton";
import { getIssuerBySlug, type IssuerProfile } from "@/lib/stablecoins/issuers";

interface CoinData {
  symbol: string;
  name: string;
  supply: number;
  change24h: number;
  change7d: number;
  pegType: string;
  mechanism: string;
  chainCount: number;
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

export default function IssuerDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const issuer = getIssuerBySlug(slug);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [totalSupply, setTotalSupply] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stablecoins")
      .then((r) => r.json())
      .then((d) => {
        if (d.topStablecoins && issuer) {
          const issuerCoins = (d.topStablecoins as CoinData[]).filter((c) =>
            issuer.coins.includes(c.symbol)
          );
          setCoins(issuerCoins);
          setTotalSupply(issuerCoins.reduce((s, c) => s + c.supply, 0));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [issuer]);

  if (!issuer) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Issuer Not Found</h1>
        <p className="mt-2 text-muted-foreground">
          No issuer profile found for &quot;{slug}&quot;.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
        <div className="rounded-lg border border-border/40 bg-card/50">
          {Array.from({ length: 8 }).map((_, i) => (
            <DetailRowSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <a href="/issuers" className="text-sm text-muted-foreground hover:text-foreground">
            Issuers
          </a>
          <span className="text-muted-foreground/40">/</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{issuer.name}</h1>
          <Badge
            variant="outline"
            className={
              issuer.type === "Centralized"
                ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                : "bg-purple-500/10 text-purple-400 border-purple-500/20"
            }
          >
            {issuer.type}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
          {issuer.description}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Total Supply</span>
            <p className="mt-1 text-2xl font-bold">{fmtUsd(totalSupply)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Stablecoins Issued</span>
            <p className="mt-1 text-2xl font-bold">{coins.length}</p>
            <p className="text-xs text-muted-foreground">
              {coins.map((c) => c.symbol).join(", ")}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Max Chain Reach</span>
            <p className="mt-1 text-2xl font-bold">
              {Math.max(...coins.map((c) => c.chainCount), 0)} chains
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Coins table */}
      {coins.length > 0 && (
        <Card className="border-border/40 bg-card/50 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Issued Stablecoins
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-xs">Stablecoin</TableHead>
                  <TableHead className="text-xs text-right">Supply</TableHead>
                  <TableHead className="text-xs text-right">Share</TableHead>
                  <TableHead className="text-xs text-right">24h</TableHead>
                  <TableHead className="text-xs text-right">7d</TableHead>
                  <TableHead className="text-xs">Peg</TableHead>
                  <TableHead className="text-xs text-right">Chains</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coins.map((coin) => (
                  <TableRow key={coin.symbol} className="border-border/40 hover:bg-muted/30">
                    <TableCell>
                      <span className="text-sm font-medium">{coin.symbol}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{coin.name}</span>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {fmtUsd(coin.supply)}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {totalSupply > 0 ? ((coin.supply / totalSupply) * 100).toFixed(1) : 0}%
                    </TableCell>
                    <TableCell className="text-right"><Change value={coin.change24h} /></TableCell>
                    <TableCell className="text-right"><Change value={coin.change7d} /></TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground">
                        {coin.pegType.replace("pegged", "")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {coin.chainCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Company & collateral details */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Company info */}
        {issuer.company && (
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Building2 className="h-4 w-4" /> Company
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y divide-border/40 p-0">
              {issuer.company.legalName && (
                <div className="flex gap-4 px-6 py-3">
                  <span className="w-28 shrink-0 text-xs text-muted-foreground">Legal Name</span>
                  <span className="text-sm">{issuer.company.legalName}</span>
                </div>
              )}
              {issuer.company.jurisdiction && (
                <div className="flex gap-4 px-6 py-3">
                  <span className="w-28 shrink-0 text-xs text-muted-foreground">Jurisdiction</span>
                  <span className="text-sm">{issuer.company.jurisdiction}</span>
                </div>
              )}
              {issuer.company.founded && (
                <div className="flex gap-4 px-6 py-3">
                  <span className="w-28 shrink-0 text-xs text-muted-foreground">Founded</span>
                  <span className="text-sm">{issuer.company.founded}</span>
                </div>
              )}
              {issuer.company.ceo && (
                <div className="flex gap-4 px-6 py-3">
                  <span className="w-28 shrink-0 text-xs text-muted-foreground">CEO</span>
                  <span className="text-sm">{issuer.company.ceo}</span>
                </div>
              )}
              {issuer.company.website && (
                <div className="flex gap-4 px-6 py-3">
                  <span className="w-28 shrink-0 text-xs text-muted-foreground">Website</span>
                  <a
                    href={issuer.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:underline"
                  >
                    {issuer.company.website.replace("https://", "")}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Collateralization */}
        <Card className="border-border/40 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Shield className="h-4 w-4" /> Collateralization & Reserves
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1">Backing</h4>
              <p>{issuer.collateralization}</p>
            </div>
            {issuer.reserves && (
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">Reserves & Transparency</h4>
                <p>{issuer.reserves}</p>
              </div>
            )}
            {issuer.auditor && (
              <div className="flex items-start gap-2">
                <FileCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-0.5">Auditor</h4>
                  <p>{issuer.auditor}</p>
                </div>
              </div>
            )}
            {issuer.regulatory && (
              <div className="flex items-start gap-2">
                <Scale className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-0.5">Regulatory</h4>
                  <p>{issuer.regulatory}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

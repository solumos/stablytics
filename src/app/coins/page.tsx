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
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/components/skeleton";
import { getCoinLogo } from "@/lib/stablecoins/logos";

interface StablecoinData {
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

const mechColors: Record<string, string> = {
  "fiat-backed": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "crypto-backed": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  algorithmic: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function CoinsPage() {
  const [coins, setCoins] = useState<StablecoinData[]>([]);
  const [totalSupply, setTotalSupply] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stablecoins")
      .then((r) => r.json())
      .then((d) => {
        if (d.topStablecoins) setCoins(d.topStablecoins);
        if (d.totalGlobalSupply) setTotalSupply(d.totalGlobalSupply);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Stablecoins</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All tracked stablecoins ranked by circulating supply
        </p>
      </div>

      <Card className="border-border/40 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {loading ? "Loading..." : `${coins.length} stablecoins`}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-xs w-10">#</TableHead>
                <TableHead className="text-xs">Stablecoin</TableHead>
                <TableHead className="text-xs text-right">Supply</TableHead>
                <TableHead className="text-xs text-right">Market Share</TableHead>
                <TableHead className="text-xs text-right">24h</TableHead>
                <TableHead className="text-xs text-right">7d</TableHead>
                <TableHead className="text-xs">Mechanism</TableHead>
                <TableHead className="text-xs text-right">Chains</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 15 }).map((_, i) => (
                    <TableRow key={i} className="border-border/40">
                      <TableCell colSpan={8}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : coins.map((coin, i) => (
                    <TableRow
                      key={coin.symbol}
                      className="border-border/40 hover:bg-muted/30 cursor-pointer"
                      onClick={() => window.location.href = `/coins/${coin.symbol.toLowerCase()}`}
                    >
                      <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCoinLogo(coin.symbol) && <img src={getCoinLogo(coin.symbol)} alt="" className="h-5 w-5 rounded-full" />}
                          <div>
                            <a href={`/coins/${coin.symbol.toLowerCase()}`} className="text-sm font-medium text-emerald-400 hover:underline">{coin.symbol}</a>
                            <span className="ml-2 text-xs text-muted-foreground">{coin.name}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">{fmtUsd(coin.supply)}</TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {totalSupply > 0 ? ((coin.supply / totalSupply) * 100).toFixed(1) : 0}%
                      </TableCell>
                      <TableCell className="text-right"><Change value={coin.change24h} /></TableCell>
                      <TableCell className="text-right"><Change value={coin.change7d} /></TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${mechColors[coin.mechanism] || "border-border/50 text-muted-foreground"}`}>
                          {coin.mechanism || coin.pegType}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">{coin.chainCount}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

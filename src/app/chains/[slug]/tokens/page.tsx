"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/skeleton";
import { shortenAddress } from "@/lib/format";
import { getChain } from "@/lib/chains/registry";
import { getCoinLogo } from "@/lib/stablecoins/logos";

interface TokenData {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  logoURI: string;
  totalSupply: string;
}

function formatSupply(raw: string, decimals: number): string {
  const n = Number(BigInt(raw)) / 10 ** decimals;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(2);
}

export default function ChainTokensPage() {
  const { slug } = useParams() as { slug: string };
  const chain = getChain(slug);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);

  // Only Tempo has a token list for now
  if (slug !== "tempo") return notFound();

  useEffect(() => {
    fetch("/api/tempo?action=tokens")
      .then((r) => r.json())
      .then((d) => {
        setTokens(d.tokens || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sorted = [...tokens].sort((a, b) => {
    const aVal = BigInt(a.totalSupply || "0");
    const bVal = BigInt(b.totalSupply || "0");
    if (bVal > aVal) return 1;
    if (bVal < aVal) return -1;
    return 0;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Tempo Tokens</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          TIP-20 stablecoin tokens on Tempo Network
        </p>
      </div>

      <Card className="border-border/40 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {loading ? "Loading..." : `${tokens.length} tokens found`}
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-xs w-10">#</TableHead>
                <TableHead className="text-xs">Token</TableHead>
                <TableHead className="text-xs">Contract</TableHead>
                <TableHead className="text-xs text-right">Total Supply</TableHead>
                <TableHead className="text-xs text-right">Decimals</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="border-border/40">
                      <TableCell colSpan={5}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : sorted.map((token, i) => (
                    <TableRow key={token.address} className="border-border/40 hover:bg-muted/30">
                      <TableCell className="text-xs text-muted-foreground">{i + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getCoinLogo(token.symbol) && (
                            <img
                              src={getCoinLogo(token.symbol)!}
                              alt={token.symbol}
                              className="h-7 w-7 rounded-full"
                            />
                          )}
                          <div>
                            <a
                              href={`/chains/tempo/address/${token.address}`}
                              className="text-sm font-medium text-emerald-400 hover:underline"
                            >
                              {token.name}
                            </a>
                            <p className="text-xs text-muted-foreground">{token.symbol}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`/chains/tempo/address/${token.address}`}
                          className="font-mono text-xs text-emerald-400 hover:underline"
                        >
                          {shortenAddress(token.address)}
                        </a>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {token.totalSupply !== "0"
                          ? formatSupply(token.totalSupply, token.decimals)
                          : "0"}{" "}
                        <span className="text-muted-foreground">{token.symbol}</span>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {token.decimals}
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

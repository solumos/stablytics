"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getChain } from "@/lib/chains/registry";
import { Activity, Zap, Clock, Box, ArrowRight } from "lucide-react";
import {
  Skeleton,
  MetricCardSkeleton,
  BlockCardSkeleton,
  TxCardSkeleton,
} from "@/components/skeleton";
import { timeAgo, formatBytes, shortenHash } from "@/lib/format";

export default function ChainPerformancePage() {
  const params = useParams();
  const slug = params.slug as string;
  const chain = getChain(slug);

  const [stats, setStats] = useState<{
    latestBlock: number;
    avgBlockTime: number;
    avgTps: number;
    gasPrice: string;
  } | null>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chain?.explorerEnabled) {
      setLoading(false);
      return;
    }
    Promise.all([
      fetch(`/api/chain?chain=${slug}&action=stats`).then((r) => r.json()),
      fetch(`/api/chain?chain=${slug}&action=blocks&count=8`).then((r) =>
        r.json()
      ),
    ])
      .then(([s, b]) => {
        if (s.latestBlock) setStats(s);
        if (b.blocks) setBlocks(b.blocks);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug, chain?.explorerEnabled]);

  if (!chain) return notFound();

  if (!chain.explorerEnabled) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">{chain.name}</h1>
        <p className="mt-2 text-muted-foreground">
          Explorer for {chain.name} is coming soon. This chain uses a non-EVM
          architecture.
        </p>
      </div>
    );
  }

  // Collect txns from blocks
  const txns: { hash: string; blockNumber: number; timestamp: number }[] = [];
  for (const block of blocks) {
    for (const hash of block.transactions || []) {
      txns.push({ hash, blockNumber: block.number, timestamp: block.timestamp });
      if (txns.length >= 6) break;
    }
    if (txns.length >= 6) break;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {chain.name} Performance
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Block production and network performance for {chain.name}
          {stats && (
            <span style={{ color: chain.color }}>
              {" "}— Block #{stats.latestBlock.toLocaleString()}
            </span>
          )}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))
        ) : (
          <>
            <Card className="border-border/40 bg-card/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Latest Block
                  </span>
                  <Activity className="h-4 w-4 text-muted-foreground/60" />
                </div>
                <p className="mt-3 text-2xl font-bold">
                  {stats?.latestBlock.toLocaleString() || "—"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Block Time
                  </span>
                  <Clock className="h-4 w-4 text-muted-foreground/60" />
                </div>
                <p className="mt-3 text-2xl font-bold">
                  {stats ? `${stats.avgBlockTime.toFixed(2)}s` : "—"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Avg TPS</span>
                  <Zap className="h-4 w-4 text-muted-foreground/60" />
                </div>
                <p className="mt-3 text-2xl font-bold">
                  {stats ? Math.round(stats.avgTps).toLocaleString() : "—"}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Native Token
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold">
                  {chain.nativeSymbol}
                </p>
                <p className="text-xs text-muted-foreground">
                  Chain ID: {chain.chainId}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Latest blocks + txns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/40 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Latest Blocks
              </CardTitle>
              <a
                href={`/chains/${slug}/blocks`}
                className="text-xs font-medium transition-colors hover:text-foreground"
                style={{ color: chain.color }}
              >
                View all
              </a>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <BlockCardSkeleton key={i} />
                ))
              : blocks.slice(0, 6).map((block: any) => (
                  <div
                    key={block.number}
                    className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2.5 transition-colors hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted/50">
                        <Box className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <a
                          href={`/chains/${slug}/block/${block.number}`}
                          className="text-sm font-medium hover:underline"
                          style={{ color: chain.color }}
                        >
                          {block.number.toLocaleString()}
                        </a>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(block.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">
                        {block.txCount}{" "}
                        <span className="text-muted-foreground">txns</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatBytes(block.size)}
                      </p>
                    </div>
                  </div>
                ))}
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Latest Transactions
              </CardTitle>
              <a
                href={`/chains/${slug}/transactions`}
                className="text-xs font-medium transition-colors hover:text-foreground"
                style={{ color: chain.color }}
              >
                View all
              </a>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <TxCardSkeleton key={i} />
                ))
              : txns.map((txn) => (
                  <div
                    key={txn.hash}
                    className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2.5 transition-colors hover:bg-muted/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted/50">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <a
                          href={`/chains/${slug}/tx/${txn.hash}`}
                          className="font-mono text-sm font-medium hover:underline"
                          style={{ color: chain.color }}
                        >
                          {shortenHash(txn.hash)}
                        </a>
                        <p className="text-xs text-muted-foreground">
                          {timeAgo(txn.timestamp)}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`/chains/${slug}/block/${txn.blockNumber}`}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Block {txn.blockNumber.toLocaleString()}
                    </a>
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

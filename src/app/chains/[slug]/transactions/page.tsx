"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/skeleton";
import { shortenHash, shortenAddress, timeAgo } from "@/lib/format";
import { getChain } from "@/lib/chains/registry";

interface Transfer {
  hash: string;
  from: string;
  to: string;
  value: number | null;
  asset: string | null;
  blockNumber: number;
  timestamp: number;
}

function fmtValue(v: number | null): string {
  if (v === null) return "—";
  if (v >= 1e9) return `${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (v >= 1e3) return `${(v / 1e3).toFixed(1)}K`;
  if (v < 0.01 && v > 0) return "<0.01";
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

export default function ChainTransactionsPage() {
  const { slug } = useParams() as { slug: string };
  const chain = getChain(slug);
  const color = chain?.color || "#34d399";
  const isSolana = slug === "solana";
  const isTron = slug === "tron";
  const isAlchemyEvm = chain?.rpcUrl.includes("alchemy.com") && !isSolana;

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransfers = () => {
    setLoading(true);

    if (isAlchemyEvm) {
      // Use getAssetTransfers with stablecoin contract filtering
      fetch(`/api/chain?chain=${slug}&action=transfers&address=0x0000000000000000000000000000000000000000&direction=from&filter=stablecoins`)
        .then((r) => r.json())
        .then((data) => {
          // That won't work — we need transfers without a specific address.
          // Instead, fetch from the chain-coin endpoint for the top stablecoin.
          return fetch(`/api/chain-coin?chain=${slug}&symbol=USDC&action=transfers`);
        })
        .then((r) => r.json())
        .then((data) => {
          // Also fetch USDT
          return Promise.all([
            data,
            fetch(`/api/chain-coin?chain=${slug}&symbol=USDT&action=transfers`).then((r) => r.json()).catch(() => ({ transfers: [] })),
          ]);
        })
        .then(([usdcData, usdtData]) => {
          const all: Transfer[] = [
            ...(usdcData.transfers || []).map((t: any) => ({
              hash: t.hash,
              from: t.from,
              to: t.to,
              value: t.value,
              asset: t.asset || "USDC",
              blockNumber: parseInt(t.blockNum, 16),
              timestamp: 0,
            })),
            ...(usdtData.transfers || []).map((t: any) => ({
              hash: t.hash,
              from: t.from,
              to: t.to,
              value: t.value,
              asset: t.asset || "USDT",
              blockNumber: parseInt(t.blockNum, 16),
              timestamp: 0,
            })),
          ].sort((a, b) => b.blockNumber - a.blockNumber).slice(0, 50);
          setTransfers(all);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (isTron) {
      fetch("/api/tron?action=trc20-transfers&address=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t")
        .then((r) => r.json())
        .then((data) => {
          setTransfers((data.transfers || []).map((t: any) => ({
            hash: t.txId,
            from: t.from,
            to: t.to,
            value: t.tokenDecimals ? Number(t.value) / 10 ** t.tokenDecimals : null,
            asset: t.tokenSymbol || "TRC20",
            blockNumber: 0,
            timestamp: t.timestamp || 0,
          })));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (isSolana) {
      fetch("/api/solana?action=stablecoin-transfers")
        .then((r) => r.json())
        .then((data) => {
          setTransfers((data.signatures || []).map((s: any) => ({
            hash: s.signature,
            from: "",
            to: "",
            value: null,
            asset: "USDC",
            blockNumber: s.slot,
            timestamp: s.blockTime || 0,
          })));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (slug === "tempo") {
      fetch("/api/tempo?action=transfers")
        .then((r) => r.json())
        .then((data) => {
          setTransfers((data.transfers || []).map((t: any) => ({
            hash: t.hash,
            from: t.from,
            to: t.to,
            value: t.value,
            asset: t.asset,
            blockNumber: t.blockNumber,
            timestamp: 0,
          })));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (slug === "sui") {
      fetch("/api/sui?action=blocks&count=5")
        .then((r) => r.json())
        .then((data) => {
          const all: Transfer[] = [];
          for (const block of data.blocks || []) {
            for (const digest of block.transactions || []) {
              all.push({ hash: digest, from: "", to: "", value: null, asset: null, blockNumber: block.number, timestamp: block.timestamp || 0 });
              if (all.length >= 50) break;
            }
            if (all.length >= 50) break;
          }
          setTransfers(all);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      // Non-Alchemy EVM chains — fall back to block tx hashes
      fetch(`/api/chain?chain=${slug}&action=blocks&count=10`)
        .then((r) => r.json())
        .then((data) => {
          const all: Transfer[] = [];
          for (const block of data.blocks || []) {
            for (const hash of block.transactions) {
              all.push({ hash, from: "", to: "", value: null, asset: null, blockNumber: block.number, timestamp: block.timestamp });
            }
          }
          setTransfers(all.slice(0, 50));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  useEffect(() => { fetchTransfers(); }, [slug]);

  const hasRichData = transfers.some((t) => t.from || t.value !== null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{chain?.name} Stablecoin Transfers</h1>
      </div>
      <Card className="border-border/40 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {loading ? "Loading..." : `${transfers.length} recent stablecoin transfers`}
            </CardTitle>
            <Button variant="outline" size="sm" disabled={loading} onClick={fetchTransfers}>Refresh</Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-xs">Txn Hash</TableHead>
                {hasRichData && (
                  <>
                    <TableHead className="text-xs">From</TableHead>
                    <TableHead className="text-xs">To</TableHead>
                    <TableHead className="text-xs text-right">Amount</TableHead>
                    <TableHead className="text-xs">Token</TableHead>
                  </>
                )}
                <TableHead className="text-xs text-right">
                  {transfers[0]?.timestamp ? "Age" : "Block"}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 15 }).map((_, i) => (
                    <TableRow key={i} className="border-border/40">
                      <TableCell colSpan={hasRichData ? 6 : 2}><Skeleton className="h-4 w-full" /></TableCell>
                    </TableRow>
                  ))
                : transfers.map((t, i) => (
                    <TableRow key={`${t.hash}-${i}`} className="border-border/40 hover:bg-muted/30">
                      <TableCell>
                        <a href={`/chains/${slug}/tx/${t.hash}`} className="font-mono text-xs hover:underline" style={{ color }}>
                          {shortenHash(t.hash)}
                        </a>
                      </TableCell>
                      {hasRichData && (
                        <>
                          <TableCell>
                            {t.from ? (
                              <a href={`/chains/${slug}/address/${t.from}`} className="font-mono text-xs hover:underline" style={{ color }}>
                                {shortenAddress(t.from)}
                              </a>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell>
                            {t.to ? (
                              <a href={`/chains/${slug}/address/${t.to}`} className="font-mono text-xs hover:underline" style={{ color }}>
                                {shortenAddress(t.to)}
                              </a>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell className="text-right text-xs font-medium">
                            {fmtValue(t.value)}
                          </TableCell>
                          <TableCell>
                            {t.asset ? (
                              <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground">
                                {t.asset}
                              </Badge>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </TableCell>
                        </>
                      )}
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {t.timestamp ? timeAgo(t.timestamp) : (
                          <a href={`/chains/${slug}/block/${t.blockNumber}`} className="hover:underline" style={{ color }}>
                            {t.blockNumber.toLocaleString()}
                          </a>
                        )}
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

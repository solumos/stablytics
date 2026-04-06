"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/skeleton";
import { shortenHash, timeAgo } from "@/lib/format";
import { getChain } from "@/lib/chains/registry";

export default function ChainTransactionsPage() {
  const { slug } = useParams() as { slug: string };
  const chain = getChain(slug);
  const isSolana = slug === "solana";
  const [txns, setTxns] = useState<{ hash: string; blockNumber: number; timestamp: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTxns = () => {
    setLoading(true);
    if (isSolana) {
      fetch("/api/solana?action=stablecoin-transfers")
        .then((r) => r.json())
        .then((data) => {
          setTxns((data.signatures || []).map((s: any) => ({
            hash: s.signature,
            blockNumber: s.slot,
            timestamp: s.blockTime || 0,
          })));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (slug === "tron") {
      // Tron: fetch blocks with transactions from API
      fetch("/api/tron?action=blocks&count=5")
        .then((r) => r.json())
        .then(async (data) => {
          // Blocks from the list endpoint don't include tx details,
          // so we fetch the latest block with txns
          const latest = data.blocks?.[0];
          if (!latest) { setLoading(false); return; }
          const blockData = await fetch(`/api/tron?action=block&num=${latest.number}`).then((r) => r.json());
          const all: typeof txns = [];
          for (const tx of blockData.transactions || []) {
            all.push({ hash: tx.txID, blockNumber: latest.number, timestamp: tx.timestamp || latest.timestamp });
          }
          setTxns(all.slice(0, 50));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (slug === "sui") {
      fetch("/api/sui?action=blocks&count=5")
        .then((r) => r.json())
        .then((data) => {
          const all: typeof txns = [];
          for (const block of data.blocks || []) {
            for (const digest of block.transactions || []) {
              all.push({ hash: digest, blockNumber: block.number, timestamp: block.timestamp || 0 });
              if (all.length >= 50) break;
            }
            if (all.length >= 50) break;
          }
          setTxns(all);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      fetch(`/api/chain?chain=${slug}&action=blocks&count=10`)
        .then((r) => r.json())
        .then((data) => {
          const all: typeof txns = [];
          for (const block of data.blocks || []) {
            for (const hash of block.transactions) {
              all.push({ hash, blockNumber: block.number, timestamp: block.timestamp });
            }
          }
          setTxns(all.slice(0, 50));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  };

  useEffect(() => { fetchTxns(); }, [slug, isSolana]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{chain?.name} Stablecoin Transfers</h1>
      </div>
      <Card className="border-border/40 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {loading ? "Loading..." : `${txns.length} transactions from recent blocks`}
            </CardTitle>
            <Button variant="outline" size="sm" disabled={loading} onClick={fetchTxns}>Latest</Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-xs">Txn Hash</TableHead>
                <TableHead className="text-xs">Block</TableHead>
                <TableHead className="text-xs text-right">Age</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 20 }).map((_, i) => (
                    <TableRow key={i} className="border-border/40">
                      <TableCell colSpan={3}><Skeleton className="h-4 w-full" /></TableCell>
                    </TableRow>
                  ))
                : txns.map((tx) => (
                    <TableRow key={tx.hash} className="border-border/40 hover:bg-muted/30">
                      <TableCell>
                        <a href={`/chains/${slug}/tx/${tx.hash}`} className="font-mono text-xs hover:underline" style={{ color: chain?.color }}>
                          {shortenHash(tx.hash)}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a href={`/chains/${slug}/block/${tx.blockNumber}`} className="text-xs hover:underline" style={{ color: chain?.color }}>
                          {tx.blockNumber.toLocaleString()}
                        </a>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">{timeAgo(tx.timestamp)}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/skeleton";
import { timeAgo, formatGasUsage, shortenAddress } from "@/lib/format";
import { getChain } from "@/lib/chains/registry";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ChainBlocksPage() {
  const { slug } = useParams() as { slug: string };
  const chain = getChain(slug);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [latestBlock, setLatestBlock] = useState(0);

  const fetchBlocks = useCallback((before?: number) => {
    setLoading(true);
    const url = before
      ? `/api/chain?chain=${slug}&action=blocks&count=25&before=${before}`
      : `/api/chain?chain=${slug}&action=blocks&count=25`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => { setBlocks(data.blocks || []); setLatestBlock(data.latestBlock); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug]);

  useEffect(() => { fetchBlocks(); }, [fetchBlocks]);

  const oldest = blocks.length ? blocks[blocks.length - 1].number : 0;
  const newest = blocks.length ? blocks[0].number : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{chain?.name} Blocks</h1>
      </div>
      <Card className="border-border/40 bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {latestBlock > 0 ? `Block #${latestBlock.toLocaleString()} is latest` : "Loading..."}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={newest >= latestBlock || loading} onClick={() => fetchBlocks()}>Latest</Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={newest >= latestBlock || loading} onClick={() => fetchBlocks(newest + 26)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" disabled={loading} onClick={() => fetchBlocks(oldest)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-xs">Block</TableHead>
                <TableHead className="text-xs">Age</TableHead>
                <TableHead className="text-xs text-right">Txns</TableHead>
                <TableHead className="text-xs">Validator</TableHead>
                <TableHead className="text-xs text-right">Gas Used</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 15 }).map((_, i) => (
                    <TableRow key={i} className="border-border/40">
                      <TableCell colSpan={5}><Skeleton className="h-4 w-full" /></TableCell>
                    </TableRow>
                  ))
                : blocks.map((block: any) => (
                    <TableRow key={block.number} className="border-border/40 hover:bg-muted/30">
                      <TableCell>
                        <a href={`/chains/${slug}/block/${block.number}`} className="text-sm font-medium hover:underline" style={{ color: chain?.color }}>
                          {block.number.toLocaleString()}
                        </a>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{timeAgo(block.timestamp)}</TableCell>
                      <TableCell className="text-right text-sm">{block.txCount}</TableCell>
                      <TableCell>
                        <a href={`/chains/${slug}/address/${block.miner}`} className="font-mono text-xs hover:underline" style={{ color: chain?.color }}>
                          {shortenAddress(block.miner)}
                        </a>
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {formatGasUsage(BigInt(block.gasUsed), BigInt(block.gasLimit)).toFixed(1)}%
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

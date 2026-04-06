"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DetailRowSkeleton, PageHeaderSkeleton } from "@/components/skeleton";
import { formatTimestamp, timeAgo, formatGasUsage, formatGwei } from "@/lib/format";
import { getChain } from "@/lib/chains/registry";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ChainBlockDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const blockNumber = params.number as string;
  const chain = getChain(slug);
  const [block, setBlock] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/chain?chain=${slug}&action=blocks&count=1&before=${parseInt(blockNumber) + 1}`)
      .then((r) => r.json())
      .then((data) => { setBlock(data.blocks?.[0] || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug, blockNumber]);

  if (loading) return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeaderSkeleton />
      <div className="rounded-lg border border-border/40 bg-card/50">
        {Array.from({ length: 8 }).map((_, i) => <DetailRowSkeleton key={i} />)}
      </div>
    </div>
  );

  if (!block) return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Block Not Found</h1>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => window.location.href = `/chains/${slug}/block/${block.number - 1}`}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Block #{block.number.toLocaleString()}</h1>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => window.location.href = `/chains/${slug}/block/${block.number + 1}`}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Finalized</Badge>
      </div>
      <Card className="border-border/40 bg-card/50">
        <CardContent className="divide-y divide-border/40 p-0">
          {([
            ["Block Height", block.number.toLocaleString()],
            ["Timestamp", `${formatTimestamp(block.timestamp)} (${timeAgo(block.timestamp)})`],
            ["Transactions", `${block.txCount} transactions`],
            ["Validator", <a key="m" href={`/chains/${slug}/address/${block.miner}`} className="font-mono hover:underline" style={{ color: chain?.color }}>{block.miner}</a>],
            ["Gas Used", `${BigInt(block.gasUsed).toLocaleString()} (${formatGasUsage(BigInt(block.gasUsed), BigInt(block.gasLimit)).toFixed(2)}%)`],
            ["Gas Limit", BigInt(block.gasLimit).toLocaleString()],
            ["Base Fee", formatGwei(BigInt(block.baseFeePerGas))],
            ["Hash", <span key="h" className="font-mono text-xs break-all">{block.hash}</span>],
            ["Parent Hash", <a key="p" href={`/chains/${slug}/block/${block.number - 1}`} className="font-mono text-xs break-all hover:underline" style={{ color: chain?.color }}>{block.parentHash}</a>],
          ] as [string, React.ReactNode][]).map(([label, value]) => (
            <div key={label} className="flex gap-4 px-6 py-3.5">
              <span className="w-36 shrink-0 text-sm text-muted-foreground">{label}</span>
              <span className="text-sm">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      {block.transactions?.length > 0 && (
        <Card className="mt-6 border-border/40 bg-card/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Transactions ({block.transactions.length})</CardTitle></CardHeader>
          <CardContent className="px-0 pb-0">
            <Table>
              <TableHeader><TableRow className="border-border/40"><TableHead className="text-xs w-12">#</TableHead><TableHead className="text-xs">Hash</TableHead></TableRow></TableHeader>
              <TableBody>
                {block.transactions.map((hash: string, i: number) => (
                  <TableRow key={hash} className="border-border/40 hover:bg-muted/30">
                    <TableCell className="text-xs text-muted-foreground">{i}</TableCell>
                    <TableCell><a href={`/chains/${slug}/tx/${hash}`} className="font-mono text-xs hover:underline" style={{ color: chain?.color }}>{hash}</a></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

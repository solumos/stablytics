"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DetailRowSkeleton, PageHeaderSkeleton } from "@/components/skeleton";
import { formatTimestamp, timeAgo, formatEther, formatGwei } from "@/lib/format";
import { getChain } from "@/lib/chains/registry";
import { CheckCircle, XCircle, Copy, Check } from "lucide-react";

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="ml-2 inline-flex text-muted-foreground hover:text-foreground">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function ChainTxDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const hash = params.hash as string;
  const chain = getChain(slug);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tempoEnrich, setTempoEnrich] = useState<{
    lane?: string;
    functionName?: string;
    feeTokenSymbol?: string;
    feeTokenDecimals?: number;
    targetTokenSymbol?: string;
  } | null>(null);

  useEffect(() => {
    fetch(`/api/chain?chain=${slug}&action=tx&hash=${hash}`)
      .then((r) => r.json())
      .then(async (d) => {
        if (d.error) { setError(d.error); setLoading(false); return; }
        setData(d);
        // Fetch Tempo enrichments
        if (slug === "tempo") {
          try {
            const enriched = await fetch(`/api/tempo?action=tx-enriched&hash=${hash}`).then((r) => r.json());
            if (!enriched.error) setTempoEnrich(enriched);
          } catch {}
        }
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [slug, hash]);

  if (loading) return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeaderSkeleton />
      <div className="rounded-lg border border-border/40 bg-card/50">
        {Array.from({ length: 10 }).map((_, i) => <DetailRowSkeleton key={i} />)}
      </div>
    </div>
  );

  if (error || !data) return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Transaction Not Found</h1>
      <p className="mt-2 text-muted-foreground">{error}</p>
    </div>
  );

  const { tx, receipt, block } = data;
  const txFee = BigInt(receipt.gasUsed) * BigInt(receipt.effectiveGasPrice);
  const color = chain?.color || "#34d399";
  const types: Record<number, string> = { 0: "Legacy", 1: "Access List", 2: "EIP-1559", 118: "Tempo" };

  const rows: [string, React.ReactNode][] = [
    ["Hash", <span key="h" className="font-mono text-xs break-all">{tx.hash}<CopyBtn text={tx.hash} /></span>],
    ["Status", <div key="s" className="flex items-center gap-2">
      {receipt.status
        ? <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><CheckCircle className="mr-1 h-3 w-3" />Success</Badge>
        : <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20"><XCircle className="mr-1 h-3 w-3" />Failed</Badge>}
      {tempoEnrich?.lane && (
        <Badge variant="outline" className={tempoEnrich.lane === "payment" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}>
          {tempoEnrich.lane === "payment" ? "Payment Lane" : tempoEnrich.lane === "system" ? "System" : "General Lane"}
        </Badge>
      )}
    </div>],
    ["Block", <a key="b" href={`/chains/${slug}/block/${block.number}`} className="hover:underline" style={{ color }}>{block.number.toLocaleString()}</a>],
    ["Timestamp", `${formatTimestamp(block.timestamp)} (${timeAgo(block.timestamp)})`],
    ["From", <span key="f"><a href={`/chains/${slug}/address/${tx.from}`} className="font-mono text-xs break-all hover:underline" style={{ color }}>{tx.from}</a><CopyBtn text={tx.from} /></span>],
    ["To", tx.to
      ? <span key="t"><a href={`/chains/${slug}/address/${tx.to}`} className="font-mono text-xs break-all hover:underline" style={{ color }}>{tx.to}</a><CopyBtn text={tx.to} /></span>
      : receipt.contractAddress
        ? <span key="t">Contract: <a href={`/chains/${slug}/address/${receipt.contractAddress}`} className="font-mono text-xs hover:underline" style={{ color }}>{receipt.contractAddress}</a></span>
        : "Contract Creation"
    ],
    ["Value", `${formatEther(BigInt(tx.value))} ${chain?.nativeSymbol || "ETH"}`],
    ["Fee", tempoEnrich?.feeTokenSymbol
      ? `$${(Number(txFee) / 10 ** (tempoEnrich.feeTokenDecimals || 6)).toFixed(6)} ${tempoEnrich.feeTokenSymbol}`
      : `${formatEther(txFee)} ${chain?.nativeSymbol || "ETH"}`],
    ...(tempoEnrich?.functionName ? [["Action", tempoEnrich.functionName] as [string, React.ReactNode]] : []),
    ...(tempoEnrich?.targetTokenSymbol ? [["Token", tempoEnrich.targetTokenSymbol] as [string, React.ReactNode]] : []),
    ["Gas Price", formatGwei(BigInt(tx.gasPrice))],
    ["Gas", `${BigInt(receipt.gasUsed).toLocaleString()} / ${BigInt(tx.gas).toLocaleString()}`],
    ["Nonce", tx.nonce.toString()],
    ["Type", <Badge key="ty" variant="outline" className="text-xs border-border/50">{types[tx.type] || `Type ${tx.type}`}</Badge>],
  ];

  if (receipt.feeToken) rows.push(["Fee Token", <a key="ft" href={`/chains/${slug}/address/${receipt.feeToken}`} className="font-mono text-xs hover:underline" style={{ color }}>{receipt.feeToken}</a>]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">Transaction Details</h1>
      <Card className="border-border/40 bg-card/50">
        <CardContent className="divide-y divide-border/40 p-0">
          {rows.map(([label, value]) => (
            <div key={label as string} className="flex gap-4 px-6 py-3.5">
              <span className="w-40 shrink-0 text-sm text-muted-foreground">{label}</span>
              <span className="min-w-0 text-sm">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      {receipt.logs?.length > 0 && (
        <Card className="mt-6 border-border/40 bg-card/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Logs ({receipt.logs.length})</CardTitle></CardHeader>
          <CardContent><pre className="max-h-80 overflow-auto rounded-lg bg-muted/30 p-4 text-xs font-mono">{JSON.stringify(receipt.logs, null, 2)}</pre></CardContent>
        </Card>
      )}
    </div>
  );
}

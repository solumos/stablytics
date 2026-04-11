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

function SuccessBadge() {
  return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><CheckCircle className="mr-1 h-3 w-3" />Success</Badge>;
}

function FailedBadge() {
  return <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20"><XCircle className="mr-1 h-3 w-3" />Failed</Badge>;
}

function AddressLink({ address, slug, color }: { address: string; slug: string; color: string }) {
  return (
    <span>
      <a href={`/chains/${slug}/address/${address}`} className="font-mono text-xs break-all hover:underline" style={{ color }}>{address}</a>
      <CopyBtn text={address} />
    </span>
  );
}

function buildTronRows(data: any, slug: string, color: string): [string, React.ReactNode][] {
  const rows: [string, React.ReactNode][] = [
    ["Transaction ID", <span key="h" className="font-mono text-xs break-all">{data.txID}<CopyBtn text={data.txID} /></span>],
    ["Status", <div key="s" className="flex items-center gap-2">
      {data.result === "SUCCESS" ? <SuccessBadge /> : data.confirmed ? <SuccessBadge /> : <FailedBadge />}
      <Badge variant="outline" className="text-xs border-border/50">{data.type}</Badge>
    </div>],
  ];
  if (data.blockNumber) {
    rows.push(["Block", <a key="b" href={`/chains/${slug}/block/${data.blockNumber}`} className="hover:underline" style={{ color }}>{data.blockNumber.toLocaleString()}</a>]);
  }
  if (data.timestamp) {
    rows.push(["Timestamp", `${formatTimestamp(data.timestamp)} (${timeAgo(data.timestamp)})`]);
  }
  if (data.from) {
    rows.push(["From", <AddressLink key="f" address={data.from} slug={slug} color={color} />]);
  }
  if (data.to) {
    rows.push(["To", <AddressLink key="t" address={data.to} slug={slug} color={color} />]);
  }
  if (data.amount != null) {
    rows.push(["Amount", `${data.amount} TRX`]);
  }
  rows.push(["Fee", `${data.fee} TRX`]);
  if (data.energyUsage > 0 || data.energyFee > 0) {
    rows.push(["Energy Used", data.energyUsage.toLocaleString()]);
    rows.push(["Energy Fee", `${data.energyFee} TRX`]);
  }
  if (data.netUsage > 0 || data.netFee > 0) {
    rows.push(["Bandwidth", `${data.netUsage.toLocaleString()} bytes`]);
    rows.push(["Bandwidth Fee", `${data.netFee} TRX`]);
  }
  return rows;
}

function buildSolanaRows(data: any, slug: string, color: string): [string, React.ReactNode][] {
  const rows: [string, React.ReactNode][] = [
    ["Signature", <span key="h" className="font-mono text-xs break-all">{data.signature}<CopyBtn text={data.signature} /></span>],
    ["Status", data.status === "success" ? <SuccessBadge key="s" /> : <FailedBadge key="s" />],
    ["Slot", <a key="b" href={`/chains/${slug}/block/${data.slot}`} className="hover:underline" style={{ color }}>{data.slot.toLocaleString()}</a>],
  ];
  if (data.blockTime) {
    rows.push(["Block Time", `${formatTimestamp(data.blockTime)} (${timeAgo(data.blockTime)})`]);
  }
  rows.push(["Fee", `${(data.fee / 1e9).toFixed(6)} SOL`]);
  if (data.accounts?.length > 0) {
    rows.push(["From (signer)", <AddressLink key="from" address={data.accounts[0]} slug={slug} color={color} />]);
    if (data.accounts.length > 1) {
      rows.push(["Accounts", <div key="accts" className="flex flex-col gap-1">
        {data.accounts.slice(1, 6).map((a: string, i: number) => (
          <AddressLink key={i} address={a} slug={slug} color={color} />
        ))}
        {data.accounts.length > 6 && <span className="text-xs text-muted-foreground">+{data.accounts.length - 6} more</span>}
      </div>]);
    }
  }
  return rows;
}

function buildEvmRows(
  data: any,
  tempoEnrich: any,
  slug: string,
  color: string,
  chain: any
): [string, React.ReactNode][] {
  const { tx, receipt, block } = data;
  const txFee = BigInt(receipt.gasUsed) * BigInt(receipt.effectiveGasPrice);
  const types: Record<number, string> = { 0: "Legacy", 1: "Access List", 2: "EIP-1559", 118: "Tempo" };

  const rows: [string, React.ReactNode][] = [
    ["Hash", <span key="h" className="font-mono text-xs break-all">{tx.hash}<CopyBtn text={tx.hash} /></span>],
    ["Status", <div key="s" className="flex items-center gap-2">
      {receipt.status ? <SuccessBadge /> : <FailedBadge />}
      {tempoEnrich?.lane && (
        <Badge variant="outline" className={tempoEnrich.lane === "payment" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}>
          {tempoEnrich.lane === "payment" ? "Payment Lane" : tempoEnrich.lane === "system" ? "System" : "General Lane"}
        </Badge>
      )}
    </div>],
    ["Block", <a key="b" href={`/chains/${slug}/block/${block.number}`} className="hover:underline" style={{ color }}>{block.number.toLocaleString()}</a>],
    ["Timestamp", `${formatTimestamp(block.timestamp)} (${timeAgo(block.timestamp)})`],
    ["From", <AddressLink key="f" address={tx.from} slug={slug} color={color} />],
    ["To", tx.to
      ? <AddressLink key="t" address={tx.to} slug={slug} color={color} />
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

  return rows;
}

export default function ChainTxDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const hash = params.hash as string;
  const chain = getChain(slug);
  const isTron = slug === "tron";
  const isSolana = slug === "solana";
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
    let url: string;
    if (isTron) {
      url = `/api/tron?action=tx&txId=${hash}`;
    } else if (isSolana) {
      url = `/api/solana?action=tx&signature=${hash}`;
    } else {
      url = `/api/chain?chain=${slug}&action=tx&hash=${hash}`;
    }

    fetch(url)
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
  }, [slug, hash, isTron, isSolana]);

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

  const color = chain?.color || "#34d399";

  let rows: [string, React.ReactNode][];
  if (isTron) {
    rows = buildTronRows(data, slug, color);
  } else if (isSolana) {
    rows = buildSolanaRows(data, slug, color);
  } else {
    rows = buildEvmRows(data, tempoEnrich, slug, color, chain);
  }

  const showEvmLogs = !isTron && !isSolana && data.receipt?.logs?.length > 0;
  const showSolanaLogs = isSolana && data.logMessages?.length > 0;

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
      {showEvmLogs && (
        <Card className="mt-6 border-border/40 bg-card/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Logs ({data.receipt.logs.length})</CardTitle></CardHeader>
          <CardContent><pre className="max-h-80 overflow-auto rounded-lg bg-muted/30 p-4 text-xs font-mono">{JSON.stringify(data.receipt.logs, null, 2)}</pre></CardContent>
        </Card>
      )}
      {showSolanaLogs && (
        <Card className="mt-6 border-border/40 bg-card/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Log Messages ({data.logMessages.length})</CardTitle></CardHeader>
          <CardContent><pre className="max-h-80 overflow-auto rounded-lg bg-muted/30 p-4 text-xs font-mono">{data.logMessages.join("\n")}</pre></CardContent>
        </Card>
      )}
    </div>
  );
}

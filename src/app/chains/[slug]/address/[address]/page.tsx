"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCardSkeleton, PageHeaderSkeleton } from "@/components/skeleton";
import { Copy, Check } from "lucide-react";
import { formatEther } from "@/lib/format";
import { getChain } from "@/lib/chains/registry";

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="ml-2 inline-flex text-muted-foreground hover:text-foreground">
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function ChainAddressPage() {
  const params = useParams();
  const slug = params.slug as string;
  const address = params.address as string;
  const chain = getChain(slug);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/chain?chain=${slug}&action=address&address=${address}`)
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [slug, address]);

  if (loading) return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageHeaderSkeleton />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><MetricCardSkeleton /><MetricCardSkeleton /><MetricCardSkeleton /></div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{data?.isContract ? "Contract" : "Address"}</h1>
          {data?.isContract && <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">Contract</Badge>}
        </div>
        <p className="mt-1 flex items-center font-mono text-sm text-muted-foreground">{address}<CopyBtn text={address} /></p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Balance</span>
            <p className="mt-1 text-lg font-bold">{data ? formatEther(BigInt(data.balance)) : "0"} {chain?.nativeSymbol}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Transactions</span>
            <p className="mt-1 text-lg font-bold">{data?.txCount?.toLocaleString() || "0"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Chain</span>
            <p className="mt-1 text-lg font-bold">{chain?.name}</p>
            <p className="text-xs text-muted-foreground">ID: {chain?.chainId}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

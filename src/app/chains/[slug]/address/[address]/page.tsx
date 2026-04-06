"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MetricCardSkeleton,
  PageHeaderSkeleton,
  Skeleton,
} from "@/components/skeleton";
import { Copy, Check, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatEther, shortenAddress, shortenHash } from "@/lib/format";
import { getChain } from "@/lib/chains/registry";

interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  logo?: string;
}

interface Transfer {
  blockNum: string;
  hash: string;
  from: string;
  to: string;
  value: number | null;
  asset: string | null;
  category: string;
}

interface AddressData {
  address: string;
  balance: string;
  isContract: boolean;
  txCount: number;
  nativeSymbol: string;
  tokenBalances: TokenBalance[];
}

function formatTokenBalance(hex: string, decimals: number): string {
  const raw = BigInt(hex);
  const divisor = 10 ** decimals;
  const num = Number(raw) / divisor;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  if (num < 0.01 && num > 0) return `<0.01`;
  return num.toFixed(2);
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="ml-2 inline-flex text-muted-foreground hover:text-foreground"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

export default function ChainAddressPage() {
  const params = useParams();
  const slug = params.slug as string;
  const address = params.address as string;
  const chain = getChain(slug);
  const color = chain?.color || "#34d399";

  const [data, setData] = useState<AddressData | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [transfersLoading, setTransfersLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/chain?chain=${slug}&action=address&address=${address}`)
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(
      `/api/chain?chain=${slug}&action=transfers&address=${address}&direction=both`
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.transfers) setTransfers(d.transfers);
        setTransfersLoading(false);
      })
      .catch(() => setTransfersLoading(false));
  }, [slug, address]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCardSkeleton />
          <MetricCardSkeleton />
          <MetricCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            {data?.isContract ? "Contract" : "Address"}
          </h1>
          {data?.isContract && (
            <Badge
              variant="outline"
              className="bg-blue-500/10 text-blue-400 border-blue-500/20"
            >
              Contract
            </Badge>
          )}
        </div>
        <p className="mt-1 flex items-center font-mono text-sm text-muted-foreground">
          {address}
          <CopyBtn text={address} />
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Balance</span>
            <p className="mt-1 text-lg font-bold">
              {data ? formatEther(BigInt(data.balance)) : "0"}{" "}
              {chain?.nativeSymbol}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Transactions</span>
            <p className="mt-1 text-lg font-bold">
              {data?.txCount?.toLocaleString() || "0"}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">
              Token Holdings
            </span>
            <p className="mt-1 text-lg font-bold">
              {data?.tokenBalances?.length || 0} tokens
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Token Balances */}
      {data?.tokenBalances && data.tokenBalances.length > 0 && (
        <Card className="border-border/40 bg-card/50 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Token Balances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.tokenBalances.map((t) => (
              <div
                key={t.contractAddress}
                className="flex items-center justify-between rounded-lg border border-border/30 px-4 py-2.5 hover:bg-muted/20"
              >
                <div className="flex items-center gap-3">
                  {t.logo ? (
                    <img
                      src={t.logo}
                      alt={t.symbol || ""}
                      className="h-7 w-7 rounded-full"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-muted/50" />
                  )}
                  <div>
                    <span className="text-sm font-medium">
                      {t.symbol || shortenAddress(t.contractAddress)}
                    </span>
                    {t.name && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {t.name}
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {t.decimals
                    ? formatTokenBalance(t.tokenBalance, t.decimals)
                    : "—"}{" "}
                  <span className="text-muted-foreground">
                    {t.symbol || ""}
                  </span>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card className="border-border/40 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recent Transfers
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-xs">Txn Hash</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">From / To</TableHead>
                <TableHead className="text-xs text-right">Value</TableHead>
                <TableHead className="text-xs">Asset</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfersLoading
                ? Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i} className="border-border/40">
                      <TableCell colSpan={5}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                : transfers.length === 0
                  ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-sm text-muted-foreground py-8"
                      >
                        No transfers found
                      </TableCell>
                    </TableRow>
                  )
                  : transfers.map((t, i) => {
                      const isSent =
                        t.from.toLowerCase() === address.toLowerCase();
                      return (
                        <TableRow
                          key={`${t.hash}-${i}`}
                          className="border-border/40 hover:bg-muted/30"
                        >
                          <TableCell>
                            <a
                              href={`/chains/${slug}/tx/${t.hash}`}
                              className="font-mono text-xs hover:underline"
                              style={{ color }}
                            >
                              {shortenHash(t.hash)}
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${
                                isSent
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              }`}
                            >
                              {isSent ? (
                                <ArrowUpRight className="mr-0.5 h-2.5 w-2.5" />
                              ) : (
                                <ArrowDownRight className="mr-0.5 h-2.5 w-2.5" />
                              )}
                              {isSent ? "OUT" : "IN"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <a
                              href={`/chains/${slug}/address/${isSent ? t.to : t.from}`}
                              className="font-mono text-xs hover:underline"
                              style={{ color }}
                            >
                              {shortenAddress(isSent ? t.to : t.from)}
                            </a>
                          </TableCell>
                          <TableCell className="text-right text-xs font-medium">
                            {t.value !== null
                              ? t.value < 0.001
                                ? "<0.001"
                                : t.value.toLocaleString(undefined, {
                                    maximumFractionDigits: 4,
                                  })
                              : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {t.asset || t.category}
                          </TableCell>
                        </TableRow>
                      );
                    })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

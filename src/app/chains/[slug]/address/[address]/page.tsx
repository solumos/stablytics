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
import {
  Copy,
  Check,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  FileCode,
  ExternalLink,
  Coins,
} from "lucide-react";
import { formatEther, shortenAddress, shortenHash, formatBytes } from "@/lib/format";
import { getChain } from "@/lib/chains/registry";
import { getCoinLogo } from "@/lib/stablecoins/logos";

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

interface StablecoinInfo {
  symbol: string;
  name?: string;
  decimals?: number;
  logo?: string;
  issuerSlug?: string;
}

interface TokenMeta {
  name?: string;
  symbol?: string;
  decimals?: number;
  logo?: string;
}

interface AddressData {
  address: string;
  addressType: "stablecoin" | "contract" | "eoa";
  balance: string;
  isContract: boolean;
  txCount: number;
  codeSize: number;
  nativeSymbol: string;
  tokenBalances: TokenBalance[];
  stablecoinInfo: StablecoinInfo | null;
  tokenMeta: TokenMeta | null;
}

function formatTokenBalance(hex: string, decimals: number): string {
  const raw = BigInt(hex);
  const num = Number(raw) / 10 ** decimals;
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
  if (num < 0.01 && num > 0) return "<0.01";
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
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ── Stablecoin Contract View ──
function StablecoinView({
  data,
  slug,
  color,
}: {
  data: AddressData;
  slug: string;
  color: string;
}) {
  const info = data.stablecoinInfo!;
  const chain = getChain(slug);
  return (
    <>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Token</span>
            <div className="mt-1 flex items-center gap-2">
              {getCoinLogo(info.symbol) && <img src={getCoinLogo(info.symbol)!} alt={info.symbol} className="h-6 w-6 rounded-full" />}
              <p className="text-lg font-bold">{info.symbol}</p>
            </div>
            {info.name && <p className="text-xs text-muted-foreground">{info.name}</p>}
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Decimals</span>
            <p className="mt-1 text-lg font-bold">{info.decimals ?? "—"}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Transactions</span>
            <p className="mt-1 text-lg font-bold">{data.txCount.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Contract Size</span>
            <p className="mt-1 text-lg font-bold">{formatBytes(data.codeSize)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <a
          href={`/chains/${slug}/coins/${info.symbol.toLowerCase()}`}
          className="inline-flex items-center gap-2 rounded-lg border border-border/40 bg-card/50 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/30"
          style={{ color }}
        >
          <Coins className="h-4 w-4" />
          {info.symbol} on {chain?.name} Dashboard
          <ExternalLink className="h-3 w-3" />
        </a>
        <a
          href={`/coins/${info.symbol.toLowerCase()}`}
          className="inline-flex items-center gap-2 rounded-lg border border-border/40 bg-card/50 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/30"
        >
          {info.symbol} Global Overview
          <ExternalLink className="h-3 w-3" />
        </a>
        {info.issuerSlug && (
          <a
            href={`/issuers/${info.issuerSlug}`}
            className="inline-flex items-center gap-2 rounded-lg border border-border/40 bg-card/50 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/30"
          >
            <Shield className="h-4 w-4" />
            Issuer Details
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </>
  );
}

// ── Contract View ──
function ContractView({ data }: { data: AddressData }) {
  const meta = data.tokenMeta;
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
      {meta ? (
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Token</span>
            <div className="mt-1 flex items-center gap-2">
              {meta.symbol && getCoinLogo(meta.symbol) && <img src={getCoinLogo(meta.symbol)!} alt={meta.symbol} className="h-6 w-6 rounded-full" />}
              <p className="text-lg font-bold">{meta.symbol}</p>
            </div>
            {meta.name && <p className="text-xs text-muted-foreground">{meta.name}</p>}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Balance</span>
            <p className="mt-1 text-lg font-bold">
              {formatEther(BigInt(data.balance))} {data.nativeSymbol}
            </p>
          </CardContent>
        </Card>
      )}
      <Card className="border-border/40 bg-card/50">
        <CardContent className="p-5">
          <span className="text-xs text-muted-foreground">Transactions</span>
          <p className="mt-1 text-lg font-bold">{data.txCount.toLocaleString()}</p>
        </CardContent>
      </Card>
      <Card className="border-border/40 bg-card/50">
        <CardContent className="p-5">
          <span className="text-xs text-muted-foreground">Contract Size</span>
          <p className="mt-1 text-lg font-bold">{formatBytes(data.codeSize)}</p>
        </CardContent>
      </Card>
      {meta?.decimals !== undefined && (
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <span className="text-xs text-muted-foreground">Decimals</span>
            <p className="mt-1 text-lg font-bold">{meta.decimals}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── EOA View ──
function EoaView({ data, chainSlug }: { data: AddressData; chainSlug?: string }) {
  let balanceDisplay: string;
  if (chainSlug === "solana") {
    balanceDisplay = `${(Number(data.balance) / 1e9).toFixed(4)} SOL`;
  } else if (chainSlug === "tron") {
    balanceDisplay = `${(Number(data.balance) / 1e6).toFixed(2)} TRX`;
  } else {
    balanceDisplay = `${formatEther(BigInt(data.balance))} ${data.nativeSymbol}`;
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
      <Card className="border-border/40 bg-card/50">
        <CardContent className="p-5">
          <span className="text-xs text-muted-foreground">Balance</span>
          <p className="mt-1 text-lg font-bold">{balanceDisplay}</p>
        </CardContent>
      </Card>
      <Card className="border-border/40 bg-card/50">
        <CardContent className="p-5">
          <span className="text-xs text-muted-foreground">Transactions</span>
          <p className="mt-1 text-lg font-bold">{data.txCount.toLocaleString()}</p>
        </CardContent>
      </Card>
      <Card className="border-border/40 bg-card/50">
        <CardContent className="p-5">
          <span className="text-xs text-muted-foreground">Token Holdings</span>
          <p className="mt-1 text-lg font-bold">{data.tokenBalances.length} tokens</p>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Page ──
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

  const isSolana = slug === "solana";

  useEffect(() => {
    if (isSolana) {
      fetch(`/api/solana?action=address&address=${address}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.error) { setLoading(false); return; }
          const acct = d.account;
          const isToken = acct.isToken && acct.tokenInfo?.type === "mint";
          setData({
            address,
            addressType: isToken ? "stablecoin" : "eoa",
            balance: String(acct.lamports || 0),
            isContract: acct.executable,
            txCount: 0,
            codeSize: 0,
            nativeSymbol: "SOL",
            tokenBalances: (d.tokenBalances || []).map((t: any) => ({
              contractAddress: t.mint,
              tokenBalance: t.amount,
              symbol: undefined,
              name: undefined,
              decimals: t.decimals,
              logo: undefined,
            })),
            stablecoinInfo: isToken ? {
              symbol: acct.tokenInfo?.supply ? "Token" : "Unknown",
              decimals: acct.tokenInfo?.decimals,
            } : null,
            tokenMeta: null,
          });
          // Use signatures as pseudo-transfers
          const sigs = d.signatures || [];
          setTransfers(sigs.map((s: any) => ({
            blockNum: String(s.slot),
            hash: s.signature,
            from: address,
            to: "",
            value: null,
            asset: s.err ? "Failed" : "Transaction",
            category: "external",
          })));
          setTransfersLoading(false);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (slug === "tron") {
      // Fetch account info + TRC20 stablecoin transfers
      Promise.all([
        fetch(`/api/tron?action=address&address=${address}`).then((r) => r.json()),
        fetch(`/api/tron?action=trc20-transfers&address=${address}`).then((r) => r.json()),
      ])
        .then(([d, trc20Data]) => {
          if (d.error) { setLoading(false); return; }
          const acct = d.account;
          setData({
            address,
            addressType: acct.isContract ? "contract" : "eoa",
            balance: String(Math.round(acct.balance * 1e6)),
            isContract: acct.isContract,
            txCount: 0,
            codeSize: 0,
            nativeSymbol: "TRX",
            tokenBalances: (acct.trc20Balances || []).slice(0, 20).map((t: any) => ({
              contractAddress: t.address,
              tokenBalance: t.balance,
              decimals: 6,
            })),
            stablecoinInfo: null,
            tokenMeta: null,
          });
          // Use TRC20 transfers (stablecoin-specific) instead of general txns
          const trc20Transfers = trc20Data.transfers || [];
          setTransfers(trc20Transfers.map((t: any) => ({
            blockNum: "0",
            hash: t.txId,
            from: t.from,
            to: t.to,
            value: t.tokenDecimals ? Number(t.value) / 10 ** t.tokenDecimals : null,
            asset: t.tokenSymbol || "TRC20",
            category: "erc20",
          })));
          setTransfersLoading(false);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (slug === "ton") {
      fetch(`/api/ton?action=address&address=${address}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.error) { setLoading(false); return; }
          const acct = d.account;
          setData({
            address,
            addressType: "eoa",
            balance: acct.balance || "0",
            isContract: false,
            txCount: 0,
            codeSize: 0,
            nativeSymbol: "TON",
            tokenBalances: [],
            stablecoinInfo: null,
            tokenMeta: null,
          });
          setTransfers((d.transactions || []).map((t: any) => ({
            blockNum: "0",
            hash: t.hash || "",
            from: t.from || address,
            to: t.to || "",
            value: t.value ? Number(t.value) / 1e9 : null,
            asset: "TON",
            category: "external",
          })));
          setTransfersLoading(false);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else if (slug === "sui") {
      fetch(`/api/sui?action=address&address=${address}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.error) { setLoading(false); return; }
          const suiBalance = (d.balances || []).find((b: any) => b.coinType === "0x2::sui::SUI");
          setData({
            address,
            addressType: "eoa",
            balance: suiBalance?.totalBalance || "0",
            isContract: false,
            txCount: 0,
            codeSize: 0,
            nativeSymbol: "SUI",
            tokenBalances: (d.balances || [])
              .filter((b: any) => b.coinType !== "0x2::sui::SUI" && b.totalBalance !== "0")
              .map((b: any) => ({
                contractAddress: b.coinType,
                tokenBalance: b.totalBalance,
                symbol: b.coinType.split("::").pop() || "?",
                decimals: 9,
              })),
            stablecoinInfo: null,
            tokenMeta: null,
          });
          setTransfersLoading(false);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      fetch(`/api/chain?chain=${slug}&action=address&address=${address}`)
        .then((r) => r.json())
        .then(async (d) => {
          if (!d.error) {
            // For Tempo, supplement with TIP-20 token balances
            if (slug === "tempo" && (!d.tokenBalances || d.tokenBalances.length === 0)) {
              try {
                const tempoData = await fetch(`/api/tempo?action=address-tokens&address=${address}`).then((r) => r.json());
                if (tempoData.tokenBalances) {
                  d.tokenBalances = tempoData.tokenBalances.map((tb: any) => ({
                    contractAddress: tb.token.address,
                    tokenBalance: tb.balance,
                    symbol: tb.token.symbol,
                    name: tb.token.name,
                    decimals: tb.token.decimals,
                    logo: tb.token.logoURI,
                  }));
                }
              } catch {}
            }
            setData(d);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));

      fetch(`/api/chain?chain=${slug}&action=transfers&address=${address}&direction=both&filter=stablecoins`)
        .then((r) => r.json())
        .then((d) => { if (d.transfers) setTransfers(d.transfers); setTransfersLoading(false); })
        .catch(() => setTransfersLoading(false));
    }
  }, [slug, address, isSolana]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Address Not Found</h1>
      </div>
    );
  }

  const typeLabel =
    data.addressType === "stablecoin"
      ? "Stablecoin Contract"
      : data.addressType === "contract"
        ? "Contract"
        : "Address";

  const typeBadge =
    data.addressType === "stablecoin"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : data.addressType === "contract"
        ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
        : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{typeLabel}</h1>
          {data.addressType !== "eoa" && (
            <Badge variant="outline" className={typeBadge}>
              {data.addressType === "stablecoin" ? (
                <><Coins className="mr-1 h-3 w-3" />{data.stablecoinInfo?.symbol}</>
              ) : (
                <><FileCode className="mr-1 h-3 w-3" />Contract</>
              )}
            </Badge>
          )}
          {data.tokenMeta?.symbol && data.addressType === "contract" && (
            <Badge variant="outline" className="border-border/50 text-muted-foreground text-xs">
              {data.tokenMeta.symbol}
            </Badge>
          )}
        </div>
        <p className="mt-1 flex items-center font-mono text-sm text-muted-foreground">
          {address}
          <CopyBtn text={address} />
        </p>
      </div>

      {/* Type-specific content */}
      {data.addressType === "stablecoin" && (
        <StablecoinView data={data} slug={slug} color={color} />
      )}
      {data.addressType === "contract" && <ContractView data={data} />}
      {data.addressType === "eoa" && <EoaView data={data} chainSlug={slug} />}

      {/* Token balances — show for EOAs and non-token contracts */}
      {data.addressType === "eoa" && data.tokenBalances.length > 0 && (
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
                  {getCoinLogo(t.symbol || "") ? (
                    <img src={getCoinLogo(t.symbol || "")!} alt={t.symbol || ""} className="h-7 w-7 rounded-full" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-muted/50" />
                  )}
                  <div>
                    <span className="text-sm font-medium">{t.symbol || shortenAddress(t.contractAddress)}</span>
                    {t.name && <span className="ml-2 text-xs text-muted-foreground">{t.name}</span>}
                  </div>
                </div>
                <span className="text-sm font-medium">
                  {t.decimals ? formatTokenBalance(t.tokenBalance, t.decimals) : "—"}{" "}
                  <span className="text-muted-foreground">{t.symbol || ""}</span>
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Transfers */}
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
                ? Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i} className="border-border/40">
                      <TableCell colSpan={5}><Skeleton className="h-4 w-full" /></TableCell>
                    </TableRow>
                  ))
                : transfers.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                        No transfers found
                      </TableCell>
                    </TableRow>
                  )
                  : transfers.map((t, i) => {
                      const isSent = t.from.toLowerCase() === address.toLowerCase();
                      return (
                        <TableRow key={`${t.hash}-${i}`} className="border-border/40 hover:bg-muted/30">
                          <TableCell>
                            <a href={`/chains/${slug}/tx/${t.hash}`} className="font-mono text-xs hover:underline" style={{ color }}>
                              {shortenHash(t.hash)}
                            </a>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`text-[10px] ${isSent ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}
                            >
                              {isSent ? <ArrowUpRight className="mr-0.5 h-2.5 w-2.5" /> : <ArrowDownRight className="mr-0.5 h-2.5 w-2.5" />}
                              {isSent ? "OUT" : "IN"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <a href={`/chains/${slug}/address/${isSent ? t.to : t.from}`} className="font-mono text-xs hover:underline" style={{ color }}>
                              {shortenAddress(isSent ? t.to : t.from)}
                            </a>
                          </TableCell>
                          <TableCell className="text-right text-xs font-medium">
                            {t.value !== null ? (t.value < 0.001 ? "<0.001" : t.value.toLocaleString(undefined, { maximumFractionDigits: 4 })) : "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{t.asset || t.category}</TableCell>
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

"use client";

import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  Globe,
} from "lucide-react";
import { CHAINS } from "@/lib/chains/registry";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClientOnlyChart } from "@/components/client-only-chart";
import type {
  StablecoinOverview,
  ChainChartData,
} from "@/lib/stablecoins/defillama";

function fmtUsd(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtUsdFull(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function Change({ value }: { value: number }) {
  if (value === 0) return <span className="text-muted-foreground">--</span>;
  const positive = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}>
      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(value).toFixed(2)}%
    </span>
  );
}

const CHAIN_COLORS: Record<string, string> = {
  Ethereum: "#627EEA", Tron: "#FF0013", BSC: "#F0B90B", Solana: "#9945FF",
  Avalanche: "#E84142", Polygon: "#8247E5", Arbitrum: "#28A0F0",
  Optimism: "#FF0420", Base: "#0052FF", TON: "#0098EA", Sui: "#4DA2FF",
  Celo: "#FCFF52", "zkSync Era": "#8B8DFC", Linea: "#61DFFF",
  Scroll: "#FFEEDA", Tempo: "#34d399", Stable: "#3B82F6",
  Hyperliquid: "#77F2A1", Plasma: "#FF6B35",
};

const CURRENCY_COLORS: Record<string, string> = {
  EUR: "#003399", GBP: "#C8102E", BRL: "#009739", RUB: "#D52B1E",
  JPY: "#BC002D", CHF: "#FF0000", AUD: "#00008B", SGD: "#EF3340",
  TRY: "#E30A17", CAD: "#FF0000", CNY: "#DE2910", PHP: "#0038A8",
  VAR: "#6B7280", OTHER: "#6B7280",
};

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  const date = new Date(Number(label) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return (
    <div className="rounded-lg border border-border/50 bg-popover px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground">{date}</p>
      <p className="text-sm font-semibold">{fmtUsdFull(payload[0].value)}</p>
    </div>
  );
}

function BarTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: { chain: string; totalSupply: number } }> }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border/50 bg-popover px-3 py-2 shadow-xl">
      <p className="text-sm font-semibold">{d.chain}</p>
      <p className="text-xs text-muted-foreground">{fmtUsdFull(d.totalSupply)}</p>
    </div>
  );
}

interface Props {
  overview: StablecoinOverview;
  chart: ChainChartData[];
}

export function HomeDashboard({ overview, chart }: Props) {
  const totalNonUsd = overview.nonUsdGroups.reduce((s, g) => s + g.totalSupply, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Hero metrics ── */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Stablecoin Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cross-chain stablecoin supply across {overview.chains.length} chains
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Total Supply (USD pegged)</span>
              <DollarSign className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <p className="mt-2 text-2xl font-bold">{fmtUsd(overview.totalGlobalSupply)}</p>
            <Change value={overview.globalChange24h} /><span className="ml-1 text-xs text-muted-foreground">24h</span>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Supply Change</span>
              <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <div className="mt-2 flex items-baseline gap-3">
              <div><Change value={overview.globalChange7d} /><span className="ml-1 text-xs text-muted-foreground">7d</span></div>
              <div><Change value={overview.globalChange30d} /><span className="ml-1 text-xs text-muted-foreground">30d</span></div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Non-USD Stablecoins</span>
              <Globe className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <p className="mt-2 text-2xl font-bold">{fmtUsd(totalNonUsd)}</p>
            <span className="text-xs text-muted-foreground">{overview.nonUsdGroups.length} currencies</span>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        <Card className="border-border/40 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stablecoin Supply (90d)</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ClientOnlyChart>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={chart}>
                    <defs>
                      <linearGradient id="supplyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#71717a" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => new Date(v * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11, fill: "#71717a" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => fmtUsd(v)} width={65} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="supply" stroke="#34d399" strokeWidth={2} fill="url(#supplyGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ClientOnlyChart>
          </CardContent>
        </Card>

        <Card className="border-border/40 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Supply by Chain</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ClientOnlyChart>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart data={overview.chains.slice(0, 12)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#71717a" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => fmtUsd(v)} />
                    <YAxis type="category" dataKey="chain" tick={{ fontSize: 11, fill: "#71717a" }} tickLine={false} axisLine={false} width={80} />
                    <Tooltip content={<BarTooltip />} />
                    <Bar dataKey="totalSupply" radius={[0, 4, 4, 0]}>
                      {overview.chains.slice(0, 12).map((entry) => (
                        <Cell key={entry.chain} fill={CHAIN_COLORS[entry.chain] || "#6B7280"} opacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ClientOnlyChart>
          </CardContent>
        </Card>
      </div>

      {/* ── Top 5 sections side by side ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
        {/* Top 5 chains */}
        <Card className="border-border/40 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top 5 Chains</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.chains.slice(0, 5).map((chain, i) => {
              const cfg = CHAINS.find((c) => c.name === chain.chain);
              const pct = (chain.totalSupply / overview.totalGlobalSupply) * 100;
              return (
                <a key={chain.chain} href={cfg ? `/chains/${cfg.slug}` : "#"} className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2.5 transition-colors hover:bg-muted/20">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHAIN_COLORS[chain.chain] || "#6B7280" }} />
                    <div>
                      <span className="text-sm font-medium">{chain.chain}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{pct.toFixed(1)}% share</span>
                        <Change value={chain.change7d} />
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold">{fmtUsd(chain.totalSupply)}</span>
                </a>
              );
            })}
          </CardContent>
        </Card>

        {/* Top 5 coins */}
        <Card className="border-border/40 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top 5 USD Stablecoins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.topStablecoins.slice(0, 5).map((coin, i) => {
              const pct = (coin.supply / overview.totalGlobalSupply) * 100;
              return (
                <a key={coin.symbol} href={`/coins/${coin.symbol.toLowerCase()}`} className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2.5 transition-colors hover:bg-muted/20">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                    <div>
                      <span className="text-sm font-medium">{coin.symbol}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{pct.toFixed(1)}% share</span>
                        <Change value={coin.change7d} />
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-bold">{fmtUsd(coin.supply)}</span>
                </a>
              );
            })}
          </CardContent>
        </Card>

        {/* Top 5 non-USD */}
        <Card className="border-border/40 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Non-USD Stablecoins</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.nonUsdGroups.flatMap((g) => g.stablecoins).sort((a, b) => b.supply - a.supply).slice(0, 5).map((coin, i) => (
              <a key={coin.symbol} href={`/coins/${coin.symbol.toLowerCase()}`} className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2.5 transition-colors hover:bg-muted/20">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <div>
                    <span className="text-sm font-medium">{coin.symbol}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[9px] px-1 py-0" style={{ borderColor: CURRENCY_COLORS[coin.currency] || "#6B7280", color: CURRENCY_COLORS[coin.currency] || "#6B7280" }}>
                        {coin.currency}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{coin.name}</span>
                    </div>
                  </div>
                </div>
                <span className="text-sm font-bold">{fmtUsd(coin.supply)}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ── Non-USD stablecoins by currency ── */}
      {overview.nonUsdGroups.length > 0 && (
        <Card className="border-border/40 bg-card/50 mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Non-USD Stablecoins by Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {overview.nonUsdGroups.map((group) => (
                <div key={group.currency} className="rounded-lg border border-border/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CURRENCY_COLORS[group.currency] || "#6B7280" }} />
                      <span className="text-sm font-semibold">{group.label}</span>
                      <Badge variant="outline" className="text-[10px] border-border/50 text-muted-foreground">{group.currency}</Badge>
                    </div>
                    <span className="text-sm font-bold">{fmtUsd(group.totalSupply)}</span>
                  </div>
                  <div className="space-y-1.5">
                    {group.stablecoins.slice(0, 4).map((coin) => (
                      <div key={coin.symbol} className="flex items-center justify-between text-xs">
                        <a href={`/coins/${coin.symbol.toLowerCase()}`} className="text-emerald-400 hover:underline">{coin.symbol}</a>
                        <span className="text-muted-foreground">{fmtUsd(coin.supply)}</span>
                      </div>
                    ))}
                    {group.stablecoins.length > 4 && (
                      <span className="text-xs text-muted-foreground">+{group.stablecoins.length - 4} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

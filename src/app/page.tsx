"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ClientOnlyChart } from "@/components/client-only-chart";
import {
  Skeleton,
  MetricCardSkeleton,
  ChartSkeleton,
} from "@/components/skeleton";

interface ChainData {
  chain: string;
  totalSupply: number;
  change24h: number;
  change7d: number;
  change30d: number;
  dominantStablecoin: string;
  dominantStablecoinPct: number;
  topStablecoins: { symbol: string; supply: number; pct: number }[];
  stablecoinCount: number;
}

interface StablecoinData {
  symbol: string;
  name: string;
  supply: number;
  change24h: number;
  change7d: number;
  pegType: string;
  mechanism: string;
  chainCount: number;
}

interface Overview {
  totalGlobalSupply: number;
  globalChange24h: number;
  globalChange7d: number;
  globalChange30d: number;
  chains: ChainData[];
  topStablecoins: StablecoinData[];
  lastUpdated: number;
}

interface ChartPoint {
  date: number;
  supply: number;
}

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
  if (value === 0) return <span className="text-muted-foreground">—</span>;
  const positive = value > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${positive ? "text-emerald-400" : "text-red-400"}`}
    >
      {positive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : (
        <ArrowDownRight className="h-3 w-3" />
      )}
      {Math.abs(value).toFixed(2)}%
    </span>
  );
}

const CHAIN_COLORS: Record<string, string> = {
  Ethereum: "#627EEA",
  Tron: "#FF0013",
  BSC: "#F0B90B",
  Solana: "#9945FF",
  Avalanche: "#E84142",
  Polygon: "#8247E5",
  Arbitrum: "#28A0F0",
  Optimism: "#FF0420",
  Base: "#0052FF",
  TON: "#0098EA",
  Sui: "#4DA2FF",
  Celo: "#FCFF52",
  "zkSync Era": "#8B8DFC",
  Linea: "#61DFFF",
  Scroll: "#FFEEDA",
  Tempo: "#34d399",
  Stable: "#3B82F6",
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const date = new Date(Number(label) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return (
    <div className="rounded-lg border border-border/50 bg-popover px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground">{date}</p>
      <p className="text-sm font-semibold">{fmtUsdFull(payload[0].value)}</p>
    </div>
  );
}

function BarTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { chain: string; totalSupply: number } }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border/50 bg-popover px-3 py-2 shadow-xl">
      <p className="text-sm font-semibold">{d.chain}</p>
      <p className="text-xs text-muted-foreground">
        {fmtUsdFull(d.totalSupply)}
      </p>
    </div>
  );
}

export default function Home() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [globalChart, setGlobalChart] = useState<ChartPoint[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/stablecoins").then((r) => r.json()),
      fetch("/api/stablecoins?chart=all").then((r) => r.json()),
    ])
      .then(([ov, ch]) => {
        if (ov.totalGlobalSupply) setOverview(ov);
        if (ch.chart) setGlobalChart(ch.chart);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-5 w-80" />
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <MetricCardSkeleton key={i} />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
        <div className="rounded-lg border border-border/40 bg-card/50">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex gap-4 px-6 py-3 border-b border-border/20">
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold">Failed to load data</h1>
        <p className="mt-2 text-muted-foreground">
          Could not fetch stablecoin data. Please try again.
        </p>
      </div>
    );
  }

  // Last 90 days of chart data
  const chartData = globalChart
    ? globalChart.slice(-90).filter((p) => p.supply > 0)
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Stablecoin Analytics
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cross-chain stablecoin supply and movement across{" "}
          {overview.chains.length} chains
        </p>
      </div>

      {/* Global metrics */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Total Stablecoin Supply
              </span>
              <DollarSign className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <p className="mt-3 text-2xl font-bold">
              {fmtUsd(overview.totalGlobalSupply)}
            </p>
            <Change value={overview.globalChange24h} />
            <span className="ml-2 text-xs text-muted-foreground">24h</span>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Supply Change
              </span>
              <TrendingUp className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <div className="mt-3 flex items-baseline gap-4">
              <div>
                <Change value={overview.globalChange7d} />
                <span className="ml-1 text-xs text-muted-foreground">7d</span>
              </div>
              <div>
                <Change value={overview.globalChange30d} />
                <span className="ml-1 text-xs text-muted-foreground">30d</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-8">
        {/* Global supply chart */}
        <Card className="border-border/40 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Stablecoin Supply (90d)
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ClientOnlyChart>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="supplyGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#34d399"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="#34d399"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.06)"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "#71717a" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) =>
                        new Date(v * 1000).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      }
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#71717a" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => fmtUsd(v)}
                      width={65}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="supply"
                      stroke="#34d399"
                      strokeWidth={2}
                      fill="url(#supplyGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ClientOnlyChart>
          </CardContent>
        </Card>

        {/* Chain comparison bar chart */}
        <Card className="border-border/40 bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Supply by Chain
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ClientOnlyChart>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <BarChart
                    data={overview.chains.slice(0, 12)}
                    layout="vertical"
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.06)"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 11, fill: "#71717a" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => fmtUsd(v)}
                    />
                    <YAxis
                      type="category"
                      dataKey="chain"
                      tick={{ fontSize: 11, fill: "#71717a" }}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip content={<BarTooltip />} />
                    <Bar dataKey="totalSupply" radius={[0, 4, 4, 0]}>
                      {overview.chains.slice(0, 12).map((entry) => (
                        <Cell
                          key={entry.chain}
                          fill={CHAIN_COLORS[entry.chain] || "#6B7280"}
                          opacity={0.8}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ClientOnlyChart>
          </CardContent>
        </Card>
      </div>

      {/* Chain comparison table */}
      <Card className="border-border/40 bg-card/50 mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Stablecoin Supply by Chain
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-xs w-10">#</TableHead>
                <TableHead className="text-xs">Chain</TableHead>
                <TableHead className="text-xs text-right">
                  Total Supply
                </TableHead>
                <TableHead className="text-xs text-right">24h</TableHead>
                <TableHead className="text-xs text-right">7d</TableHead>
                <TableHead className="text-xs text-right">30d</TableHead>
                <TableHead className="text-xs">Dominant</TableHead>
                <TableHead className="text-xs text-right">Assets</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.chains.map((chain, i) => (
                <TableRow
                  key={chain.chain}
                  className="border-border/40 hover:bg-muted/30 cursor-pointer"
                  onClick={() => {
                    const cfg = CHAINS.find((c) => c.name === chain.chain);
                    if (cfg) window.location.href = `/chains/${cfg.slug}`;
                  }}
                >
                  <TableCell className="text-xs text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            CHAIN_COLORS[chain.chain] || "#6B7280",
                        }}
                      />
                      <span className="text-sm font-medium">
                        {chain.chain}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {fmtUsdFull(chain.totalSupply)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Change value={chain.change24h} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Change value={chain.change7d} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Change value={chain.change30d} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium">
                        {chain.dominantStablecoin}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {chain.dominantStablecoinPct.toFixed(0)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {chain.stablecoinCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Top stablecoins table */}
      <Card className="border-border/40 bg-card/50 mb-8">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top Stablecoins by Supply
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="text-xs w-10">#</TableHead>
                <TableHead className="text-xs">Stablecoin</TableHead>
                <TableHead className="text-xs text-right">Supply</TableHead>
                <TableHead className="text-xs text-right">24h</TableHead>
                <TableHead className="text-xs text-right">7d</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs text-right">Chains</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.topStablecoins.map((coin, i) => (
                <TableRow
                  key={coin.symbol}
                  className="border-border/40 hover:bg-muted/30"
                >
                  <TableCell className="text-xs text-muted-foreground">
                    {i + 1}
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="text-sm font-medium">{coin.symbol}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        {coin.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {fmtUsdFull(coin.supply)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Change value={coin.change24h} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Change value={coin.change7d} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="text-[10px] border-border/50 text-muted-foreground"
                    >
                      {coin.mechanism || coin.pegType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {coin.chainCount}
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

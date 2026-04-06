import { getStablecoinOverview, getChainChart } from "@/lib/stablecoins/defillama";
import { getCachedMetrics } from "@/lib/stablecoins/metrics-cache";
import { HomeDashboard } from "@/components/home-dashboard";

// ISR: revalidate every 60 seconds
export const revalidate = 60;

// Timeout wrapper to prevent hanging on slow external APIs
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

export default async function Home() {
  const [overview, chartRaw, metrics] = await Promise.all([
    withTimeout(getStablecoinOverview(), 8000, null),
    withTimeout(getChainChart("all"), 8000, []),
    getCachedMetrics().catch(() => null),
  ]);

  if (!overview) {
    // Fallback: render with just metrics from Supabase
    return (
      <HomeDashboard
        overview={{
          totalGlobalSupply: 0,
          globalChange24h: 0,
          globalChange7d: 0,
          globalChange30d: 0,
          chains: [],
          topStablecoins: [],
          nonUsdGroups: [],
          yieldBearingTokens: [],
          yieldBearingTotal: 0,
          lastUpdated: Date.now(),
        }}
        chart={[]}
        metrics={metrics}
      />
    );
  }

  const chart = chartRaw.slice(-90).filter((p) => p.supply > 0);

  return <HomeDashboard overview={overview} chart={chart} metrics={metrics} />;
}

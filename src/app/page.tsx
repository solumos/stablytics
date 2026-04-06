import { getStablecoinOverview, getChainChart } from "@/lib/stablecoins/defillama";
import { getCachedMetrics } from "@/lib/stablecoins/metrics-cache";
import { HomeDashboard } from "@/components/home-dashboard";

// ISR: revalidate every 60 seconds
export const revalidate = 60;

export default async function Home() {
  const [overview, chartRaw, metrics] = await Promise.all([
    getStablecoinOverview(),
    getChainChart("all"),
    getCachedMetrics().catch(() => null),
  ]);

  const chart = chartRaw.slice(-90).filter((p) => p.supply > 0);

  return <HomeDashboard overview={overview} chart={chart} metrics={metrics} />;
}

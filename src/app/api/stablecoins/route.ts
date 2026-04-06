import { NextResponse } from "next/server";
import { getStablecoinOverview, getChainChart } from "@/lib/stablecoins/defillama";

// ISR: serve cached, revalidate in background every 60s
export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chart = searchParams.get("chart");

    if (chart) {
      const data = await getChainChart(chart);
      // Only return last 90 days to cut payload from 1MB to ~30KB
      const trimmed = data.slice(-90);
      return NextResponse.json(
        { chart: trimmed },
        {
          headers: {
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    const overview = await getStablecoinOverview();
    return NextResponse.json(overview, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}

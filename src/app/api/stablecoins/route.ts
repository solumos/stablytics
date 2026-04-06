import { NextResponse } from "next/server";
import { getStablecoinOverview, getChainChart } from "@/lib/stablecoins/defillama";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chart = searchParams.get("chart");

    if (chart) {
      const data = await getChainChart(chart);
      return NextResponse.json({ chart: data });
    }

    const overview = await getStablecoinOverview();
    return NextResponse.json(overview);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}

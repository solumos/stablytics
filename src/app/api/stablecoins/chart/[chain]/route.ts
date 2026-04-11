import { NextResponse } from "next/server";
import { getChainChart } from "@/lib/stablecoins/defillama";

// ISR: serve cached, revalidate in background every 60s
// NOTE: This works because the handler does NOT access the Request object.
export const revalidate = 60;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ chain: string }> }
) {
  try {
    const { chain } = await params;
    const data = await getChainChart(chain);
    // Only return last 90 days to cut payload from 1MB to ~30KB
    const trimmed = data.slice(-90);
    return NextResponse.json(
      { chart: trimmed },
      {
        headers: {
          "Cache-Control":
            "public, max-age=10, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getStablecoinMetrics } from "@/lib/stablecoins/metrics";

export const revalidate = 60;

export async function GET() {
  try {
    const metrics = await getStablecoinMetrics();
    return NextResponse.json(metrics, {
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

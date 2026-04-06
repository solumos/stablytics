import { NextResponse } from "next/server";
import { getCachedMetrics } from "@/lib/stablecoins/metrics-cache";
import { getStablecoinMetrics } from "@/lib/stablecoins/metrics";

export const revalidate = 60;

export async function GET() {
  try {
    // Try Supabase cache first
    const cached = await getCachedMetrics();
    if (cached) {
      return NextResponse.json(cached, {
        headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
      });
    }

    // Fallback: compute live (slower but works without Supabase)
    const live = await getStablecoinMetrics();
    return NextResponse.json(live, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}

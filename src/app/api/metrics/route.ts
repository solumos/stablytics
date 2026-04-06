import { NextResponse } from "next/server";
import { getCachedMetrics } from "@/lib/stablecoins/metrics-cache";

export const revalidate = 60;

export async function GET() {
  try {
    const metrics = await getCachedMetrics();
    if (!metrics) {
      return NextResponse.json(
        { error: "metrics not yet computed" },
        { status: 503 }
      );
    }
    return NextResponse.json(metrics, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}

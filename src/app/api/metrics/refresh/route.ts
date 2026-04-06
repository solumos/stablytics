import { NextResponse } from "next/server";
import { getStablecoinMetrics } from "@/lib/stablecoins/metrics";
import { setCachedMetrics } from "@/lib/stablecoins/metrics-cache";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // allow up to 60s for all RPC calls

export async function GET(request: Request) {
  // Optional: verify cron secret to prevent public abuse
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const metrics = await getStablecoinMetrics();
    await setCachedMetrics(metrics);

    return NextResponse.json({
      ok: true,
      transactions: metrics.transactions,
      volume: metrics.volume,
      senders: metrics.senders,
      receivers: metrics.receivers,
      chains: metrics.chains.length,
      sampledAt: metrics.sampledAt,
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}

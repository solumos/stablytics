import { NextResponse } from "next/server";
import { getStablecoinOverview } from "@/lib/stablecoins/defillama";

// ISR: serve cached, revalidate in background every 60s
// NOTE: This works because the handler does NOT access the Request object.
export const revalidate = 60;

export async function GET() {
  try {
    const overview = await getStablecoinOverview();
    return NextResponse.json(overview, {
      headers: {
        "Cache-Control": "public, max-age=10, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}

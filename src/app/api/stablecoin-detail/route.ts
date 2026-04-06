import { NextResponse } from "next/server";
import { cached } from "@/lib/cache";
import { TARGET_CHAINS } from "@/lib/stablecoins/defillama";

export const revalidate = 60;

// Map DefiLlama chain names to display names
const chainNameMap: Record<string, string> = {};
for (const [dlName, displayName] of Object.entries(TARGET_CHAINS)) {
  chainNameMap[dlName] = displayName;
}

interface PeggedValue {
  peggedUSD?: number;
  peggedEUR?: number;
}

interface PeggedAsset {
  id: string;
  name: string;
  symbol: string;
  pegType: string;
  pegMechanism: string;
  circulating: PeggedValue;
  circulatingPrevDay: PeggedValue;
  circulatingPrevWeek: PeggedValue;
  circulatingPrevMonth: PeggedValue;
  chainCirculating: Record<
    string,
    {
      current: PeggedValue;
      circulatingPrevDay: PeggedValue;
      circulatingPrevWeek: PeggedValue;
      circulatingPrevMonth: PeggedValue;
    }
  >;
  chains: string[];
  price: number | null;
}

function peg(v: PeggedValue | undefined): number {
  return v?.peggedUSD ?? v?.peggedEUR ?? 0;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol")?.toUpperCase();
    if (!symbol) {
      return NextResponse.json({ error: "symbol required" }, { status: 400 });
    }

    const data = await cached(
      `stablecoin-detail:${symbol}`,
      async () => {
        const res = await fetch(
          "https://stablecoins.llama.fi/stablecoins?includePrices=true",
          { cache: "no-store" }
        );
        const json = await res.json();
        const asset = (json.peggedAssets as PeggedAsset[]).find(
          (a) => a.symbol.toUpperCase() === symbol
        );
        if (!asset) return null;

        // Build per-chain breakdown
        const chains = Object.entries(asset.chainCirculating)
          .map(([chain, data]) => {
            const supply = peg(data.current);
            if (supply <= 0) return null;
            const prevDay = peg(data.circulatingPrevDay);
            const prevWeek = peg(data.circulatingPrevWeek);
            const prevMonth = peg(data.circulatingPrevMonth);
            return {
              chain: chainNameMap[chain] || chain,
              supply,
              change24h: prevDay > 0 ? ((supply - prevDay) / prevDay) * 100 : 0,
              change7d: prevWeek > 0 ? ((supply - prevWeek) / prevWeek) * 100 : 0,
              change30d: prevMonth > 0 ? ((supply - prevMonth) / prevMonth) * 100 : 0,
              pctOfTotal: 0, // filled below
            };
          })
          .filter(Boolean)
          .sort((a, b) => b!.supply - a!.supply) as {
          chain: string;
          supply: number;
          change24h: number;
          change7d: number;
          change30d: number;
          pctOfTotal: number;
        }[];

        const totalSupply = peg(asset.circulating);
        for (const c of chains) {
          c.pctOfTotal = totalSupply > 0 ? (c.supply / totalSupply) * 100 : 0;
        }

        return {
          symbol: asset.symbol,
          name: asset.name,
          pegType: asset.pegType,
          mechanism: asset.pegMechanism,
          totalSupply,
          price: asset.price,
          change24h:
            peg(asset.circulatingPrevDay) > 0
              ? ((totalSupply - peg(asset.circulatingPrevDay)) /
                  peg(asset.circulatingPrevDay)) *
                100
              : 0,
          change7d:
            peg(asset.circulatingPrevWeek) > 0
              ? ((totalSupply - peg(asset.circulatingPrevWeek)) /
                  peg(asset.circulatingPrevWeek)) *
                100
              : 0,
          change30d:
            peg(asset.circulatingPrevMonth) > 0
              ? ((totalSupply - peg(asset.circulatingPrevMonth)) /
                  peg(asset.circulatingPrevMonth)) *
                100
              : 0,
          chainCount: chains.length,
          chains,
        };
      },
      60_000
    );

    if (!data) {
      return NextResponse.json(
        { error: "Stablecoin not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}

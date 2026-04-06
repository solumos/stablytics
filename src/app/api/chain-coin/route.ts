import { NextResponse } from "next/server";
import { getChain } from "@/lib/chains/registry";
import { getAssetTransfers, getTokenMetadata } from "@/lib/chains/evm-rpc";
import { getStablecoinAddress } from "@/lib/stablecoins/addresses";
import { cached } from "@/lib/cache";

export const revalidate = 60;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chainSlug = searchParams.get("chain");
    const symbol = searchParams.get("symbol")?.toUpperCase();
    const action = searchParams.get("action") || "overview";

    if (!chainSlug || !symbol) {
      return NextResponse.json(
        { error: "chain and symbol required" },
        { status: 400 }
      );
    }

    const chain = getChain(chainSlug);
    if (!chain) {
      return NextResponse.json(
        { error: `Chain "${chainSlug}" not found` },
        { status: 404 }
      );
    }

    const contractAddress = getStablecoinAddress(chainSlug, symbol);

    if (action === "overview") {
      const result = await cached(
        `chain-coin:${chainSlug}:${symbol}:overview`,
        async () => {
          let metadata = null;
          if (contractAddress && chain.explorerEnabled) {
            try {
              metadata = await getTokenMetadata(chain, contractAddress);
            } catch {}
          }

          // Get supply data from DefiLlama
          let defillamaSupply = null;
          try {
            const res = await fetch(
              "https://stablecoins.llama.fi/stablecoins?includePrices=true",
              { cache: "no-store" }
            );
            const data = await res.json();
            const asset = data.peggedAssets.find(
              (a: any) => a.symbol.toUpperCase() === symbol
            );
            if (asset) {
              // Find this chain's data using DefiLlama chain name
              const defillamaChainName = Object.keys(
                asset.chainCirculating || {}
              ).find(
                (k) =>
                  k.toLowerCase() === chain.name.toLowerCase() ||
                  k.toLowerCase() === chainSlug
              );
              if (defillamaChainName) {
                const cd = asset.chainCirculating[defillamaChainName];
                const supply =
                  cd?.current?.peggedUSD || cd?.current?.peggedEUR || 0;
                const prevDay =
                  cd?.circulatingPrevDay?.peggedUSD ||
                  cd?.circulatingPrevDay?.peggedEUR ||
                  0;
                const prevWeek =
                  cd?.circulatingPrevWeek?.peggedUSD ||
                  cd?.circulatingPrevWeek?.peggedEUR ||
                  0;
                const prevMonth =
                  cd?.circulatingPrevMonth?.peggedUSD ||
                  cd?.circulatingPrevMonth?.peggedEUR ||
                  0;
                defillamaSupply = {
                  supply,
                  change24h:
                    prevDay > 0
                      ? ((supply - prevDay) / prevDay) * 100
                      : 0,
                  change7d:
                    prevWeek > 0
                      ? ((supply - prevWeek) / prevWeek) * 100
                      : 0,
                  change30d:
                    prevMonth > 0
                      ? ((supply - prevMonth) / prevMonth) * 100
                      : 0,
                  globalSupply:
                    asset.circulating?.peggedUSD ||
                    asset.circulating?.peggedEUR ||
                    0,
                };
              }
            }
          } catch {}

          return {
            chain: chain.name,
            chainSlug: chain.slug,
            symbol,
            contractAddress: contractAddress || null,
            metadata,
            supply: defillamaSupply,
            explorerEnabled: chain.explorerEnabled,
          };
        },
        60_000
      );

      return NextResponse.json(result);
    }

    if (action === "transfers") {
      if (!chain.explorerEnabled || !contractAddress) {
        return NextResponse.json({ transfers: [] });
      }

      const result = await cached(
        `chain-coin:${chainSlug}:${symbol}:transfers`,
        async () => {
          const data = await getAssetTransfers(chain, {
            category: ["erc20"],
            maxCount: 50,
          });
          // Filter to just this token
          const filtered = data.transfers.filter(
            (t) =>
              t.rawContract?.address?.toLowerCase() ===
              contractAddress.toLowerCase()
          );
          return { transfers: filtered.slice(0, 50) };
        }
      );

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}

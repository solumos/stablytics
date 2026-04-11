import { NextResponse } from "next/server";
import {
  getLatestSlot,
  getBlockRange,
  getPerformance,
  getAccountInfo,
  getTokenAccountsByOwner,
  getSignaturesForAddress,
  getStablecoinSignatures,
  getBalance,
  getTransaction,
} from "@/lib/chains/solana-rpc";
import { getAllStablecoinAddresses } from "@/lib/stablecoins/addresses";
import { cached } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "stats";

    if (action === "stats") {
      const result = await cached("solana:stats", async () => {
        const [slot, perf] = await Promise.all([
          getLatestSlot(),
          getPerformance(),
        ]);
        return {
          latestSlot: slot,
          avgTps: perf.avgTps,
          nonVoteTps: perf.nonVoteTps,
          avgSlotTime: perf.avgSlotTime,
        };
      });
      return NextResponse.json(result);
    }

    if (action === "blocks") {
      const count = Math.min(parseInt(searchParams.get("count") || "10"), 20);
      const beforeStr = searchParams.get("before");

      const result = await cached(
        `solana:blocks:${count}:${beforeStr || "latest"}`,
        async () => {
          const latest = beforeStr
            ? parseInt(beforeStr) - 1
            : await getLatestSlot();
          const blocks = await getBlockRange(latest, count);
          return { latestSlot: await getLatestSlot(), blocks };
        }
      );
      return NextResponse.json(result);
    }

    if (action === "tx") {
      const signature = searchParams.get("signature");
      if (!signature) {
        return NextResponse.json(
          { error: "signature required" },
          { status: 400 }
        );
      }
      const tx = await cached(`solana:tx:${signature}`, () =>
        getTransaction(signature)
      );
      if (!tx) {
        return NextResponse.json(
          { error: "Transaction not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(tx);
    }

    if (action === "address") {
      const address = searchParams.get("address");
      if (!address) {
        return NextResponse.json(
          { error: "address required" },
          { status: 400 }
        );
      }

      const result = await cached(`solana:addr:${address}`, async () => {
        const [account, tokenBalances, signatures] = await Promise.all([
          getAccountInfo(address),
          getTokenAccountsByOwner(address).catch(() => []),
          getSignaturesForAddress(address, 25).catch(() => []),
        ]);
        return { account, tokenBalances, signatures };
      });
      return NextResponse.json(result);
    }

    if (action === "signatures") {
      const address = searchParams.get("address");
      if (!address) {
        return NextResponse.json(
          { error: "address required" },
          { status: 400 }
        );
      }
      const sigs = await cached(`solana:sigs:${address}`, () =>
        getSignaturesForAddress(address, 50)
      );
      return NextResponse.json({ signatures: sigs });
    }

    if (action === "stablecoin-transfers") {
      const mint = searchParams.get("mint");
      const result = await cached(
        `solana:stable-tx:${mint || "all"}`,
        async () => {
          if (mint) {
            // Single mint
            return { signatures: await getStablecoinSignatures(mint, 50) };
          }
          // All stablecoin mints — fetch top 2 and merge
          const mints = getAllStablecoinAddresses("solana").slice(0, 2);
          const all = await Promise.all(
            mints.map((m) => getStablecoinSignatures(m, 25))
          );
          const merged = all
            .flat()
            .sort((a, b) => (b.blockTime || 0) - (a.blockTime || 0))
            .slice(0, 50);
          return { signatures: merged };
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

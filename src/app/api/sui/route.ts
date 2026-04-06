import { NextResponse } from "next/server";
import {
  getLatestCheckpoint,
  getCheckpointRange,
  getAllBalances,
} from "@/lib/chains/sui-rpc";
import { cached } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "stats";

    if (action === "stats") {
      const result = await cached("sui:stats", async () => {
        const latest = await getLatestCheckpoint();
        const checkpoints = await getCheckpointRange(parseInt(latest), 5);
        let totalTime = 0;
        for (let i = 0; i < checkpoints.length - 1; i++) {
          totalTime +=
            (parseInt(checkpoints[i].timestampMs) -
              parseInt(checkpoints[i + 1].timestampMs)) /
            1000;
        }
        const avgCheckpointTime = totalTime / (checkpoints.length - 1);
        return {
          latestCheckpoint: parseInt(latest),
          avgCheckpointTime: Math.max(avgCheckpointTime, 0.001),
          totalTransactions: checkpoints[0]
            ? parseInt(checkpoints[0].networkTotalTransactions)
            : 0,
        };
      });
      return NextResponse.json(result);
    }

    if (action === "blocks") {
      const count = Math.min(parseInt(searchParams.get("count") || "10"), 20);
      const beforeStr = searchParams.get("before");
      const result = await cached(
        `sui:blocks:${count}:${beforeStr || "latest"}`,
        async () => {
          const latest = parseInt(
            beforeStr || (await getLatestCheckpoint())
          );
          const from = beforeStr ? latest - 1 : latest;
          const checkpoints = await getCheckpointRange(from, count);
          return {
            latestCheckpoint: parseInt(await getLatestCheckpoint()),
            blocks: checkpoints.map((c) => ({
              number: parseInt(c.sequenceNumber),
              timestamp: Math.floor(parseInt(c.timestampMs) / 1000),
              txCount: c.transactions.length,
              digest: c.digest,
              epoch: parseInt(c.epoch),
              transactions: c.transactions,
            })),
          };
        }
      );
      return NextResponse.json(result);
    }

    if (action === "address") {
      const address = searchParams.get("address");
      if (!address) return NextResponse.json({ error: "address required" }, { status: 400 });
      const result = await cached(`sui:addr:${address}`, async () => {
        const balances = await getAllBalances(address);
        return { address, balances };
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import {
  getMasterchainInfo,
  getBlockRange,
  getAccountInfo,
  getTransactions,
} from "@/lib/chains/ton-rpc";
import { cached } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "stats";

    if (action === "stats") {
      const result = await cached("ton:stats", async () => {
        const info = await getMasterchainInfo();
        const blocks = await getBlockRange(info.seqno, 5);
        let totalTime = 0;
        for (let i = 0; i < blocks.length - 1; i++) {
          totalTime += blocks[i].genUtime - blocks[i + 1].genUtime;
        }
        const avgBlockTime = totalTime / (blocks.length - 1);
        return {
          latestBlock: info.seqno,
          avgBlockTime: Math.max(avgBlockTime, 0.001),
          lastUtime: info.lastUtime,
        };
      });
      return NextResponse.json(result);
    }

    if (action === "blocks") {
      const count = Math.min(parseInt(searchParams.get("count") || "10"), 20);
      const beforeStr = searchParams.get("before");
      const result = await cached(
        `ton:blocks:${count}:${beforeStr || "latest"}`,
        async () => {
          const info = await getMasterchainInfo();
          const from = beforeStr ? parseInt(beforeStr) - 1 : info.seqno;
          const blocks = await getBlockRange(from, count);
          return { latestBlock: info.seqno, blocks };
        }
      );
      return NextResponse.json(result);
    }

    if (action === "address") {
      const address = searchParams.get("address");
      if (!address) return NextResponse.json({ error: "address required" }, { status: 400 });
      const result = await cached(`ton:addr:${address}`, async () => {
        const [account, txns] = await Promise.all([
          getAccountInfo(address),
          getTransactions(address, 25).catch(() => []),
        ]);
        return { account, transactions: txns };
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import {
  getLatestBlock,
  getBlockRange,
  getBlockWithTxns,
  getAccount,
  getAccountTransactions,
  getFullTransaction,
  getAccountTrc20Transfers,
} from "@/lib/chains/tron-rpc";
import { cached } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "stats";

    if (action === "stats") {
      const result = await cached("tron:stats", async () => {
        const latest = await getLatestBlock();
        // Fetch a few blocks to compute block time
        const blocks = await getBlockRange(latest.number, 5);
        let totalTime = 0;
        for (let i = 0; i < blocks.length - 1; i++) {
          totalTime += blocks[i].timestamp - blocks[i + 1].timestamp;
        }
        const avgBlockTime = totalTime / (blocks.length - 1);
        const totalTxns = blocks.reduce((s, b) => s + b.txCount, 0);
        const avgTps = totalTime > 0 ? totalTxns / totalTime : 0;

        return {
          latestBlock: latest.number,
          avgBlockTime: Math.max(avgBlockTime, 0.001),
          avgTps,
        };
      });
      return NextResponse.json(result);
    }

    if (action === "blocks") {
      const count = Math.min(parseInt(searchParams.get("count") || "15"), 25);
      const beforeStr = searchParams.get("before");

      const result = await cached(
        `tron:blocks:${count}:${beforeStr || "latest"}`,
        async () => {
          const latest = await getLatestBlock();
          const from = beforeStr ? parseInt(beforeStr) - 1 : latest.number;
          const blocks = await getBlockRange(from, count);
          return { latestBlock: latest.number, blocks };
        }
      );
      return NextResponse.json(result);
    }

    if (action === "block") {
      const num = searchParams.get("num");
      if (!num) {
        return NextResponse.json({ error: "num required" }, { status: 400 });
      }
      const result = await cached(`tron:block:${num}`, () =>
        getBlockWithTxns(parseInt(num))
      );
      return NextResponse.json(result);
    }

    if (action === "tx") {
      const txId = searchParams.get("txId");
      if (!txId) {
        return NextResponse.json({ error: "txId required" }, { status: 400 });
      }
      const tx = await cached(`tron:tx:${txId}`, () =>
        getFullTransaction(txId)
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
      const result = await cached(`tron:addr:${address}`, async () => {
        const [account, txns] = await Promise.all([
          getAccount(address),
          getAccountTransactions(address, 25),
        ]);
        return { account, transactions: txns };
      });
      return NextResponse.json(result);
    }

    if (action === "trc20-transfers") {
      const address = searchParams.get("address");
      const contract = searchParams.get("contract") || undefined;
      if (!address) {
        return NextResponse.json({ error: "address required" }, { status: 400 });
      }
      const transfers = await cached(
        `tron:trc20:${address}:${contract || "all"}`,
        () => getAccountTrc20Transfers(address, contract, 50)
      );
      return NextResponse.json({ transfers });
    }

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}

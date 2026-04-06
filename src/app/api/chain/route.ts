import { NextResponse } from "next/server";
import { getChain } from "@/lib/chains/registry";
import {
  getNetworkStats,
  getLatestBlockNumber,
  getBlockRange,
  getBlock,
  getTransaction,
  getTransactionReceipt,
  getBalance,
  getCode,
  getTxCount,
  getTokenBalances,
  getAssetTransfers,
} from "@/lib/chains/evm-rpc";
import { cached } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chainSlug = searchParams.get("chain");
    const action = searchParams.get("action") || "stats";

    if (!chainSlug) {
      return NextResponse.json({ error: "chain required" }, { status: 400 });
    }

    const chain = getChain(chainSlug);
    if (!chain || !chain.explorerEnabled) {
      return NextResponse.json(
        { error: `Chain "${chainSlug}" not supported for explorer` },
        { status: 404 }
      );
    }

    if (action === "stats") {
      const stats = await cached(`chain:${chainSlug}:stats`, () =>
        getNetworkStats(chain)
      );
      return NextResponse.json({
        latestBlock: stats.latestBlock,
        avgBlockTime: stats.avgBlockTime,
        avgTps: stats.avgTps,
        totalTxnsInSample: stats.totalTxnsInSample,
        gasPrice: stats.gasPrice.toString(),
        chain: {
          name: chain.name,
          slug: chain.slug,
          chainId: chain.chainId,
          nativeSymbol: chain.nativeSymbol,
          color: chain.color,
        },
      });
    }

    if (action === "blocks") {
      const count = Math.min(
        parseInt(searchParams.get("count") || "25"),
        50
      );
      const beforeStr = searchParams.get("before");
      const cacheKey = `chain:${chainSlug}:blocks:${count}:${beforeStr || "latest"}`;

      const result = await cached(cacheKey, async () => {
        const latest = await getLatestBlockNumber(chain);
        const from = beforeStr ? parseInt(beforeStr) - 1 : latest;
        const blocks = await getBlockRange(chain, from, count);
        return {
          latestBlock: latest,
          blocks: blocks.map((b) => ({
            ...b,
            gasLimit: b.gasLimit.toString(),
            gasUsed: b.gasUsed.toString(),
            baseFeePerGas: b.baseFeePerGas.toString(),
          })),
        };
      });
      return NextResponse.json(result);
    }

    if (action === "tx") {
      const hash = searchParams.get("hash");
      if (!hash) {
        return NextResponse.json({ error: "hash required" }, { status: 400 });
      }
      const result = await cached(`chain:${chainSlug}:tx:${hash}`, async () => {
        const [tx, receipt] = await Promise.all([
          getTransaction(chain, hash),
          getTransactionReceipt(chain, hash),
        ]);
        const block = await getBlock(chain, tx.blockNumber);
        return {
          tx: {
            ...tx,
            value: tx.value.toString(),
            gasPrice: tx.gasPrice.toString(),
            gas: tx.gas.toString(),
          },
          receipt: {
            ...receipt,
            gasUsed: receipt.gasUsed.toString(),
            effectiveGasPrice: receipt.effectiveGasPrice.toString(),
          },
          block: { timestamp: block.timestamp, number: block.number },
        };
      });
      return NextResponse.json(result);
    }

    if (action === "address") {
      const address = searchParams.get("address");
      if (!address) {
        return NextResponse.json(
          { error: "address required" },
          { status: 400 }
        );
      }
      const result = await cached(
        `chain:${chainSlug}:addr:${address.toLowerCase()}`,
        async () => {
          const [balance, code, txCount, tokenBalances] = await Promise.all([
            getBalance(chain, address),
            getCode(chain, address),
            getTxCount(chain, address),
            getTokenBalances(chain, address),
          ]);
          return {
            address,
            balance: balance.toString(),
            isContract: code !== "0x",
            txCount,
            nativeSymbol: chain.nativeSymbol,
            tokenBalances: tokenBalances.map((t) => ({
              ...t,
              tokenBalance: t.tokenBalance,
            })),
          };
        }
      );
      return NextResponse.json(result);
    }

    if (action === "transfers") {
      const address = searchParams.get("address");
      if (!address) {
        return NextResponse.json(
          { error: "address required" },
          { status: 400 }
        );
      }
      const direction = searchParams.get("direction") || "from"; // "from" | "to" | "both"

      const result = await cached(
        `chain:${chainSlug}:transfers:${address.toLowerCase()}:${direction}`,
        async () => {
          if (direction === "both") {
            const [sent, received] = await Promise.all([
              getAssetTransfers(chain, {
                fromAddress: address,
                maxCount: 25,
              }),
              getAssetTransfers(chain, {
                toAddress: address,
                maxCount: 25,
              }),
            ]);
            // Merge and sort by block desc
            const all = [...sent.transfers, ...received.transfers].sort(
              (a, b) =>
                parseInt(b.blockNum, 16) - parseInt(a.blockNum, 16)
            );
            return { transfers: all.slice(0, 50) };
          }
          const params =
            direction === "to"
              ? { toAddress: address, maxCount: 50 }
              : { fromAddress: address, maxCount: 50 };
          return getAssetTransfers(chain, params);
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

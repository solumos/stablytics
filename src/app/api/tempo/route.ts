import { NextResponse } from "next/server";
import { getChain } from "@/lib/chains/registry";
import {
  getTempoTokensWithSupply,
  getTempoTokenBalances,
  classifyTempoTx,
  decodeFunctionName,
  getTempoTokenList,
} from "@/lib/chains/tempo";
import {
  getTransaction,
  getTransactionReceipt,
  getBlock,
} from "@/lib/chains/evm-rpc";
import { cached } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "tokens";
    const chain = getChain("tempo")!;

    if (action === "tokens") {
      const tokens = await cached(
        "tempo:tokens",
        () => getTempoTokensWithSupply(chain),
        60_000
      );
      return NextResponse.json({ tokens });
    }

    if (action === "address-tokens") {
      const address = searchParams.get("address");
      if (!address)
        return NextResponse.json({ error: "address required" }, { status: 400 });

      const balances = await cached(
        `tempo:addr-tokens:${address.toLowerCase()}`,
        () => getTempoTokenBalances(chain, address)
      );
      return NextResponse.json({ tokenBalances: balances });
    }

    if (action === "tx-enriched") {
      const hash = searchParams.get("hash");
      if (!hash)
        return NextResponse.json({ error: "hash required" }, { status: 400 });

      const result = await cached(`tempo:tx-enriched:${hash}`, async () => {
        const [tx, receipt, tokens] = await Promise.all([
          getTransaction(chain, hash),
          getTransactionReceipt(chain, hash),
          cached("tempo:tokenlist", () => getTempoTokenList(), 60_000),
        ]);
        const block = await getBlock(chain, tx.blockNumber);

        const lane = classifyTempoTx(tx.from, tx.to, tx.input);
        const functionName = decodeFunctionName(tx.input);

        let feeTokenSymbol: string | null = null;
        let feeTokenDecimals = 6;
        if (receipt.feeToken) {
          const ft = tokens.find(
            (t) => t.address.toLowerCase() === receipt.feeToken!.toLowerCase()
          );
          if (ft) {
            feeTokenSymbol = ft.symbol;
            feeTokenDecimals = ft.decimals;
          }
        }

        let targetTokenSymbol: string | null = null;
        let targetTokenDecimals = 6;
        if (tx.to) {
          const tt = tokens.find(
            (t) => t.address.toLowerCase() === tx.to!.toLowerCase()
          );
          if (tt) {
            targetTokenSymbol = tt.symbol;
            targetTokenDecimals = tt.decimals;
          }
        }

        return {
          lane,
          functionName,
          feeTokenSymbol,
          feeTokenDecimals,
          targetTokenSymbol,
          targetTokenDecimals,
          feeWei: (receipt.gasUsed * receipt.effectiveGasPrice).toString(),
        };
      });

      return NextResponse.json(result);
    }

    if (action === "transfers") {
      const result = await cached("tempo:stablecoin-transfers", async () => {
        // Fetch latest block, then get Transfer logs from last 500 blocks
        const latestHex = await fetch(chain.rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_blockNumber", params: [] }),
          cache: "no-store",
        }).then((r) => r.json()).then((d) => d.result);

        const latest = parseInt(latestHex, 16);
        const from = latest - 500;

        const logsRes = await fetch(chain.rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0", id: 2, method: "eth_getLogs",
            params: [{
              fromBlock: `0x${from.toString(16)}`,
              toBlock: `0x${latest.toString(16)}`,
              topics: ["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"],
            }],
          }),
          cache: "no-store",
        }).then((r) => r.json());

        const logs = logsRes.result || [];
        const tokenList = await cached("tempo:tokenlist", () => getTempoTokenList(), 60_000);

        const transfers = logs
          .filter((l: any) => l.topics?.length >= 3)
          .map((l: any) => {
            const tokenAddr = l.address?.toLowerCase();
            const token = tokenList.find((t) => t.address.toLowerCase() === tokenAddr);
            const decimals = token?.decimals || 6;
            let value = 0;
            try { value = Number(BigInt(l.data)) / 10 ** decimals; } catch {}

            return {
              hash: l.transactionHash,
              from: "0x" + l.topics[1].slice(26),
              to: "0x" + l.topics[2].slice(26),
              value,
              asset: token?.symbol || "Unknown",
              blockNumber: parseInt(l.blockNumber, 16),
            };
          })
          .filter((t: any) => t.value >= 0.01 && t.value < 1_000_000_000)
          .reverse()
          .slice(0, 50);

        return { transfers };
      });

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

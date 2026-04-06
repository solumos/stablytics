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

    return NextResponse.json({ error: "unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}

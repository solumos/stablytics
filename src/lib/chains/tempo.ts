// Tempo-specific enrichments on top of the generic EVM RPC client.
// Token list, TIP-20 balances, payment lane classification.

import type { ChainConfig } from "./registry";

const TOKENLIST_URL = "https://tokenlist.tempo.xyz";
const CHAIN_ID = 4217;

export interface TempoToken {
  name: string;
  symbol: string;
  decimals: number;
  address: string;
  logoURI: string;
  extensions?: {
    chain?: string;
    label?: string;
    bridgeInfo?: { sourceChainId: number; sourceAddress: string };
  };
}

export async function getTempoTokenList(): Promise<TempoToken[]> {
  const res = await fetch(`${TOKENLIST_URL}/list/${CHAIN_ID}`, {
    cache: "no-store",
  });
  const data = await res.json();
  return data.tokens;
}

// ERC20 calls via generic RPC
const ERC20_TOTAL_SUPPLY = "0x18160ddd";
const ERC20_BALANCE_OF = "0x70a08231";

async function ethCall(
  rpcUrl: string,
  to: string,
  data: string
): Promise<string> {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [{ to, data }, "latest"],
    }),
    cache: "no-store",
  });
  const json = await res.json();
  return json.result || "0x";
}

export async function getTempoTokenTotalSupply(
  rpcUrl: string,
  tokenAddress: string
): Promise<bigint> {
  const result = await ethCall(rpcUrl, tokenAddress, ERC20_TOTAL_SUPPLY);
  return result === "0x" ? 0n : BigInt(result);
}

export async function getTempoTokenBalance(
  rpcUrl: string,
  tokenAddress: string,
  holder: string
): Promise<bigint> {
  const paddedHolder = holder.slice(2).padStart(64, "0");
  const result = await ethCall(
    rpcUrl,
    tokenAddress,
    ERC20_BALANCE_OF + paddedHolder
  );
  return result === "0x" ? 0n : BigInt(result);
}

export async function getTempoTokenBalances(
  chain: ChainConfig,
  address: string
): Promise<
  {
    token: TempoToken;
    balance: string;
  }[]
> {
  const tokens = await getTempoTokenList();
  const balances = await Promise.all(
    tokens.map(async (t) => {
      try {
        const bal = await getTempoTokenBalance(chain.rpcUrl, t.address, address);
        return { token: t, balance: bal.toString() };
      } catch {
        return { token: t, balance: "0" };
      }
    })
  );
  return balances.filter((b) => b.balance !== "0");
}

export async function getTempoTokensWithSupply(
  chain: ChainConfig
): Promise<(TempoToken & { totalSupply: string })[]> {
  const tokens = await getTempoTokenList();
  return Promise.all(
    tokens.map(async (t) => {
      try {
        const supply = await getTempoTokenTotalSupply(chain.rpcUrl, t.address);
        return { ...t, totalSupply: supply.toString() };
      } catch {
        return { ...t, totalSupply: "0" };
      }
    })
  );
}

// Payment lane classification
const TIP20_PREFIX = "0x20c000000000000000000000";

const PAYMENT_SELECTORS: Record<string, number> = {
  "0xa9059cbb": 4 + 64,
  "0x23b872dd": 4 + 96,
  "0x095ea7b3": 4 + 64,
  "0x40c10f19": 4 + 64,
  "0x42966c68": 4 + 32,
  "0xb3cea217": 4 + 96,
  "0x8d3df1a6": 4 + 128,
  "0x5a1b6e4d": 4 + 96,
  "0x7e13c6c2": 4 + 64,
};

export type TxLane = "payment" | "general" | "system";

export function classifyTempoTx(
  from: string,
  to: string | null,
  input: string
): TxLane {
  if (from === "0x0000000000000000000000000000000000000000") return "system";
  if (!to) return "general";
  if (!to.toLowerCase().startsWith(TIP20_PREFIX)) return "general";
  if (!input || input === "0x" || input.length < 10) return "general";
  const selector = input.slice(0, 10).toLowerCase();
  const expected = PAYMENT_SELECTORS[selector];
  if (!expected) return "general";
  if ((input.length - 2) / 2 !== expected) return "general";
  return "payment";
}

const FUNCTION_NAMES: Record<string, string> = {
  "0xa9059cbb": "Transfer",
  "0x23b872dd": "Transfer From",
  "0x095ea7b3": "Approve",
  "0x40c10f19": "Mint",
  "0x42966c68": "Burn",
  "0xb3cea217": "Transfer (with memo)",
  "0x8d3df1a6": "Transfer From (with memo)",
  "0x5a1b6e4d": "Mint (with memo)",
  "0x7e13c6c2": "Burn (with memo)",
};

export function decodeFunctionName(input: string): string | null {
  if (!input || input === "0x" || input.length < 10) return null;
  return FUNCTION_NAMES[input.slice(0, 10).toLowerCase()] || null;
}

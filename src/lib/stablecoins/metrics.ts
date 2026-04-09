// Compute stablecoin transfer metrics by sampling recent on-chain data.
// Uses eth_getLogs for EVM chains (via Alchemy) and chain-specific APIs for others.

import { cached } from "@/lib/cache";
import { CHAINS, type ChainConfig } from "@/lib/chains/registry";
import { STABLECOIN_ADDRESSES } from "./addresses";

const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY || "";
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

// ── Types ──

export interface ChainMetrics {
  chain: string;
  chainSlug: string;
  transactions: number;
  volume: number;
  senders: number;
  receivers: number;
  sampleHours: number; // how many hours the sample covers
}

export interface GlobalMetrics {
  transactions: number;
  volume: number;
  senders: number;
  receivers: number;
  chains: ChainMetrics[];
  sampledAt: number;
}

// ── EVM sampling via eth_getLogs ──

async function sampleEvmChain(
  chain: ChainConfig,
  stablecoins: Record<string, string>
): Promise<ChainMetrics> {
  if (!chain.rpcUrl.includes("alchemy.com")) {
    return emptyMetrics(chain);
  }

  try {
    const rpcUrl = chain.rpcUrl;

    // Get latest block
    const latestHex = await rpcCall(rpcUrl, "eth_blockNumber");
    const latest = parseInt(latestHex, 16);

    // Sample ~1hr of blocks
    const blocksPerHour = Math.round(3600 / (chain.blockTime || 12));
    const from = latest - blocksPerHour;

    // Fetch Transfer logs for top 3 stablecoins in parallel
    const addresses = Object.values(stablecoins).slice(0, 3);
    const results = await Promise.all(
      addresses.map((addr) =>
        rpcCall(rpcUrl, "eth_getLogs", [
          {
            fromBlock: `0x${from.toString(16)}`,
            toBlock: `0x${latest.toString(16)}`,
            address: addr,
            topics: [TRANSFER_TOPIC],
          },
        ]).catch(() => [] as any[])
      )
    );

    const senders = new Set<string>();
    const receivers = new Set<string>();
    let volume = 0;
    let txCount = 0;

    // Max $1B per single transfer — anything higher is likely a mint/burn or internal accounting
    const MAX_TRANSFER_USD = 1_000_000_000;

    for (const logs of results) {
      if (!Array.isArray(logs)) continue;
      txCount += logs.length;
      for (const log of logs) {
        if (log.topics?.length >= 3) {
          senders.add(log.topics[1]);
          receivers.add(log.topics[2]);
          try {
            const raw = BigInt(log.data);
            const usd = Number(raw) / 1e6; // 6 decimals for stablecoins
            if (usd > 0 && usd < MAX_TRANSFER_USD) {
              volume += usd;
            }
          } catch {}
        }
      }
    }

    return {
      chain: chain.name,
      chainSlug: chain.slug,
      transactions: txCount,
      volume,
      senders: senders.size,
      receivers: receivers.size,
      sampleHours: 1,
    };
  } catch {
    return emptyMetrics(chain);
  }
}

// ── Tron sampling ──

async function sampleTron(): Promise<ChainMetrics> {
  const TRON_API = "https://api.trongrid.io";
  const USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

  try {
    const res = await fetch(
      `${TRON_API}/v1/accounts/${USDT}/transactions/trc20?limit=200`,
      {
        headers: { "User-Agent": "stablytics/1.0" },
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      }
    );
    const data = await res.json();
    const txns = data.data || [];

    const senders = new Set<string>();
    const receivers = new Set<string>();
    let volume = 0;

    for (const t of txns) {
      senders.add(t.from);
      receivers.add(t.to);
      const decimals = t.token_info?.decimals || 6;
      volume += parseInt(t.value || "0") / 10 ** decimals;
    }

    // Compute time span
    const t0 = txns[0]?.block_timestamp || 0;
    const tN = txns[txns.length - 1]?.block_timestamp || 0;
    const hours = t0 && tN ? (t0 - tN) / (1000 * 3600) : 1;

    return {
      chain: "Tron",
      chainSlug: "tron",
      transactions: txns.length,
      volume,
      senders: senders.size,
      receivers: receivers.size,
      sampleHours: Math.max(hours, 0.01),
    };
  } catch {
    return emptyMetrics(CHAINS.find((c) => c.slug === "tron")!);
  }
}

// ── Solana sampling ──

async function sampleSolana(): Promise<ChainMetrics> {
  const SOL_RPC = `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;
  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

  try {
    const res = await fetch(SOL_RPC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getSignaturesForAddress",
        params: [USDC_MINT, { limit: 200 }],
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    const data = await res.json();
    const sigs = data.result || [];

    const successful = sigs.filter((s: any) => !s.err);
    const t0 = sigs[0]?.blockTime || 0;
    const tN = sigs[sigs.length - 1]?.blockTime || 0;
    const hours = t0 && tN ? (t0 - tN) / 3600 : 1;

    return {
      chain: "Solana",
      chainSlug: "solana",
      transactions: successful.length,
      volume: 0, // can't get volume from signatures alone
      senders: 0,
      receivers: 0,
      sampleHours: Math.max(hours, 0.01),
    };
  } catch {
    return emptyMetrics(CHAINS.find((c) => c.slug === "solana")!);
  }
}

// ── Helpers ──

function emptyMetrics(chain: ChainConfig): ChainMetrics {
  return {
    chain: chain.name,
    chainSlug: chain.slug,
    transactions: 0,
    volume: 0,
    senders: 0,
    receivers: 0,
    sampleHours: 1,
  };
}

async function rpcCall(rpcUrl: string, method: string, params?: unknown[]): Promise<any> {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params: params || [] }),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

// ── Main aggregator ──

export async function getStablecoinMetrics(): Promise<GlobalMetrics> {
  return cached(
    "stablecoin-metrics",
    async () => {
      // Sample Alchemy EVM chains in parallel
      const alchemyChains = CHAINS.filter(
        (c) => c.explorerEnabled && c.rpcUrl.includes("alchemy.com")
      );

      const evmResults = await Promise.all(
        alchemyChains.map((chain) => {
          const addrs = STABLECOIN_ADDRESSES[chain.slug] || {};
          return sampleEvmChain(chain, addrs);
        })
      );

      // Sample non-EVM chains
      const [tronResult, solanaResult] = await Promise.all([
        sampleTron(),
        sampleSolana(),
      ]);

      const chains = [...evmResults, tronResult, solanaResult].filter(
        (c) => c.transactions > 0
      );

      // Normalize to per-hour rates
      let txnsPerHour = 0;
      let volumePerHour = 0;
      let sendersPerHour = 0;
      let receiversPerHour = 0;

      for (const c of chains) {
        const h = c.sampleHours || 1;
        txnsPerHour += c.transactions / h;
        volumePerHour += c.volume / h;
        sendersPerHour += c.senders / h;
        receiversPerHour += c.receivers / h;
      }

      return {
        // Store as per-hour rates for clean extrapolation
        transactions: Math.round(txnsPerHour),
        volume: Math.round(volumePerHour),
        senders: Math.round(sendersPerHour),
        receivers: Math.round(receiversPerHour),
        chains: chains.sort((a, b) => b.transactions - a.transactions),
        sampledAt: Date.now(),
      };
    },
    60_000 // 60s cache — these are samples, not exact counts
  );
}

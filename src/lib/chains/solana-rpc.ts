const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY || "";
const RPC_URL = `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;

let rpcId = 1;

async function rpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: rpcId++, method, params }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Solana RPC HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result as T;
}

// ── Types ──

export interface SolanaBlock {
  slot: number;
  blockHeight: number;
  blockTime: number;
  parentSlot: number;
  blockhash: string;
  previousBlockhash: string;
  txCount: number;
  signatures: string[];
}

export interface SolanaSignature {
  signature: string;
  slot: number;
  blockTime: number | null;
  err: unknown;
  memo: string | null;
  confirmationStatus: string;
}

export interface SolanaAccount {
  address: string;
  lamports: number;
  owner: string;
  executable: boolean;
  rentEpoch: number;
  isToken: boolean;
  tokenInfo?: {
    type: string; // "mint" | "account"
    decimals?: number;
    supply?: string;
    mintAuthority?: string;
    freezeAuthority?: string;
    // token account fields
    mint?: string;
    owner?: string;
    tokenAmount?: { amount: string; decimals: number; uiAmount: number };
  };
}

export interface SolanaTokenBalance {
  mint: string;
  owner: string;
  amount: string;
  decimals: number;
  uiAmount: number;
}

export interface SolanaPerformance {
  avgTps: number;
  avgSlotTime: number;
  nonVoteTps: number;
}

// ── API ──

export async function getLatestSlot(): Promise<number> {
  return rpc<number>("getSlot");
}

export async function getBlock(slot: number): Promise<SolanaBlock | null> {
  try {
    const raw = await rpc<{
      blockHeight: number;
      blockTime: number | null;
      parentSlot: number;
      blockhash: string;
      previousBlockhash: string;
      signatures?: string[];
    }>("getBlock", [
      slot,
      {
        encoding: "json",
        transactionDetails: "signatures",
        maxSupportedTransactionVersion: 0,
      },
    ]);
    if (!raw) return null;
    return {
      slot,
      blockHeight: raw.blockHeight,
      blockTime: raw.blockTime || 0,
      parentSlot: raw.parentSlot,
      blockhash: raw.blockhash,
      previousBlockhash: raw.previousBlockhash,
      txCount: raw.signatures?.length || 0,
      signatures: raw.signatures || [],
    };
  } catch {
    return null;
  }
}

export async function getBlockRange(
  fromSlot: number,
  count: number
): Promise<SolanaBlock[]> {
  const blocks: SolanaBlock[] = [];
  // Solana slots can be skipped, so we try sequentially
  let slot = fromSlot;
  let attempts = 0;
  while (blocks.length < count && attempts < count * 3) {
    const block = await getBlock(slot);
    if (block) blocks.push(block);
    slot--;
    attempts++;
  }
  return blocks;
}

export async function getPerformance(): Promise<SolanaPerformance> {
  const samples = await rpc<
    {
      numTransactions: number;
      numNonVoteTransactions: number;
      numSlots: number;
      samplePeriodSecs: number;
      slot: number;
    }[]
  >("getRecentPerformanceSamples", [5]);

  let totalTxns = 0;
  let totalNonVote = 0;
  let totalTime = 0;
  let totalSlots = 0;
  for (const s of samples) {
    totalTxns += s.numTransactions;
    totalNonVote += s.numNonVoteTransactions;
    totalTime += s.samplePeriodSecs;
    totalSlots += s.numSlots;
  }

  return {
    avgTps: totalTime > 0 ? totalTxns / totalTime : 0,
    nonVoteTps: totalTime > 0 ? totalNonVote / totalTime : 0,
    avgSlotTime: totalSlots > 0 ? totalTime / totalSlots : 0.4,
  };
}

export async function getAccountInfo(
  address: string
): Promise<SolanaAccount> {
  const result = await rpc<{
    value: {
      lamports: number;
      owner: string;
      executable: boolean;
      rentEpoch: number;
      data:
        | { parsed: { type: string; info: Record<string, unknown>; program?: string }; program: string }
        | string[];
    } | null;
  }>("getAccountInfo", [address, { encoding: "jsonParsed" }]);

  if (!result.value) {
    return {
      address,
      lamports: 0,
      owner: "",
      executable: false,
      rentEpoch: 0,
      isToken: false,
    };
  }

  const v = result.value;
  let isToken = false;
  let tokenInfo: SolanaAccount["tokenInfo"];

  if (typeof v.data === "object" && "parsed" in v.data) {
    const parsed = v.data.parsed;
    if (
      v.owner === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" ||
      v.owner === "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
    ) {
      isToken = true;
      const info = parsed.info as Record<string, unknown>;
      tokenInfo = {
        type: parsed.type,
        decimals: info.decimals as number | undefined,
        supply: info.supply as string | undefined,
        mintAuthority: info.mintAuthority as string | undefined,
        freezeAuthority: info.freezeAuthority as string | undefined,
        mint: info.mint as string | undefined,
        owner: info.owner as string | undefined,
        tokenAmount: info.tokenAmount as
          | { amount: string; decimals: number; uiAmount: number }
          | undefined,
      };
    }
  }

  return {
    address,
    lamports: v.lamports,
    owner: v.owner,
    executable: v.executable,
    rentEpoch: v.rentEpoch,
    isToken,
    tokenInfo,
  };
}

export async function getTokenAccountsByOwner(
  owner: string
): Promise<SolanaTokenBalance[]> {
  const result = await rpc<{
    value: {
      pubkey: string;
      account: {
        data: {
          parsed: {
            info: {
              mint: string;
              owner: string;
              tokenAmount: {
                amount: string;
                decimals: number;
                uiAmount: number;
              };
            };
          };
        };
      };
    }[];
  }>("getTokenAccountsByOwner", [
    owner,
    { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
    { encoding: "jsonParsed" },
  ]);

  return result.value
    .map((v) => {
      const info = v.account.data.parsed.info;
      return {
        mint: info.mint,
        owner: info.owner,
        amount: info.tokenAmount.amount,
        decimals: info.tokenAmount.decimals,
        uiAmount: info.tokenAmount.uiAmount,
      };
    })
    .filter((t) => t.uiAmount > 0)
    .sort((a, b) => b.uiAmount - a.uiAmount);
}

export async function getSignaturesForAddress(
  address: string,
  limit = 25
): Promise<SolanaSignature[]> {
  return rpc<SolanaSignature[]>("getSignaturesForAddress", [
    address,
    { limit },
  ]);
}

export async function getBalance(address: string): Promise<number> {
  const result = await rpc<{ value: number }>("getBalance", [address]);
  return result.value;
}

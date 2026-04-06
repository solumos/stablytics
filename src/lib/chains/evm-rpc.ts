import type { ChainConfig } from "./registry";

let rpcId = 1;

async function rpcCall<T>(
  rpcUrl: string,
  method: string,
  params: unknown[] = []
): Promise<T> {
  const res = await fetch(rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: rpcId++,
      method,
      params,
    }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result as T;
}

// ── Types ──

export interface EvmBlock {
  hash: string;
  number: number;
  timestamp: number;
  timestampMs: number;
  parentHash: string;
  miner: string;
  gasLimit: bigint;
  gasUsed: bigint;
  baseFeePerGas: bigint;
  size: number;
  txCount: number;
  transactions: string[];
}

export interface EvmTransaction {
  hash: string;
  type: number;
  from: string;
  to: string | null;
  value: bigint;
  input: string;
  nonce: number;
  gasPrice: bigint;
  gas: bigint;
  blockNumber: number;
  blockHash: string;
  transactionIndex: number;
}

export interface EvmReceipt {
  hash: string;
  type: number;
  status: boolean;
  from: string;
  to: string | null;
  contractAddress: string | null;
  gasUsed: bigint;
  effectiveGasPrice: bigint;
  blockNumber: number;
  blockHash: string;
  feeToken: string | null;
  feePayer: string | null;
  logs: RawLog[];
}

interface RawLog {
  address: string;
  topics: string[];
  data: string;
  blockNumber: string;
  transactionHash: string;
  logIndex: string;
  removed: boolean;
}

// ── Helpers ──

function hexToNumber(hex: string): number {
  return parseInt(hex, 16);
}

function hexToBigInt(hex: string): bigint {
  return BigInt(hex);
}

interface RawBlock {
  hash: string;
  number: string;
  timestamp: string;
  timestampMillis?: string;
  parentHash: string;
  miner: string;
  gasLimit: string;
  gasUsed: string;
  baseFeePerGas?: string;
  size: string;
  transactions: (string | RawTx)[];
}

interface RawTx {
  hash: string;
  type: string;
  from: string;
  to: string | null;
  value: string;
  input: string;
  nonce: string;
  gasPrice?: string;
  gas: string;
  blockHash: string;
  blockNumber: string;
  transactionIndex: string;
}

interface RawReceipt {
  transactionHash: string;
  type: string;
  status: string;
  from: string;
  to: string | null;
  contractAddress: string | null;
  gasUsed: string;
  effectiveGasPrice: string;
  blockHash: string;
  blockNumber: string;
  feeToken?: string;
  feePayer?: string;
  logs: RawLog[];
}

function parseBlock(raw: RawBlock, chain: ChainConfig): EvmBlock {
  const txs = raw.transactions || [];
  const timestampSec = hexToNumber(raw.timestamp);
  let timestampMs = timestampSec * 1000;
  if (chain.hasMillisTimestamps && raw.timestampMillis) {
    timestampMs = Number(hexToBigInt(raw.timestampMillis));
  }
  return {
    hash: raw.hash,
    number: hexToNumber(raw.number),
    timestamp: timestampSec,
    timestampMs,
    parentHash: raw.parentHash,
    miner: raw.miner,
    gasLimit: hexToBigInt(raw.gasLimit),
    gasUsed: hexToBigInt(raw.gasUsed),
    baseFeePerGas: raw.baseFeePerGas ? hexToBigInt(raw.baseFeePerGas) : 0n,
    size: hexToNumber(raw.size),
    txCount: txs.length,
    transactions:
      typeof txs[0] === "string"
        ? (txs as string[])
        : (txs as RawTx[]).map((t) => t.hash),
  };
}

function parseTx(raw: RawTx): EvmTransaction {
  return {
    hash: raw.hash,
    type: hexToNumber(raw.type),
    from: raw.from,
    to: raw.to,
    value: hexToBigInt(raw.value),
    input: raw.input,
    nonce: hexToNumber(raw.nonce),
    gasPrice: raw.gasPrice ? hexToBigInt(raw.gasPrice) : 0n,
    gas: hexToBigInt(raw.gas),
    blockNumber: hexToNumber(raw.blockNumber),
    blockHash: raw.blockHash,
    transactionIndex: hexToNumber(raw.transactionIndex),
  };
}

function parseReceipt(raw: RawReceipt): EvmReceipt {
  return {
    hash: raw.transactionHash,
    type: hexToNumber(raw.type),
    status: raw.status === "0x1",
    from: raw.from,
    to: raw.to,
    contractAddress: raw.contractAddress,
    gasUsed: hexToBigInt(raw.gasUsed),
    effectiveGasPrice: hexToBigInt(raw.effectiveGasPrice),
    blockNumber: hexToNumber(raw.blockNumber),
    blockHash: raw.blockHash,
    feeToken: raw.feeToken || null,
    feePayer: raw.feePayer || null,
    logs: raw.logs,
  };
}

// ── Public API ──

export async function getLatestBlockNumber(chain: ChainConfig): Promise<number> {
  const hex = await rpcCall<string>(chain.rpcUrl, "eth_blockNumber");
  return hexToNumber(hex);
}

export async function getBlock(
  chain: ChainConfig,
  numberOrTag: number | "latest",
  fullTxs = false
): Promise<EvmBlock> {
  const param =
    numberOrTag === "latest" ? "latest" : `0x${numberOrTag.toString(16)}`;
  const raw = await rpcCall<RawBlock>(chain.rpcUrl, "eth_getBlockByNumber", [
    param,
    fullTxs,
  ]);
  return parseBlock(raw, chain);
}

export async function getBlockRange(
  chain: ChainConfig,
  from: number,
  count: number
): Promise<EvmBlock[]> {
  const promises: Promise<EvmBlock>[] = [];
  for (let i = 0; i < count; i++) {
    promises.push(getBlock(chain, from - i));
  }
  return Promise.all(promises);
}

export async function getTransaction(
  chain: ChainConfig,
  hash: string
): Promise<EvmTransaction> {
  const raw = await rpcCall<RawTx>(chain.rpcUrl, "eth_getTransactionByHash", [
    hash,
  ]);
  return parseTx(raw);
}

export async function getTransactionReceipt(
  chain: ChainConfig,
  hash: string
): Promise<EvmReceipt> {
  const raw = await rpcCall<RawReceipt>(
    chain.rpcUrl,
    "eth_getTransactionReceipt",
    [hash]
  );
  return parseReceipt(raw);
}

export async function getBalance(
  chain: ChainConfig,
  address: string
): Promise<bigint> {
  const hex = await rpcCall<string>(chain.rpcUrl, "eth_getBalance", [
    address,
    "latest",
  ]);
  return hexToBigInt(hex);
}

export async function getCode(
  chain: ChainConfig,
  address: string
): Promise<string> {
  return rpcCall<string>(chain.rpcUrl, "eth_getCode", [address, "latest"]);
}

export async function getTxCount(
  chain: ChainConfig,
  address: string
): Promise<number> {
  const hex = await rpcCall<string>(chain.rpcUrl, "eth_getTransactionCount", [
    address,
    "latest",
  ]);
  return hexToNumber(hex);
}

export async function getGasPrice(chain: ChainConfig): Promise<bigint> {
  const hex = await rpcCall<string>(chain.rpcUrl, "eth_gasPrice");
  return hexToBigInt(hex);
}

// ── Alchemy Enhanced APIs ──

export interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  logo?: string;
}

export interface TokenMetadata {
  decimals: number;
  logo: string | null;
  name: string;
  symbol: string;
}

export interface AssetTransfer {
  blockNum: string;
  hash: string;
  from: string;
  to: string;
  value: number | null;
  asset: string | null;
  category: string;
  rawContract: {
    address: string | null;
    value: string | null;
    decimal: string | null;
  };
}

function isAlchemy(chain: ChainConfig): boolean {
  return chain.rpcUrl.includes("alchemy.com");
}

export async function getTokenBalances(
  chain: ChainConfig,
  address: string
): Promise<TokenBalance[]> {
  if (!isAlchemy(chain)) return [];

  const result = await rpcCall<{
    address: string;
    tokenBalances: { contractAddress: string; tokenBalance: string }[];
  }>(chain.rpcUrl, "alchemy_getTokenBalances", [address, "erc20"]);

  // Filter non-zero balances
  const nonZero = result.tokenBalances.filter(
    (t) =>
      t.tokenBalance !==
      "0x0000000000000000000000000000000000000000000000000000000000000000"
  );

  // Fetch metadata for top 20 tokens (avoid rate limits)
  const top = nonZero.slice(0, 20);
  const enriched = await Promise.all(
    top.map(async (t) => {
      try {
        const meta = await getTokenMetadata(chain, t.contractAddress);
        return {
          ...t,
          symbol: meta.symbol,
          name: meta.name,
          decimals: meta.decimals,
          logo: meta.logo || undefined,
        };
      } catch {
        return t;
      }
    })
  );

  return enriched;
}

export async function getTokenMetadata(
  chain: ChainConfig,
  tokenAddress: string
): Promise<TokenMetadata> {
  return rpcCall<TokenMetadata>(chain.rpcUrl, "alchemy_getTokenMetadata", [
    tokenAddress,
  ]);
}

export async function getAssetTransfers(
  chain: ChainConfig,
  params: {
    fromAddress?: string;
    toAddress?: string;
    contractAddresses?: string[];
    category?: string[];
    maxCount?: number;
    order?: "asc" | "desc";
    fromBlock?: string;
    toBlock?: string;
  }
): Promise<{ transfers: AssetTransfer[]; pageKey?: string }> {
  if (!isAlchemy(chain)) return { transfers: [] };

  const reqParams: Record<string, unknown> = {
    fromBlock: params.fromBlock || "0x0",
    toBlock: params.toBlock || "latest",
    category: params.category || ["external", "erc20"],
    order: params.order || "desc",
    maxCount: `0x${(params.maxCount || 25).toString(16)}`,
    withMetadata: true,
  };
  if (params.fromAddress) reqParams.fromAddress = params.fromAddress;
  if (params.toAddress) reqParams.toAddress = params.toAddress;
  if (params.contractAddresses) reqParams.contractAddresses = params.contractAddresses;

  const result = await rpcCall<{
    transfers: AssetTransfer[];
    pageKey?: string;
  }>(chain.rpcUrl, "alchemy_getAssetTransfers", [reqParams]);

  return result;
}

export interface NetworkStats {
  latestBlock: number;
  avgBlockTime: number;
  avgTps: number;
  totalTxnsInSample: number;
  gasPrice: bigint;
}

export async function getNetworkStats(
  chain: ChainConfig
): Promise<NetworkStats> {
  const latestBlockNum = await getLatestBlockNumber(chain);
  const blocks = await getBlockRange(chain, latestBlockNum, 10);

  let totalTxns = 0;
  let totalTimeMs = 0;
  for (let i = 0; i < blocks.length - 1; i++) {
    totalTxns += blocks[i].txCount;
    totalTimeMs += blocks[i].timestampMs - blocks[i + 1].timestampMs;
  }

  const totalTimeSec = totalTimeMs / 1000;
  const avgBlockTime = totalTimeSec / (blocks.length - 1);
  const avgTps = totalTimeSec > 0 ? totalTxns / totalTimeSec : 0;
  const gasPrice = await getGasPrice(chain);

  return {
    latestBlock: latestBlockNum,
    avgBlockTime: Math.max(avgBlockTime, 0.001),
    avgTps,
    totalTxnsInSample: totalTxns,
    gasPrice,
  };
}

const TRON_API = "https://api.trongrid.io";

const HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "User-Agent": "stablytics/1.0",
};

async function tronGet<T>(path: string): Promise<T> {
  const res = await fetch(`${TRON_API}${path}`, {
    headers: HEADERS,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`TronGrid HTTP ${res.status}`);
  return res.json();
}

async function tronPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${TRON_API}${path}`, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`TronGrid HTTP ${res.status}`);
  return res.json();
}

// ── Types ──

export interface TronBlock {
  number: number;
  timestamp: number;
  txCount: number;
  witnessAddress: string;
  blockId: string;
  parentHash: string;
}

export interface TronTransaction {
  txID: string;
  type: string;
  from?: string;
  to?: string;
  amount?: number;
  timestamp: number;
  blockNumber: number;
  confirmed: boolean;
}

export interface TronAccount {
  address: string;
  balance: number; // in TRX
  createTime: number;
  trc20Balances: { address: string; balance: string }[];
  isContract: boolean;
}

// ── Helpers ──

function hexToBase58(_hex: string): string {
  // TronGrid returns base58 in v1 API, hex in wallet API
  // We'll use the addresses as-is from the API
  return _hex;
}

interface RawBlock {
  blockID?: string;
  block_header?: {
    raw_data?: {
      number?: number;
      timestamp?: number;
      witness_address?: string;
      parentHash?: string;
    };
    witness_signature?: string[];
  };
  transactions?: RawTx[];
}

interface RawTx {
  txID: string;
  raw_data?: {
    contract?: {
      type?: string;
      parameter?: {
        value?: {
          owner_address?: string;
          to_address?: string;
          amount?: number;
          contract_address?: string;
        };
      };
    }[];
    timestamp?: number;
    ref_block_bytes?: string;
  };
  ret?: { contractRet?: string }[];
}

function parseBlock(raw: RawBlock): TronBlock {
  const hdr = raw.block_header?.raw_data || {};
  return {
    number: hdr.number || 0,
    timestamp: Math.floor((hdr.timestamp || 0) / 1000),
    txCount: raw.transactions?.length || 0,
    witnessAddress: hdr.witness_address || "",
    blockId: raw.blockID || "",
    parentHash: hdr.parentHash || "",
  };
}

function parseTx(raw: RawTx, blockNum: number): TronTransaction {
  const contract = raw.raw_data?.contract?.[0];
  const value = contract?.parameter?.value;
  return {
    txID: raw.txID,
    type: contract?.type || "Unknown",
    from: value?.owner_address,
    to: value?.to_address || value?.contract_address,
    amount: value?.amount ? value.amount / 1e6 : undefined,
    timestamp: Math.floor((raw.raw_data?.timestamp || 0) / 1000),
    blockNumber: blockNum,
    confirmed: raw.ret?.[0]?.contractRet === "SUCCESS",
  };
}

// ── API ──

export async function getLatestBlock(): Promise<TronBlock> {
  const raw = await tronPost<RawBlock>("/wallet/getnowblock", {});
  return parseBlock(raw);
}

export async function getBlockByNumber(num: number): Promise<TronBlock> {
  const raw = await tronPost<RawBlock>("/wallet/getblockbynum", { num });
  return parseBlock(raw);
}

export async function getBlockRange(
  from: number,
  count: number
): Promise<TronBlock[]> {
  // Fetch sequentially to avoid TronGrid rate limits
  const blocks: TronBlock[] = [];
  for (let i = 0; i < count; i++) {
    try {
      blocks.push(await getBlockByNumber(from - i));
    } catch { break; }
  }
  return blocks;
}

export async function getBlockWithTxns(
  num: number
): Promise<{ block: TronBlock; transactions: TronTransaction[] }> {
  const raw = await tronPost<RawBlock>("/wallet/getblockbynum", { num });
  const block = parseBlock(raw);
  const transactions = (raw.transactions || []).map((t) =>
    parseTx(t, block.number)
  );
  return { block, transactions };
}

export async function getAccount(address: string): Promise<TronAccount> {
  interface AccountResponse {
    data: {
      address?: string;
      balance?: number;
      create_time?: number;
      trc20?: Record<string, string>[];
      is_contract?: boolean;
    }[];
  }

  const data = await tronGet<AccountResponse>(
    `/v1/accounts/${address}`
  );
  const acct = data.data?.[0] || {};
  return {
    address: acct.address || address,
    balance: (acct.balance || 0) / 1e6,
    createTime: acct.create_time || 0,
    trc20Balances: (acct.trc20 || []).flatMap((t) =>
      Object.entries(t).map(([addr, bal]) => ({ address: addr, balance: bal }))
    ),
    isContract: acct.is_contract || false,
  };
}

export async function getAccountTransactions(
  address: string,
  limit = 25
): Promise<TronTransaction[]> {
  interface TxResponse {
    data: RawTx[];
  }

  const data = await tronGet<TxResponse>(
    `/v1/accounts/${address}/transactions?limit=${limit}`
  );
  return (data.data || []).map((t) => parseTx(t, 0));
}

export interface TronTrc20Transfer {
  txId: string;
  from: string;
  to: string;
  value: string;
  tokenSymbol: string;
  tokenAddress: string;
  tokenDecimals: number;
  timestamp: number;
}

export async function getAccountTrc20Transfers(
  address: string,
  contractAddress?: string,
  limit = 25
): Promise<TronTrc20Transfer[]> {
  let path = `/v1/accounts/${address}/transactions/trc20?limit=${limit}`;
  if (contractAddress) path += `&contract_address=${contractAddress}`;

  interface Trc20Response {
    data: {
      transaction_id: string;
      from: string;
      to: string;
      value: string;
      token_info: {
        symbol: string;
        address: string;
        decimals: number;
      };
      block_timestamp: number;
    }[];
  }

  const data = await tronGet<Trc20Response>(path);
  return (data.data || []).map((t) => ({
    txId: t.transaction_id,
    from: t.from,
    to: t.to,
    value: t.value,
    tokenSymbol: t.token_info?.symbol || "?",
    tokenAddress: t.token_info?.address || "",
    tokenDecimals: t.token_info?.decimals || 6,
    timestamp: Math.floor((t.block_timestamp || 0) / 1000),
  }));
}

export async function getTransactionById(
  txId: string
): Promise<TronTransaction | null> {
  const raw = await tronPost<RawTx>("/wallet/gettransactionbyid", {
    value: txId,
  });
  if (!raw.txID) return null;
  return parseTx(raw, 0);
}

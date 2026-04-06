const TON_API = "https://toncenter.com/api/v2";

async function tonGet<T>(method: string, params: Record<string, string | number> = {}): Promise<T> {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) qs.set(k, String(v));
  const url = `${TON_API}/${method}?${qs}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`TON API HTTP ${res.status}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "TON API error");
  return json.result as T;
}

// ── Types ──

export interface TonBlock {
  workchain: number;
  shard: string;
  seqno: number;
  genUtime: number;
  txCount: number;
}

export interface TonTransaction {
  hash: string;
  lt: string;
  utime: number;
  from: string;
  to: string;
  value: string; // in nanotons
  fee: string;
}

export interface TonAccount {
  address: string;
  balance: string; // nanotons
  status: string; // "active" | "uninitialized" | "frozen"
}

// ── API ──

export async function getMasterchainInfo(): Promise<{ seqno: number; lastUtime: number }> {
  const data = await tonGet<{
    last: { workchain: number; shard: string; seqno: number };
  }>("getMasterchainInfo");
  // Get timestamp from the block header
  const header = await tonGet<{ gen_utime: number }>("getBlockHeader", {
    workchain: data.last.workchain,
    shard: data.last.shard,
    seqno: data.last.seqno,
  });
  return { seqno: data.last.seqno, lastUtime: header.gen_utime };
}

export async function getBlockHeader(seqno: number): Promise<TonBlock> {
  const data = await tonGet<{
    gen_utime: number;
    workchain: number;
    shard: string;
    seqno: number;
  }>("getBlockHeader", {
    workchain: -1,
    shard: "-9223372036854775808",
    seqno,
  });
  return {
    workchain: data.workchain,
    shard: data.shard,
    seqno: data.seqno,
    genUtime: data.gen_utime,
    txCount: 0, // header doesn't include tx count
  };
}

export async function getBlockRange(fromSeqno: number, count: number): Promise<TonBlock[]> {
  const blocks: TonBlock[] = [];
  for (let i = 0; i < count; i++) {
    try {
      blocks.push(await getBlockHeader(fromSeqno - i));
    } catch { break; }
  }
  return blocks;
}

export async function getAccountInfo(address: string): Promise<TonAccount> {
  const data = await tonGet<{
    balance: string;
    state: string;
  }>("getAddressInformation", { address });
  return {
    address,
    balance: data.balance || "0",
    status: data.state || "uninitialized",
  };
}

export async function getTransactions(address: string, limit = 20): Promise<TonTransaction[]> {
  const data = await tonGet<{
    hash: string;
    lt: string;
    utime: number;
    in_msg?: { source?: string; destination?: string; value?: string };
    out_msgs?: { source?: string; destination?: string; value?: string }[];
    fee: string;
  }[]>("getTransactions", { address, limit });

  return data.map((t) => ({
    hash: t.hash,
    lt: t.lt,
    utime: t.utime,
    from: t.in_msg?.source || "",
    to: t.in_msg?.destination || address,
    value: t.in_msg?.value || "0",
    fee: t.fee || "0",
  }));
}

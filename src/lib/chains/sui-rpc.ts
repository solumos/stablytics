const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY || "";
const RPC_URL = `https://sui-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`;

let rpcId = 1;

async function rpc<T>(method: string, params: unknown[] = []): Promise<T> {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: rpcId++, method, params }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Sui RPC HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result as T;
}

// ── Types ──

export interface SuiCheckpoint {
  sequenceNumber: string;
  epoch: string;
  timestampMs: string;
  networkTotalTransactions: string;
  digest: string;
  transactions: string[];
}

export interface SuiBalance {
  coinType: string;
  totalBalance: string;
  coinObjectCount: number;
}

// ── API ──

export async function getLatestCheckpoint(): Promise<string> {
  return rpc<string>("sui_getLatestCheckpointSequenceNumber");
}

export async function getCheckpoint(seqNo: string): Promise<SuiCheckpoint> {
  return rpc<SuiCheckpoint>("sui_getCheckpoint", [seqNo]);
}

export async function getCheckpointRange(from: number, count: number): Promise<SuiCheckpoint[]> {
  const results: SuiCheckpoint[] = [];
  for (let i = 0; i < count; i++) {
    try {
      results.push(await getCheckpoint(String(from - i)));
    } catch { break; }
  }
  return results;
}

export async function getAllBalances(address: string): Promise<SuiBalance[]> {
  return rpc<SuiBalance[]>("suix_getAllBalances", [address]);
}

export async function getOwnedObjects(address: string, limit = 10): Promise<{ objectId: string; type: string }[]> {
  const result = await rpc<{
    data: { data: { objectId: string; type: string } }[];
  }>("suix_getOwnedObjects", [
    address,
    { options: { showType: true } },
    null,
    limit,
  ]);
  return result.data.map((d) => ({
    objectId: d.data.objectId,
    type: d.data.type,
  }));
}

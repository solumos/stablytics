import { cached } from "@/lib/cache";

const BASE = "https://stablecoins.llama.fi";

// ── Types ──

interface PeggedValue {
  peggedUSD?: number;
  peggedEUR?: number;
  peggedVAR?: number;
}

interface ChainCirculating {
  current: PeggedValue;
  circulatingPrevDay: PeggedValue;
  circulatingPrevWeek: PeggedValue;
  circulatingPrevMonth: PeggedValue;
}

// Yield-bearing / tokenized treasury products — tracked separately from stablecoins.
const YIELD_BEARING_SYMBOLS = new Set([
  "BUIDL",   // BlackRock USD Institutional Digital Liquidity
  "USYC",    // Circle USYC
  "USDY",    // Ondo US Dollar Yield
  "YLDS",    // Figure YLDS
  "USDTB",   // Ethena USDtb (T-bill backed)
  "TBILL",   // OpenEden TBILL
  "USD3",    // Web3 Dollar
  "USDV",    // Solomon USDv
  "csUSDL",  // Coinshift
  "KNOX",    // KNOX Dollar
  "OUSG",    // Ondo US Government Bond
  "BENJI",   // Franklin Templeton Benji
  "USTB",    // Superstate USTB
  "wUSDM",   // Mountain Protocol wrapped
  "USDM",    // Mountain Protocol
]);

function isYieldBearing(asset: PeggedAsset): boolean {
  if (asset.yieldBearing) return true;
  if (YIELD_BEARING_SYMBOLS.has(asset.symbol)) return true;
  return false;
}

interface PeggedAsset {
  id: string;
  name: string;
  symbol: string;
  gecko_id: string;
  pegType: string;
  pegMechanism: string;
  circulating: PeggedValue;
  circulatingPrevDay: PeggedValue;
  circulatingPrevWeek: PeggedValue;
  circulatingPrevMonth: PeggedValue;
  chainCirculating: Record<string, ChainCirculating>;
  chains: string[];
  price: number | null;
  yieldBearing?: boolean;
}

interface StablecoinsResponse {
  peggedAssets: PeggedAsset[];
  chains: string[];
}

interface ChainStablecoinSummary {
  gecko_id: string | null;
  totalCirculatingUSD: PeggedValue;
  tokenSymbol: string | null;
  name: string;
}

interface ChartPoint {
  date: string;
  totalCirculating: PeggedValue;
  totalCirculatingUSD: PeggedValue;
}

// ── Public types ──

export interface ChainStablecoinData {
  chain: string;
  totalSupply: number;
  change24h: number;
  change7d: number;
  change30d: number;
  dominantStablecoin: string;
  dominantStablecoinPct: number;
  topStablecoins: { symbol: string; supply: number; pct: number }[];
  stablecoinCount: number;
}

export interface StablecoinEntry {
  symbol: string;
  name: string;
  supply: number;
  change24h: number;
  change7d: number;
  pegType: string;
  mechanism: string;
  chainCount: number;
  currency: string; // "USD", "EUR", "BRL", etc.
}

export interface CurrencyGroup {
  currency: string;
  label: string;
  totalSupply: number;
  stablecoins: StablecoinEntry[];
}

export interface StablecoinOverview {
  totalGlobalSupply: number;
  globalChange24h: number;
  globalChange7d: number;
  globalChange30d: number;
  chains: ChainStablecoinData[];
  topStablecoins: StablecoinEntry[];
  nonUsdGroups: CurrencyGroup[];
  yieldBearingTokens: StablecoinEntry[];
  yieldBearingTotal: number;
  lastUpdated: number;
}

export interface ChainChartData {
  date: number;
  supply: number;
}

// ── Target chains ──

export const TARGET_CHAINS: Record<string, string> = {
  Ethereum: "Ethereum",
  Tron: "Tron",
  BSC: "BSC",
  Solana: "Solana",
  Avalanche: "Avalanche",
  Polygon: "Polygon",
  Arbitrum: "Arbitrum",
  "OP Mainnet": "Optimism",
  Base: "Base",
  TON: "TON",
  Sui: "Sui",
  Celo: "Celo",
  "ZKsync Era": "zkSync Era",
  Linea: "Linea",
  Scroll: "Scroll",
  Tempo: "Tempo",
  Stable: "Stable",
  "Hyperliquid L1": "Hyperliquid",
  Plasma: "Plasma",
  Stellar: "Stellar",
};

function pegUsd(v: PeggedValue | undefined): number {
  return v?.peggedUSD ?? 0;
}

function pegAny(v: PeggedValue | undefined): number {
  if (!v) return 0;
  return v.peggedUSD ?? v.peggedEUR ?? v.peggedVAR ?? 0;
}

const PEG_CURRENCY_MAP: Record<string, { currency: string; label: string }> = {
  peggedUSD: { currency: "USD", label: "US Dollar" },
  peggedEUR: { currency: "EUR", label: "Euro" },
  peggedGBP: { currency: "GBP", label: "British Pound" },
  peggedJPY: { currency: "JPY", label: "Japanese Yen" },
  peggedCHF: { currency: "CHF", label: "Swiss Franc" },
  peggedCAD: { currency: "CAD", label: "Canadian Dollar" },
  peggedAUD: { currency: "AUD", label: "Australian Dollar" },
  peggedSGD: { currency: "SGD", label: "Singapore Dollar" },
  peggedREAL: { currency: "BRL", label: "Brazilian Real" },
  peggedTRY: { currency: "TRY", label: "Turkish Lira" },
  peggedRUB: { currency: "RUB", label: "Russian Ruble" },
  peggedMXN: { currency: "MXN", label: "Mexican Peso" },
  peggedPHP: { currency: "PHP", label: "Philippine Peso" },
  peggedCNY: { currency: "CNY", label: "Chinese Yuan" },
  peggedVAR: { currency: "VAR", label: "Variable / Other" },
};

// ── Fetchers ──

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`DefiLlama ${res.status}: ${url}`);
  return res.json();
}

export async function getStablecoinOverview(): Promise<StablecoinOverview> {
  return cached(
    "defillama:overview",
    async () => {
      const data = await fetchJson<StablecoinsResponse>(
        `${BASE}/stablecoins?includePrices=true`
      );

      // Filter out yield-bearing / tokenized treasury products
      const stablecoins = data.peggedAssets.filter(
        (a) => !isYieldBearing(a)
      );

      // Global totals
      const totalGlobalSupply = stablecoins.reduce(
        (sum, a) => sum + pegUsd(a.circulating),
        0
      );
      const totalPrevDay = stablecoins.reduce(
        (sum, a) => sum + pegUsd(a.circulatingPrevDay),
        0
      );
      const totalPrevWeek = stablecoins.reduce(
        (sum, a) => sum + pegUsd(a.circulatingPrevWeek),
        0
      );
      const totalPrevMonth = stablecoins.reduce(
        (sum, a) => sum + pegUsd(a.circulatingPrevMonth),
        0
      );

      // Per-chain aggregation
      const chainMap = new Map<
        string,
        {
          supply: number;
          prevDay: number;
          prevWeek: number;
          prevMonth: number;
          stablecoins: { symbol: string; supply: number }[];
        }
      >();

      for (const [defillamaName] of Object.entries(TARGET_CHAINS)) {
        chainMap.set(defillamaName, {
          supply: 0,
          prevDay: 0,
          prevWeek: 0,
          prevMonth: 0,
          stablecoins: [],
        });
      }

      for (const asset of stablecoins) {
        for (const [chainName, chainData] of Object.entries(
          asset.chainCirculating
        )) {
          const entry = chainMap.get(chainName);
          if (!entry) continue;

          const supply = pegUsd(chainData.current);
          if (supply <= 0) continue;

          entry.supply += supply;
          entry.prevDay += pegUsd(chainData.circulatingPrevDay);
          entry.prevWeek += pegUsd(chainData.circulatingPrevWeek);
          entry.prevMonth += pegUsd(chainData.circulatingPrevMonth);
          entry.stablecoins.push({ symbol: asset.symbol, supply });
        }
      }

      const chains: ChainStablecoinData[] = [];
      for (const [defillamaName, displayName] of Object.entries(
        TARGET_CHAINS
      )) {
        const entry = chainMap.get(defillamaName);
        if (!entry || entry.supply <= 0) continue;

        // Sort stablecoins by supply
        entry.stablecoins.sort((a, b) => b.supply - a.supply);
        const top = entry.stablecoins.slice(0, 5).map((s) => ({
          symbol: s.symbol,
          supply: s.supply,
          pct: (s.supply / entry.supply) * 100,
        }));

        const dominant = entry.stablecoins[0];
        chains.push({
          chain: displayName,
          totalSupply: entry.supply,
          change24h:
            entry.prevDay > 0
              ? ((entry.supply - entry.prevDay) / entry.prevDay) * 100
              : 0,
          change7d:
            entry.prevWeek > 0
              ? ((entry.supply - entry.prevWeek) / entry.prevWeek) * 100
              : 0,
          change30d:
            entry.prevMonth > 0
              ? ((entry.supply - entry.prevMonth) / entry.prevMonth) * 100
              : 0,
          dominantStablecoin: dominant?.symbol ?? "—",
          dominantStablecoinPct: dominant
            ? (dominant.supply / entry.supply) * 100
            : 0,
          topStablecoins: top,
          stablecoinCount: entry.stablecoins.length,
        });
      }

      // Sort by total supply descending
      chains.sort((a, b) => b.totalSupply - a.totalSupply);

      // Build all stablecoin entries with currency classification
      function makeEntry(a: PeggedAsset): StablecoinEntry {
        const supply = pegAny(a.circulating);
        const prevDay = pegAny(a.circulatingPrevDay);
        const prevWeek = pegAny(a.circulatingPrevWeek);
        const currencyInfo = PEG_CURRENCY_MAP[a.pegType] || { currency: "OTHER", label: "Other" };
        return {
          symbol: a.symbol,
          name: a.name,
          supply,
          change24h: prevDay > 0 ? ((supply - prevDay) / prevDay) * 100 : 0,
          change7d: prevWeek > 0 ? ((supply - prevWeek) / prevWeek) * 100 : 0,
          pegType: a.pegType,
          mechanism: a.pegMechanism,
          chainCount: a.chains.length,
          currency: currencyInfo.currency,
        };
      }

      // Top USD stablecoins
      const topStablecoins = stablecoins
        .filter((a) => a.pegType === "peggedUSD" && pegUsd(a.circulating) > 0)
        .sort((a, b) => pegUsd(b.circulating) - pegUsd(a.circulating))
        .slice(0, 20)
        .map(makeEntry);

      // Non-USD groups
      const nonUsdMap = new Map<string, StablecoinEntry[]>();
      for (const a of stablecoins) {
        if (a.pegType === "peggedUSD") continue;
        const entry = makeEntry(a);
        if (entry.supply <= 0) continue;
        const curr = entry.currency;
        if (!nonUsdMap.has(curr)) nonUsdMap.set(curr, []);
        nonUsdMap.get(curr)!.push(entry);
      }

      // Manually add stablecoins not tracked by DefiLlama
      const manualEntries: StablecoinEntry[] = [
        { symbol: "MXNe", name: "MXNe (Ethena Mexican Peso)", supply: 0, change24h: 0, change7d: 0, pegType: "peggedMXN", mechanism: "crypto-backed", chainCount: 1, currency: "MXN" },
        { symbol: "MXNB", name: "MXNB (Brale Mexican Peso)", supply: 0, change24h: 0, change7d: 0, pegType: "peggedMXN", mechanism: "fiat-backed", chainCount: 1, currency: "MXN" },
      ];
      for (const entry of manualEntries) {
        if (!nonUsdMap.has(entry.currency)) nonUsdMap.set(entry.currency, []);
        nonUsdMap.get(entry.currency)!.push(entry);
      }

      const nonUsdGroups: CurrencyGroup[] = Array.from(nonUsdMap.entries())
        .map(([currency, coins]) => {
          coins.sort((a, b) => b.supply - a.supply);
          const info = Object.values(PEG_CURRENCY_MAP).find((p) => p.currency === currency);
          return {
            currency,
            label: info?.label || currency,
            totalSupply: coins.reduce((s, c) => s + c.supply, 0),
            stablecoins: coins,
          };
        })
        .filter((g) => g.totalSupply > 0 || g.stablecoins.length > 0)
        .sort((a, b) => b.totalSupply - a.totalSupply);

      // Yield-bearing tokens (separate from stablecoins)
      const yieldBearingTokens = data.peggedAssets
        .filter((a) => isYieldBearing(a))
        .map(makeEntry)
        .filter((e) => e.supply > 0)
        .sort((a, b) => b.supply - a.supply);

      const yieldBearingTotal = yieldBearingTokens.reduce(
        (s, t) => s + t.supply, 0
      );

      return {
        totalGlobalSupply,
        globalChange24h:
          totalPrevDay > 0
            ? ((totalGlobalSupply - totalPrevDay) / totalPrevDay) * 100
            : 0,
        globalChange7d:
          totalPrevWeek > 0
            ? ((totalGlobalSupply - totalPrevWeek) / totalPrevWeek) * 100
            : 0,
        globalChange30d:
          totalPrevMonth > 0
            ? ((totalGlobalSupply - totalPrevMonth) / totalPrevMonth) * 100
            : 0,
        chains,
        topStablecoins,
        nonUsdGroups,
        yieldBearingTokens,
        yieldBearingTotal,
        lastUpdated: Date.now(),
      };
    },
    60_000 // 60s cache — DefiLlama data updates infrequently
  );
}

export async function getChainChart(
  chain: string
): Promise<ChainChartData[]> {
  return cached(
    `defillama:chart:${chain}`,
    async () => {
      const data = await fetchJson<ChartPoint[]>(
        `${BASE}/stablecoincharts/${chain}`
      );
      return data.map((p) => ({
        date: parseInt(p.date),
        supply: pegUsd(p.totalCirculatingUSD),
      }));
    },
    300_000 // 5min cache for historical charts
  );
}

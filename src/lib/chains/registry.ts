const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY || "";

function alchemy(network: string): string {
  return `https://${network}.g.alchemy.com/v2/${ALCHEMY_KEY}`;
}

export interface ChainConfig {
  slug: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerEnabled: boolean;
  color: string;
  blockTime?: number; // expected block time in seconds
  tokenListUrl?: string;
  nativeSymbol: string;
  nativeDecimals: number;
  // Tempo-specific
  hasPaymentLanes?: boolean;
  hasTip20?: boolean;
  hasMillisTimestamps?: boolean;
}

export const CHAINS: ChainConfig[] = [
  {
    slug: "ethereum",
    name: "Ethereum",
    chainId: 1,
    rpcUrl: alchemy("eth-mainnet"),
    explorerEnabled: true,
    color: "#627EEA",
    blockTime: 12,
    nativeSymbol: "ETH",
    nativeDecimals: 18,
  },
  {
    slug: "base",
    name: "Base",
    chainId: 8453,
    rpcUrl: alchemy("base-mainnet"),
    explorerEnabled: true,
    color: "#0052FF",
    blockTime: 2,
    nativeSymbol: "ETH",
    nativeDecimals: 18,
  },
  {
    slug: "arbitrum",
    name: "Arbitrum",
    chainId: 42161,
    rpcUrl: alchemy("arb-mainnet"),
    explorerEnabled: true,
    color: "#28A0F0",
    blockTime: 0.25,
    nativeSymbol: "ETH",
    nativeDecimals: 18,
  },
  {
    slug: "optimism",
    name: "Optimism",
    chainId: 10,
    rpcUrl: alchemy("opt-mainnet"),
    explorerEnabled: true,
    color: "#FF0420",
    blockTime: 2,
    nativeSymbol: "ETH",
    nativeDecimals: 18,
  },
  {
    slug: "polygon",
    name: "Polygon",
    chainId: 137,
    rpcUrl: alchemy("polygon-mainnet"),
    explorerEnabled: true,
    color: "#8247E5",
    blockTime: 2,
    nativeSymbol: "POL",
    nativeDecimals: 18,
  },
  {
    slug: "avalanche",
    name: "Avalanche",
    chainId: 43114,
    rpcUrl: "https://api.avax.network/ext/bc/C/rpc",
    explorerEnabled: true,
    color: "#E84142",
    blockTime: 2,
    nativeSymbol: "AVAX",
    nativeDecimals: 18,
  },
  {
    slug: "bsc",
    name: "BSC",
    chainId: 56,
    rpcUrl: "https://bsc-dataseed.binance.org",
    explorerEnabled: true,
    color: "#F0B90B",
    blockTime: 3,
    nativeSymbol: "BNB",
    nativeDecimals: 18,
  },
  {
    slug: "tempo",
    name: "Tempo",
    chainId: 4217,
    rpcUrl: "https://rpc.tempo.xyz",
    explorerEnabled: true,
    color: "#34d399",
    blockTime: 0.5,
    tokenListUrl: "https://tokenlist.tempo.xyz",
    nativeSymbol: "ETH",
    nativeDecimals: 18,
    hasPaymentLanes: true,
    hasTip20: true,
    hasMillisTimestamps: true,
  },
  {
    slug: "stable",
    name: "Stable",
    chainId: 988,
    rpcUrl: "https://rpc.stable.xyz",
    explorerEnabled: true,
    color: "#3B82F6",
    blockTime: 0.7,
    nativeSymbol: "USDT0",
    nativeDecimals: 18,
  },
  {
    slug: "celo",
    name: "Celo",
    chainId: 42220,
    rpcUrl: "https://forno.celo.org",
    explorerEnabled: true,
    color: "#FCFF52",
    blockTime: 5,
    nativeSymbol: "CELO",
    nativeDecimals: 18,
  },
  {
    slug: "linea",
    name: "Linea",
    chainId: 59144,
    rpcUrl: "https://rpc.linea.build",
    explorerEnabled: true,
    color: "#61DFFF",
    blockTime: 2,
    nativeSymbol: "ETH",
    nativeDecimals: 18,
  },
  {
    slug: "scroll",
    name: "Scroll",
    chainId: 534352,
    rpcUrl: "https://rpc.scroll.io",
    explorerEnabled: true,
    color: "#FFEEDA",
    blockTime: 3,
    nativeSymbol: "ETH",
    nativeDecimals: 18,
  },
  {
    slug: "zksync",
    name: "zkSync Era",
    chainId: 324,
    rpcUrl: "https://mainnet.era.zksync.io",
    explorerEnabled: true,
    color: "#8B8DFC",
    blockTime: 1,
    nativeSymbol: "ETH",
    nativeDecimals: 18,
  },
  {
    slug: "plasma",
    name: "Plasma",
    chainId: -1,
    rpcUrl: "",
    explorerEnabled: false,
    color: "#FF6B35",
    nativeSymbol: "PLASMA",
    nativeDecimals: 18,
  },
  {
    slug: "hyperliquid",
    name: "Hyperliquid",
    chainId: 999,
    rpcUrl: "",
    explorerEnabled: false,
    color: "#77F2A1",
    nativeSymbol: "HYPE",
    nativeDecimals: 18,
  },
  // Non-EVM chains — explorer not yet supported
  {
    slug: "tron",
    name: "Tron",
    chainId: -1,
    rpcUrl: "tron",
    explorerEnabled: true,
    color: "#FF0013",
    nativeSymbol: "TRX",
    nativeDecimals: 6,
  },
  {
    slug: "solana",
    name: "Solana",
    chainId: -1,
    rpcUrl: "solana", // handled by dedicated solana-rpc module
    explorerEnabled: true,
    color: "#9945FF",
    nativeSymbol: "SOL",
    nativeDecimals: 9,
  },
  {
    slug: "ton",
    name: "TON",
    chainId: -1,
    rpcUrl: "",
    explorerEnabled: false,
    color: "#0098EA",
    nativeSymbol: "TON",
    nativeDecimals: 9,
  },
  {
    slug: "sui",
    name: "Sui",
    chainId: -1,
    rpcUrl: "",
    explorerEnabled: false,
    color: "#4DA2FF",
    nativeSymbol: "SUI",
    nativeDecimals: 9,
  },
];

export function getChain(slug: string): ChainConfig | undefined {
  return CHAINS.find((c) => c.slug === slug);
}

export function getEvmChains(): ChainConfig[] {
  return CHAINS.filter((c) => c.explorerEnabled);
}

export const CHAIN_SLUGS = CHAINS.map((c) => c.slug);

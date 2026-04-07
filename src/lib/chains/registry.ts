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
  blockTime?: number;
  tokenListUrl?: string;
  nativeSymbol: string;
  nativeDecimals: number;
  description?: string;
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
    description: "The original smart contract blockchain. Home to the largest stablecoin ecosystem — USDT and USDC were both born here. Most DeFi protocols, lending markets, and DEXs originate on Ethereum, making it the primary settlement layer for stablecoin activity.",
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
    description: "Coinbase's L2 built on the OP Stack. Native USDC via Circle's CCTP makes it a major stablecoin corridor. Home to x402 protocol for AI agent payments and a growing DeFi ecosystem with Aerodrome, Morpho, and others.",
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
    description: "The largest Ethereum L2 by TVL. Sub-second block times and low fees make it popular for stablecoin trading on GMX, Camelot, and other DeFi protocols. Supports both native USDC and bridged USDC.e.",
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
    description: "An Ethereum L2 using optimistic rollups. The OP Stack powers Base, Zora, and other chains in the Superchain ecosystem. Native USDC support and Velodrome DEX drive significant stablecoin volume.",
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
    description: "An EVM-compatible sidechain with low fees and fast finality. Major stablecoin presence driven by Aave, QuickSwap, and real-world payment integrations. Stripe, Meta, and other fintechs have used Polygon for stablecoin pilots.",
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
    description: "A high-throughput L1 with sub-second finality. Avalanche's C-Chain hosts significant stablecoin activity through Trader Joe, Pangolin, and institutional tokenization projects. Native USDC support via Circle.",
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
    description: "Binance's EVM-compatible chain. One of the largest stablecoin ecosystems globally — USDT, USDC, FDUSD, and formerly BUSD. PancakeSwap and Venus drive high stablecoin trading and lending volume.",
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
    description: "A purpose-built L1 for payments, incubated by Paradigm and Stripe. Sub-second finality, stablecoin-native gas fees (no ETH needed), dedicated payment lanes for guaranteed throughput, and native pathUSD stablecoin. Built on Reth with Simplex BFT consensus.",
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
    description: "An L1 purpose-built for instant USDT payments. USDT0 is the native gas token — fees are paid in stablecoins directly. Features gasless transactions via Gas Waivers and parallel EVM execution for 200K+ TPS.",
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
    description: "A mobile-first blockchain focused on financial inclusion. Supports stablecoin gas payments — users can pay fees in cUSD, USDC, or USDT. Home to Mento stablecoins spanning multiple currencies (USD, EUR, BRL, and more).",
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
    description: "A zkEVM L2 developed by Consensys (MetaMask's parent company). Growing stablecoin ecosystem with USDC, USDT, and DAI. Integrated with MetaMask for seamless stablecoin transactions.",
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
    description: "A zkEVM L2 focused on EVM equivalence. Supports the same stablecoin contracts as Ethereum with lower fees. Growing DeFi ecosystem with Ambient, Nuri, and Aave deployments.",
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
    description: "A zkEVM L2 by Matter Labs with native account abstraction. Enables gasless stablecoin transfers via paymasters — users can pay fees in USDC instead of ETH. Home to SyncSwap and other DeFi protocols.",
  },
  {
    slug: "plasma",
    name: "Plasma",
    chainId: 1648,
    rpcUrl: alchemy("plasma-mainnet"),
    explorerEnabled: true,
    color: "#FF6B35",
    nativeSymbol: "ETH",
    nativeDecimals: 18,
    description: "An EVM-compatible chain with over $1.4B in stablecoin supply. Focuses on high-throughput stablecoin transfers and DeFi applications.",
  },
  {
    slug: "hyperliquid",
    name: "Hyperliquid",
    chainId: 999,
    rpcUrl: "https://rpc.hyperliquid.xyz/evm",
    explorerEnabled: true,
    color: "#77F2A1",
    nativeSymbol: "HYPE",
    nativeDecimals: 18,
    description: "A high-performance L1 built for on-chain trading. Over $5B in stablecoin deposits powering the Hyperliquid DEX — the largest on-chain perpetuals exchange. USDC is the primary settlement asset.",
  },
  {
    slug: "stellar",
    name: "Stellar",
    chainId: -1,
    rpcUrl: "",
    explorerEnabled: false,
    color: "#7B61FF",
    nativeSymbol: "XLM",
    nativeDecimals: 7,
    description: "A payments-focused blockchain with native support for asset issuance. Home to $389M in stablecoins including USDC (via Circle partnership), EURC, and USDY. Soroban smart contracts enable programmable stablecoin logic.",
  },
  // Non-EVM chains with dedicated RPC clients
  {
    slug: "tron",
    name: "Tron",
    chainId: -1,
    rpcUrl: "tron",
    explorerEnabled: true,
    color: "#FF0013",
    nativeSymbol: "TRX",
    nativeDecimals: 6,
    description: "The #1 chain for USDT by a wide margin. Over $60B in USDT circulates on Tron, driven by low fees and fast transfers. Dominant in emerging markets for remittances and P2P payments. The USDD algorithmic stablecoin is also native to Tron.",
  },
  {
    slug: "solana",
    name: "Solana",
    chainId: -1,
    rpcUrl: "solana",
    explorerEnabled: true,
    color: "#9945FF",
    nativeSymbol: "SOL",
    nativeDecimals: 9,
    description: "A high-performance L1 with 400ms block times and parallel transaction processing. Major stablecoin presence with USDC (native via Circle), PYUSD (PayPal), and USDT. Stripe's stablecoin payments infrastructure runs on Solana.",
  },
  {
    slug: "ton",
    name: "TON",
    chainId: -1,
    rpcUrl: "ton",
    explorerEnabled: true,
    color: "#0098EA",
    nativeSymbol: "TON",
    nativeDecimals: 9,
    description: "The Open Network, integrated with Telegram's 900M+ users. Rapid USDT adoption driven by Telegram wallet and mini-apps. Tether launched native USDT on TON, making stablecoin payments accessible directly through the messaging app.",
  },
  {
    slug: "sui",
    name: "Sui",
    chainId: -1,
    rpcUrl: "sui",
    explorerEnabled: true,
    color: "#4DA2FF",
    nativeSymbol: "SUI",
    nativeDecimals: 9,
    description: "A Move-based L1 with object-centric data model and parallel execution. Growing stablecoin ecosystem with native USDC (via Circle) and integration with major DeFi protocols like Cetus and Navi.",
  },
];

export function getChain(slug: string): ChainConfig | undefined {
  return CHAINS.find((c) => c.slug === slug);
}

export function getEvmChains(): ChainConfig[] {
  return CHAINS.filter((c) => c.explorerEnabled);
}

export const CHAIN_SLUGS = CHAINS.map((c) => c.slug);

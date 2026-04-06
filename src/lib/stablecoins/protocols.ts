export interface ProtocolProfile {
  slug: string;
  name: string;
  category: "DEX" | "Lending" | "Payments" | "Bridge" | "Yield";
  description: string;
  longDescription: string;
  website: string;
  chains: string[];
  stablecoins: string[];
  stats?: {
    label: string;
    value: string;
  }[];
  features: string[];
  relevance: string; // why this matters for stablecoins
}

export const PROTOCOLS: ProtocolProfile[] = [
  {
    slug: "uniswap",
    name: "Uniswap",
    category: "DEX",
    description: "The largest decentralized exchange by volume.",
    longDescription:
      "Uniswap is the leading decentralized exchange protocol, facilitating token swaps across 40+ chains. It is the primary venue for stablecoin-to-stablecoin swaps and stablecoin liquidity provision. Uniswap V4 introduced hooks for customizable pool logic, enabling new stablecoin use cases like dynamic fees and limit orders.",
    website: "https://uniswap.org",
    chains: ["Ethereum", "Base", "Arbitrum", "Polygon", "Optimism", "BSC", "Avalanche", "Celo", "Scroll", "zkSync Era"],
    stablecoins: ["USDC", "USDT", "DAI", "USDS", "FRAX", "GHO", "crvUSD"],
    features: ["Concentrated Liquidity", "Multi-Chain", "V4 Hooks", "Limit Orders", "Auto-Router"],
    relevance: "Primary price discovery and liquidity venue for stablecoins. USDC-USDT and USDC-DAI are among the highest-volume pairs globally.",
  },
  {
    slug: "curve",
    name: "Curve Finance",
    category: "DEX",
    description: "The stablecoin DEX, optimized for low-slippage pegged asset swaps.",
    longDescription:
      "Curve Finance is specifically designed for efficient stablecoin and pegged asset trading. Its StableSwap invariant allows extremely low-slippage trades between assets that should trade at similar prices. Curve also issues crvUSD, its own stablecoin using the novel LLAMMA mechanism for soft liquidations.",
    website: "https://curve.fi",
    chains: ["Ethereum", "Arbitrum", "Polygon", "Optimism", "Base", "Avalanche", "BSC"],
    stablecoins: ["USDC", "USDT", "DAI", "FRAX", "crvUSD", "USDS", "GHO"],
    features: ["StableSwap AMM", "crvUSD Issuer", "LLAMMA Liquidations", "Gauge Rewards", "Multi-Chain"],
    relevance: "The go-to venue for stablecoin-to-stablecoin trading. Curve pools are critical infrastructure for maintaining stablecoin pegs and enabling large-size trades with minimal slippage.",
  },
  {
    slug: "aave",
    name: "Aave",
    category: "Lending",
    description: "The largest DeFi lending protocol. Issues GHO stablecoin.",
    longDescription:
      "Aave is a decentralized non-custodial lending protocol where users can supply and borrow crypto assets. Stablecoins are the most-borrowed asset class on Aave, making it a critical part of stablecoin velocity. Aave V3 introduced efficiency mode (eMode) for correlated assets like stablecoins, and the protocol issues GHO, its own native stablecoin.",
    website: "https://aave.com",
    chains: ["Ethereum", "Arbitrum", "Polygon", "Optimism", "Base", "Avalanche", "BSC", "Scroll"],
    stablecoins: ["USDC", "USDT", "DAI", "GHO", "FRAX", "USDS"],
    features: ["Flash Loans", "eMode (Stablecoin Efficiency)", "GHO Issuer", "Multi-Chain Markets", "Risk Isolation"],
    relevance: "Stablecoins are the most deposited and borrowed asset class on Aave. USDC and USDT markets drive billions in lending volume, and GHO adds native stablecoin issuance.",
  },
  {
    slug: "makerdao",
    name: "MakerDAO / Sky",
    category: "Lending",
    description: "The original DeFi lending protocol. Issues DAI and USDS.",
    longDescription:
      "MakerDAO (now rebranded to Sky) pioneered decentralized stablecoin issuance with DAI in 2017. Users lock collateral in smart contract vaults to mint DAI/USDS. The protocol has evolved from crypto-only collateral to include real-world assets (US Treasuries) and the Peg Stability Module (PSM) for direct USDC-DAI conversion.",
    website: "https://sky.money",
    chains: ["Ethereum"],
    stablecoins: ["DAI", "USDS"],
    features: ["Overcollateralized Vaults", "Peg Stability Module", "RWA Integration", "Decentralized Governance", "Savings Rate (DSR)"],
    relevance: "DAI was the first decentralized stablecoin and remains a DeFi cornerstone. The Sky Dollar (USDS) is the next evolution with improved yields and governance.",
  },
  {
    slug: "compound",
    name: "Compound",
    category: "Lending",
    description: "Algorithmic money market protocol for stablecoin lending and borrowing.",
    longDescription:
      "Compound is a decentralized lending protocol that algorithmically sets interest rates based on supply and demand. Compound V3 (Comet) uses a single-borrowable-asset model where USDC is the primary base asset, making it fundamentally a stablecoin lending protocol.",
    website: "https://compound.finance",
    chains: ["Ethereum", "Arbitrum", "Polygon", "Base"],
    stablecoins: ["USDC", "USDT", "DAI"],
    features: ["Single-Asset Comet Markets", "Algorithmic Rates", "COMP Governance", "Multi-Chain"],
    relevance: "Compound V3 is built around USDC as the base asset. It's one of the largest stablecoin lending venues and a key driver of stablecoin borrow demand.",
  },
  {
    slug: "cctp",
    name: "Circle CCTP",
    category: "Bridge",
    description: "Cross-Chain Transfer Protocol for native USDC bridging.",
    longDescription:
      "CCTP is Circle's official protocol for transferring native USDC across blockchains. Unlike third-party bridges that use wrapped/locked tokens, CCTP burns USDC on the source chain and mints native USDC on the destination chain, eliminating bridge risk and fragmented liquidity.",
    website: "https://circle.com/cross-chain-transfer-protocol",
    chains: ["Ethereum", "Arbitrum", "Optimism", "Base", "Polygon", "Avalanche", "Solana"],
    stablecoins: ["USDC"],
    features: ["Native Burn-and-Mint", "No Wrapped Tokens", "Attestation Service", "Permissionless"],
    relevance: "CCTP eliminates the need for bridged/wrapped USDC variants, unifying USDC liquidity across chains. It's becoming the standard for cross-chain stablecoin movement.",
  },
  {
    slug: "layerzero",
    name: "LayerZero / Stargate",
    category: "Bridge",
    description: "Omnichain interoperability protocol with native stablecoin bridging.",
    longDescription:
      "LayerZero is a cross-chain messaging protocol, and Stargate is its primary stablecoin bridging application. Stargate enables native asset transfers (not wrapped) across 20+ chains using a unified liquidity pool model. It's one of the highest-volume bridges for stablecoin transfers.",
    website: "https://layerzero.network",
    chains: ["Ethereum", "Arbitrum", "Optimism", "Base", "Polygon", "Avalanche", "BSC", "Solana"],
    stablecoins: ["USDC", "USDT", "USDC.e", "USDT.e"],
    features: ["Unified Liquidity Pools", "Instant Finality", "OFT Standard", "20+ Chains"],
    relevance: "Stargate is the highest-volume cross-chain stablecoin bridge. LayerZero's OFT standard is used by USDT0 and other stablecoins for native multi-chain deployment.",
  },
  {
    slug: "x402",
    name: "x402 Protocol",
    category: "Payments",
    description: "HTTP 402 payment protocol by Coinbase for AI agent stablecoin payments.",
    longDescription:
      "x402 is an open standard that enables internet-native payments using the HTTP 402 status code. Servers respond with payment requirements, clients pay in stablecoins, and access is granted. It's designed for machine-to-machine payments, particularly AI agents paying for API access.",
    website: "https://x402.org",
    chains: ["Base", "Ethereum"],
    stablecoins: ["USDC"],
    features: ["HTTP-Native", "Zero Friction", "AI Agent Payments", "No Accounts/KYC", "Open Standard"],
    relevance: "x402 represents the next frontier of stablecoin usage: programmatic micropayments between AI agents and APIs, turning stablecoins into internet-native money.",
  },
  {
    slug: "mpp",
    name: "Machine Payments Protocol",
    category: "Payments",
    description: "Stripe + Tempo protocol for machine-to-machine stablecoin payments.",
    longDescription:
      "MPP (Machine Payments Protocol) is co-developed by Stripe and Tempo for autonomous machine-to-machine stablecoin payments. It enables services to programmatically pay each other without human intervention, using Tempo's payment lanes for guaranteed settlement.",
    website: "https://tempo.xyz",
    chains: ["Tempo"],
    stablecoins: ["USDC", "pathUSD"],
    features: ["M2M Payments", "Payment Lanes", "Fee Sponsorship", "Stripe Integration"],
    relevance: "MPP is purpose-built for the emerging economy of autonomous services paying each other in stablecoins, leveraging Tempo's payment-native infrastructure.",
  },
];

export function getProtocolBySlug(slug: string): ProtocolProfile | undefined {
  return PROTOCOLS.find((p) => p.slug === slug);
}

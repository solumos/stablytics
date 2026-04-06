const LOGOS: Record<string, string> = {
  ethereum: "/chains/ethereum.png",
  base: "/chains/base.png",
  arbitrum: "/chains/arbitrum.png",
  optimism: "/chains/optimism.png",
  polygon: "/chains/polygon.png",
  avalanche: "/chains/avalanche.png",
  bsc: "/chains/bsc.png",
  solana: "/chains/solana.png",
  tron: "/chains/tron.png",
  ton: "/chains/ton.jpg",
  sui: "/chains/sui.png",
  celo: "/chains/celo.jpg",
  hyperliquid: "/chains/hyperliquid.jpg",
};

export function getChainLogo(slug: string): string | undefined {
  return LOGOS[slug];
}

const LOGOS: Record<string, string> = {
  USDT: "/logos/usdt.png",
  USDC: "/logos/usdc.png",
  DAI: "/logos/dai.png",
  USDS: "/logos/usds.webp",
  USDe: "/logos/usde.png",
  PYUSD: "/logos/pyusd.png",
  FRAX: "/logos/frax.png",
  GHO: "/logos/gho.png",
  TUSD: "/logos/tusd.png",
  BUSD: "/logos/busd.png",
  USDD: "/logos/usdd.jpg",
  EURC: "/logos/eurc.png",
  RLUSD: "/logos/rlusd.png",
  BUIDL: "/logos/buidl.png",
  crvUSD: "/logos/crvusd.jpg",
};

export function getCoinLogo(symbol: string): string | undefined {
  return LOGOS[symbol] || LOGOS[symbol.toUpperCase()];
}

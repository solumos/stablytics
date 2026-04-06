// Map symbol to local logo path. Only includes coins we have logos for.
// Logos stored in /public/logos/ as PNGs from CoinGecko.

const LOGOS: Record<string, string> = {
  USDT: "/logos/usdt.png",
  USDC: "/logos/usdc.png",
  DAI: "/logos/dai.png",
  USDe: "/logos/usde.png",
  EURC: "/logos/eurc.png",
  FRAX: "/logos/frax.png",
  GHO: "/logos/gho.png",
  TUSD: "/logos/tusd.png",
  BUSD: "/logos/busd.png",
};

export function getCoinLogo(symbol: string): string | undefined {
  return LOGOS[symbol] || LOGOS[symbol.toUpperCase()];
}

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
  USD1: "/logos/usd1.png",
  USDG: "/logos/usdg.png",
  USDf: "/logos/usdf.png",
  U: "/logos/u.jpg",
  FDUSD: "/logos/fdusd.png",
  pathUSD: "/logos/pathusd.png",
};

// Map bridged/wrapped variants to their base token logo
const ALIASES: Record<string, string> = {
  "USDC.e": "USDC",
  "USDC.b": "USDC",
  "USDbC": "USDC",
  "EURC.e": "EURC",
  "USDT.e": "USDT",
  "USDT0": "USDT",
  "frxUSD": "FRAX",
  "crvUSD": "crvUSD",
};

export function getCoinLogo(symbol: string): string | undefined {
  return LOGOS[symbol] || LOGOS[symbol.toUpperCase()] || LOGOS[ALIASES[symbol] || ""];
}

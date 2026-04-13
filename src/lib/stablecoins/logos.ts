const LOGOS: Record<string, string> = {
  USDT: "/logos/usdt.png",
  EURT: "/logos/eurt.png",
  XAUT: "/logos/xaut.png",
  MXNT: "/logos/mxnt.png",
  CNHT: "/logos/cnht.png",
  USDC: "/logos/usdc.png",
  EURC: "/logos/eurc.png",
  USYC: "/logos/usyc.png",
  DAI: "/logos/dai.png",
  USDS: "/logos/usds.webp",
  USDe: "/logos/usde.png",
  USDtb: "/logos/usdtb.png",
  PYUSD: "/logos/pyusd.png",
  USDG: "/logos/usdg.png",
  BUSD: "/logos/busd.png",
  PAX: "/logos/pax.png",
  USD1: "/logos/usd1.png",
  RLUSD: "/logos/rlusd.png",
  USDD: "/logos/usdd.jpg",
  GHO: "/logos/gho.png",
  USD0: "/logos/usd0.png",
  FRAX: "/logos/frax.png",
  crvUSD: "/logos/crvusd.jpg",
  FDUSD: "/logos/fdusd.png",
  pathUSD: "/logos/pathusd.png",
  // Non-USD stablecoins
  A7A5: "/logos/a7a5.png",
  BRZ: "/logos/brz.png",
  ZCHF: "/logos/zchf.png",
  EURCV: "/logos/eurcv.png",
  EURI: "/logos/euri.png",
  XSGD: "/logos/xsgd.png",
  tGBP: "/logos/tgbp.png",
  JPYC: "/logos/jpyc.png",
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

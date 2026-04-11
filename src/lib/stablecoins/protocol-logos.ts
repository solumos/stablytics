const LOGOS: Record<string, string> = {
  uniswap: "/protocols/uniswap.png",
  curve: "/protocols/curve.png",
  aave: "/protocols/aave.png",
  makerdao: "/protocols/makerdao.png",
  compound: "/protocols/compound.png",
  cctp: "/protocols/cctp.png",
  layerzero: "/protocols/layerzero.png",
  x402: "/protocols/x402.png",
  mpp: "/protocols/mpp.png",
  morpho: "/protocols/morpho.png",
  pendle: "/protocols/pendle.png",
};

export function getProtocolLogo(slug: string): string | undefined {
  return LOGOS[slug];
}

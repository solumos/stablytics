const LOGOS: Record<string, string> = {
  tether: "/issuers/tether.png",
  circle: "/issuers/circle.png",
  sky: "/issuers/sky.png",
  ethena: "/issuers/ethena.png",
  paxos: "/issuers/paxos.png",
  ripple: "/issuers/ripple.png",
  aave: "/issuers/aave.png",
  frax: "/issuers/frax.png",
  curve: "/issuers/curve.png",
  "first-digital": "/issuers/first-digital.png",
  wlfi: "/issuers/wlfi.png",
  "tron-dao": "/issuers/tron-dao.png",
  usual: "/issuers/usual.png",
};

export function getIssuerLogo(slug: string): string | undefined {
  return LOGOS[slug];
}

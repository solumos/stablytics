export interface IssuerProfile {
  slug: string;
  name: string;
  type: "Centralized" | "Decentralized";
  description: string;
  company?: {
    legalName?: string;
    jurisdiction?: string;
    founded?: string;
    ceo?: string;
    website?: string;
  };
  collateralization: string;
  reserves?: string;
  auditor?: string;
  regulatory?: string;
  coins: string[]; // symbols matched from DefiLlama
}

export const ISSUERS: IssuerProfile[] = [
  {
    slug: "tether",
    name: "Tether",
    type: "Centralized",
    description:
      "The largest stablecoin issuer by market cap. Tether issues USDT, the most widely used stablecoin across all blockchains, as well as Euro and Gold-pegged tokens.",
    company: {
      legalName: "Tether Holdings Limited",
      jurisdiction: "British Virgin Islands",
      founded: "2014",
      ceo: "Paolo Ardoino",
      website: "https://tether.to",
    },
    collateralization:
      "Backed by a reserve portfolio including US Treasury bills, cash and cash equivalents, secured loans, corporate bonds, and other investments. Claims 1:1 backing.",
    reserves:
      "Quarterly attestations published by BDO Italia. Reserve composition: ~80% US Treasuries and cash equivalents, ~10% secured loans, ~5% corporate bonds, ~5% other.",
    auditor: "BDO Italia (attestation, not full audit)",
    regulatory:
      "Not directly regulated as a bank. Registered as a money services business. Has faced scrutiny from NYAG (settled 2021). Compliant with EU MiCA as of 2025.",
    coins: ["USDT", "EURT", "XAUT", "MXNT", "CNHT"],
  },
  {
    slug: "circle",
    name: "Circle",
    type: "Centralized",
    description:
      "A regulated fintech company and the issuer of USDC, the second-largest stablecoin. Also issues EURC (Euro stablecoin) and operates Cross-Chain Transfer Protocol (CCTP).",
    company: {
      legalName: "Circle Internet Financial, LLC",
      jurisdiction: "United States (Boston, MA)",
      founded: "2013",
      ceo: "Jeremy Allaire",
      website: "https://circle.com",
    },
    collateralization:
      "Fully backed by cash and short-duration US Treasury securities. Reserves held at regulated financial institutions including BNY Mellon and BlackRock's Circle Reserve Fund.",
    reserves:
      "Monthly attestation reports by Deloitte. 100% backed by cash and US Treasuries. Reserve composition publicly available in BlackRock's Circle Reserve Fund (USDXX).",
    auditor: "Deloitte & Touche LLP",
    regulatory:
      "Licensed money transmitter in 49 US states. Registered with FinCEN. EMI license under EU MiCA. Pursuing IPO (filed S-1 with SEC).",
    coins: ["USDC", "EURC", "USYC"],
  },
  {
    slug: "sky",
    name: "Sky (MakerDAO)",
    type: "Decentralized",
    description:
      "The protocol behind DAI and USDS (Sky Dollar). One of the oldest DeFi protocols, operating a decentralized lending system where stablecoins are minted against collateral locked in smart contracts.",
    company: {
      website: "https://sky.money",
    },
    collateralization:
      "Overcollateralized by crypto assets (ETH, wstETH, wBTC), real-world assets (US Treasuries via various vault types), and other stablecoins (USDC via PSM). Minimum 150%+ collateral ratio for crypto vaults.",
    reserves:
      "Fully on-chain and auditable. Collateral held in smart contracts on Ethereum. Real-world asset exposure through MIP65 (Monetalis) and other vault arrangements.",
    auditor: "Multiple smart contract audits (Trail of Bits, ChainSecurity). On-chain transparency.",
    regulatory: "Decentralized governance via MKR/SKY token holders. No central entity.",
    coins: ["DAI", "USDS"],
  },
  {
    slug: "ethena",
    name: "Ethena",
    type: "Decentralized",
    description:
      "A synthetic dollar protocol that creates USDe by combining staked ETH collateral with short ETH perpetual futures positions to achieve a delta-neutral, yield-generating stablecoin.",
    company: {
      legalName: "Ethena Labs",
      jurisdiction: "British Virgin Islands",
      ceo: "Guy Young",
      website: "https://ethena.fi",
    },
    collateralization:
      "Delta-neutral synthetic backing: staked ETH (earning staking yield) + short ETH perps (earning funding rates). Not backed by fiat reserves. Collateral custodied at centralized exchanges via Copper ClearLoop and Fireblocks.",
    reserves:
      "Real-time dashboard at ethena.fi/transparency. Backing assets visible but held at centralized venues (Binance, Bybit, OKX, Deribit).",
    auditor: "Smart contract audits by Quantstamp, Pashov. Custodian: Copper ClearLoop.",
    regulatory: "Not regulated as a financial institution. Cayman entity.",
    coins: ["USDe", "USDtb"],
  },
  {
    slug: "paxos",
    name: "Paxos",
    type: "Centralized",
    description:
      "A New York-regulated trust company and stablecoin infrastructure provider. Issues PYUSD on behalf of PayPal (bringing stablecoin access to 400M+ PayPal users), USDG for the Global Dollar Network (backed by DBS Bank), and previously BUSD for Binance. Paxos is the technical issuer and reserve custodian for all its stablecoins.",
    company: {
      legalName: "Paxos Trust Company, LLC",
      jurisdiction: "United States (New York)",
      founded: "2012",
      ceo: "Charles Cascarilla",
      website: "https://paxos.com",
    },
    collateralization:
      "Fully backed by cash, US dollar deposits, US Treasury bills, and reverse repurchase agreements. Reserves held at US-regulated banks and custodians. Each stablecoin is independently backed and attested.",
    reserves:
      "Monthly attestation reports by WithumSmith+Brown for each token. PYUSD reserves visible via PayPal transparency page. USDG reserves backed by DBS Bank partnership.",
    auditor: "WithumSmith+Brown",
    regulatory:
      "NY State-chartered trust company regulated by NYDFS. Subject to regular examinations. Singapore MAS license for USDG. PYUSD issued under PayPal partnership with NYDFS oversight.",
    coins: ["PYUSD", "USDG", "BUSD", "PAX"],
  },
  {
    slug: "wlfi",
    name: "World Liberty Financial",
    type: "Centralized",
    description:
      "A DeFi protocol associated with the Trump family, issuing USD1 stablecoin. Backed by fiat reserves and positioned as a US-friendly stablecoin.",
    company: {
      website: "https://worldlibertyfinancial.com",
    },
    collateralization:
      "Claimed to be fully backed by US Treasuries and cash equivalents.",
    coins: ["USD1"],
  },
  {
    slug: "ripple",
    name: "Ripple",
    type: "Centralized",
    description:
      "Ripple Labs issues RLUSD, a stablecoin built on XRP Ledger and Ethereum. Designed for cross-border payments and institutional use.",
    company: {
      legalName: "Ripple Labs, Inc.",
      jurisdiction: "United States (San Francisco)",
      founded: "2012",
      ceo: "Brad Garlinghouse",
      website: "https://ripple.com",
    },
    collateralization: "Fully backed by USD deposits, US Treasuries, and cash equivalents.",
    reserves: "Monthly attestations planned.",
    regulatory: "NYDFS-approved stablecoin (limited purpose trust charter).",
    coins: ["RLUSD"],
  },
  {
    slug: "tron-dao",
    name: "TRON DAO",
    type: "Decentralized",
    description:
      "TRON DAO issues USDD, an algorithmic stablecoin on the TRON network overcollateralized by TRX and other crypto assets.",
    company: {
      website: "https://usdd.io",
    },
    collateralization:
      "Overcollateralized by crypto assets (TRX, BTC, USDT) held in the TRON DAO Reserve. Target collateral ratio >200%.",
    reserves: "On-chain reserve wallet publicly visible. Dashboard at usdd.io.",
    coins: ["USDD"],
  },
  {
    slug: "aave",
    name: "Aave",
    type: "Decentralized",
    description:
      "Aave is a decentralized lending protocol that issues GHO, a multi-collateral stablecoin minted by borrowers on the Aave protocol.",
    company: {
      legalName: "Aave Companies (Avara)",
      website: "https://aave.com",
    },
    collateralization:
      "Overcollateralized by assets deposited in Aave V3 markets (ETH, wstETH, wBTC, USDC, etc.). Minted as debt positions. Minimum collateral ratios vary by asset.",
    reserves: "Fully on-chain. All collateral visible in Aave V3 smart contracts.",
    regulatory: "Decentralized governance via AAVE token holders.",
    coins: ["GHO"],
  },
  {
    slug: "usual",
    name: "Usual",
    type: "Decentralized",
    description:
      "Usual Protocol issues USD0, a stablecoin backed by tokenized real-world assets (US T-Bills). Redistributes yield to stakers via USD0++.",
    company: {
      website: "https://usual.money",
    },
    collateralization:
      "Backed 1:1 by tokenized US Treasury Bills (via Hashnote USYC and other RWA providers).",
    reserves: "On-chain verification of RWA backing.",
    coins: ["USD0"],
  },
  {
    slug: "frax",
    name: "Frax Finance",
    type: "Decentralized",
    description:
      "Frax Finance issues FRAX and frxUSD stablecoins. Originally partially algorithmic, now transitioning to fully collateralized with the Frax v3 upgrade.",
    company: {
      website: "https://frax.finance",
    },
    collateralization:
      "Transitioning from fractional-algorithmic to fully collateralized. Backed by USDC, Curve AMO positions, and Frax-owned liquidity. Target: 100% collateral ratio (CR).",
    reserves: "On-chain AMO (Algorithmic Market Operations) visible on-chain. Dashboard at facts.frax.finance.",
    regulatory: "Decentralized governance via veFXS holders. Pursuing FinCEN MSB registration.",
    coins: ["FRAX", "frxUSD"],
  },
  {
    slug: "curve",
    name: "Curve Finance",
    type: "Decentralized",
    description:
      "Curve issues crvUSD, a stablecoin using a novel LLAMMA (Lending-Liquidating AMM Algorithm) mechanism that provides soft liquidation for borrowers.",
    company: {
      website: "https://curve.fi",
    },
    collateralization:
      "Overcollateralized by crypto assets (wstETH, wBTC, ETH, sfrxETH). Uses LLAMMA for continuous soft liquidation instead of discrete liquidation events.",
    reserves: "Fully on-chain. All collateral in smart contracts on Ethereum.",
    coins: ["crvUSD"],
  },
  {
    slug: "first-digital",
    name: "First Digital Labs",
    type: "Centralized",
    description:
      "Hong Kong-based issuer of FDUSD, a fiat-backed stablecoin popular on Binance. Licensed trust company in Hong Kong.",
    company: {
      legalName: "FD121 Limited (First Digital Labs)",
      jurisdiction: "Hong Kong",
      website: "https://firstdigitallabs.com",
    },
    collateralization: "Fully backed by cash and cash equivalents held in segregated accounts.",
    reserves: "Monthly attestation reports.",
    regulatory: "Licensed trust company under Hong Kong TCSP regime.",
    coins: ["FDUSD"],
  },
];

// Build a reverse lookup: symbol -> issuer slug
export const SYMBOL_TO_ISSUER = new Map<string, string>();
for (const issuer of ISSUERS) {
  for (const symbol of issuer.coins) {
    SYMBOL_TO_ISSUER.set(symbol, issuer.slug);
  }
}

export function getIssuerBySlug(slug: string): IssuerProfile | undefined {
  return ISSUERS.find((i) => i.slug === slug);
}

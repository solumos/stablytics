"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const protocols = [
  {
    name: "Uniswap",
    category: "DEX",
    description: "The largest decentralized exchange. Facilitates stablecoin swaps and liquidity across 40+ chains.",
    status: "coming" as const,
    chains: ["Ethereum", "Base", "Arbitrum", "Polygon", "Optimism", "BSC", "Avalanche"],
    stablecoins: ["USDC", "USDT", "DAI", "USDS"],
  },
  {
    name: "Curve Finance",
    category: "DEX",
    description: "The stablecoin DEX. Optimized for low-slippage swaps between pegged assets. Also issues crvUSD.",
    status: "coming" as const,
    chains: ["Ethereum", "Arbitrum", "Polygon", "Optimism", "Base", "Avalanche"],
    stablecoins: ["USDC", "USDT", "DAI", "FRAX", "crvUSD"],
  },
  {
    name: "Aave",
    category: "Lending",
    description: "The largest DeFi lending protocol. Issues GHO stablecoin and facilitates stablecoin borrowing/lending.",
    status: "coming" as const,
    chains: ["Ethereum", "Arbitrum", "Polygon", "Optimism", "Base", "Avalanche"],
    stablecoins: ["USDC", "USDT", "DAI", "GHO"],
  },
  {
    name: "x402",
    category: "Payments",
    description: "HTTP 402 payment protocol by Coinbase. Enables stablecoin payments over HTTP for AI agents and APIs.",
    status: "coming" as const,
    chains: ["Base", "Ethereum"],
    stablecoins: ["USDC"],
  },
  {
    name: "MPP (Machine Payments)",
    category: "Payments",
    description: "Machine Payments Protocol co-developed by Tempo and Stripe. Machine-to-machine stablecoin payments.",
    status: "coming" as const,
    chains: ["Tempo"],
    stablecoins: ["USDC", "pathUSD"],
  },
  {
    name: "Circle CCTP",
    category: "Bridge",
    description: "Cross-Chain Transfer Protocol. Native USDC bridging with burn-and-mint across supported chains.",
    status: "coming" as const,
    chains: ["Ethereum", "Arbitrum", "Optimism", "Base", "Polygon", "Avalanche", "Solana"],
    stablecoins: ["USDC"],
  },
  {
    name: "LayerZero / Stargate",
    category: "Bridge",
    description: "Omnichain interoperability protocol. Stargate enables native stablecoin bridging across 20+ chains.",
    status: "coming" as const,
    chains: ["Ethereum", "Arbitrum", "Optimism", "Base", "Polygon", "Avalanche", "BSC"],
    stablecoins: ["USDC", "USDT", "USDC.e"],
  },
  {
    name: "MakerDAO / Sky",
    category: "Lending",
    description: "The original DeFi lending protocol. Issues DAI and USDS against overcollateralized vaults.",
    status: "coming" as const,
    chains: ["Ethereum"],
    stablecoins: ["DAI", "USDS"],
  },
  {
    name: "Compound",
    category: "Lending",
    description: "Algorithmic money market protocol. Major venue for stablecoin lending and borrowing.",
    status: "coming" as const,
    chains: ["Ethereum", "Arbitrum", "Polygon", "Base"],
    stablecoins: ["USDC", "USDT", "DAI"],
  },
];

const catColors: Record<string, string> = {
  DEX: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Lending: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Payments: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Bridge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function ProtocolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Protocols</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          DeFi protocols, payment systems, and bridges that move stablecoins
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {protocols.map((proto) => (
          <Card
            key={proto.name}
            className="border-border/40 bg-card/50 transition-all hover:border-border/60 hover:bg-card/80"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">{proto.name}</h3>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${catColors[proto.category] || "border-border/50 text-muted-foreground"}`}
                  >
                    {proto.category}
                  </Badge>
                </div>
                <span className="rounded-full bg-muted/50 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {proto.description}
              </p>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {proto.chains.slice(0, 5).map((c) => (
                    <span
                      key={c}
                      className="rounded bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {c}
                    </span>
                  ))}
                  {proto.chains.length > 5 && (
                    <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      +{proto.chains.length - 5}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {proto.stablecoins.map((s) => (
                    <span
                      key={s}
                      className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

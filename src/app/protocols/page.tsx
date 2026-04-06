"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";
import { PROTOCOLS } from "@/lib/stablecoins/protocols";
import { CHAINS } from "@/lib/chains/registry";

const catColors: Record<string, string> = {
  DEX: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Lending: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Payments: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Bridge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Yield: "bg-pink-500/10 text-pink-400 border-pink-500/20",
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
        {PROTOCOLS.map((proto) => (
          <a key={proto.slug} href={`/protocols/${proto.slug}`}>
            <Card className="border-border/40 bg-card/50 transition-all hover:border-emerald-500/30 hover:bg-card/80 cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">{proto.name}</h3>
                    <Badge variant="outline" className={`text-[10px] ${catColors[proto.category]}`}>
                      {proto.category}
                    </Badge>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {proto.description}
                </p>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {proto.chains.slice(0, 5).map((c) => {
                      const cfg = CHAINS.find((ch) => ch.name === c);
                      return (
                        <span key={c} className="inline-flex items-center gap-1 rounded bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: cfg?.color || "#6B7280" }} />
                          {c}
                        </span>
                      );
                    })}
                    {proto.chains.length > 5 && (
                      <span className="rounded bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">+{proto.chains.length - 5}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {proto.stablecoins.slice(0, 5).map((s) => (
                      <span key={s} className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">{s}</span>
                    ))}
                    {proto.stablecoins.length > 5 && (
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400">+{proto.stablecoins.length - 5}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Globe, Coins, Layers } from "lucide-react";
import { getProtocolBySlug } from "@/lib/stablecoins/protocols";
import { CHAINS } from "@/lib/chains/registry";

const catColors: Record<string, string> = {
  DEX: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Lending: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Payments: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Bridge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Yield: "bg-pink-500/10 text-pink-400 border-pink-500/20",
};

export default function ProtocolDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const proto = getProtocolBySlug(slug);

  if (!proto) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">Protocol Not Found</h1>
        <p className="mt-2 text-muted-foreground">No protocol found for &quot;{slug}&quot;.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <a href="/protocols" className="text-sm text-muted-foreground hover:text-foreground">Protocols</a>
          <span className="text-muted-foreground/40">/</span>
        </div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{proto.name}</h1>
          <Badge variant="outline" className={catColors[proto.category]}>
            {proto.category}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
          {proto.description}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Chains</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{proto.chains.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Stablecoins</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{proto.stablecoins.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border/40 bg-card/50">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Features</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{proto.features.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        {/* About */}
        <Card className="border-border/40 bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>{proto.longDescription}</p>
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-1">Stablecoin Relevance</h4>
              <p>{proto.relevance}</p>
            </div>
            <a
              href={proto.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
            >
              {proto.website.replace("https://", "")}
              <ExternalLink className="h-3 w-3" />
            </a>
          </CardContent>
        </Card>

        {/* Features + chains + stablecoins */}
        <div className="space-y-6">
          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {proto.features.map((f) => (
                  <span key={f} className="rounded-md bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                    {f}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Supported Chains</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {proto.chains.map((c) => {
                  const cfg = CHAINS.find((ch) => ch.name === c);
                  return (
                    <a
                      key={c}
                      href={cfg ? `/chains/${cfg.slug}` : "#"}
                      className="inline-flex items-center gap-1.5 rounded-md border border-border/30 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted/30"
                    >
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cfg?.color || "#6B7280" }} />
                      {c}
                    </a>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/40 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Supported Stablecoins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {proto.stablecoins.map((s) => (
                  <a
                    key={s}
                    href={`/coins/${s.toLowerCase()}`}
                    className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
                  >
                    {s}
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

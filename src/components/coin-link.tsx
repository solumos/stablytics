import { getCoinLogo } from "@/lib/stablecoins/logos";

interface CoinLinkProps {
  symbol: string;
  name?: string;
  size?: "sm" | "md";
  showName?: boolean;
}

export function CoinLink({
  symbol,
  name,
  size = "sm",
  showName = false,
}: CoinLinkProps) {
  const logo = getCoinLogo(symbol);
  const imgSize = size === "md" ? "h-5 w-5" : "h-4 w-4";

  return (
    <a
      href={`/coins/${symbol.toLowerCase()}`}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:underline"
    >
      {logo && (
        <img
          src={logo}
          alt={symbol}
          className={`${imgSize} rounded-full`}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      {symbol}
      {showName && name && (
        <span className="text-xs font-normal text-muted-foreground">
          {name}
        </span>
      )}
    </a>
  );
}

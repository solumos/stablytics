"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const COLORS = [
  "#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b",
  "#f43f5e", "#14b8a6", "#6366f1", "#ec4899",
];

function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

function initials(name: string): string {
  const parts = name.replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).filter(Boolean);
  const guess = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  return (guess || name.slice(0, 2)).toUpperCase();
}

/**
 * Renders a company logo with graceful fallback:
 * explicit src -> Clearbit logo (by domain) -> favicon -> colored monogram.
 */
export function CompanyLogo({
  name,
  src,
  domain,
  className,
}: {
  name: string;
  src?: string;
  domain?: string;
  className?: string;
}) {
  const candidates: string[] = [];
  if (src) candidates.push(src);
  if (domain) {
    candidates.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
    candidates.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
  }

  const [idx, setIdx] = useState(0);
  const url = candidates[idx];

  if (!url) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md text-[0.6rem] font-bold leading-none text-white",
          className
        )}
        style={{ backgroundColor: colorFor(name) }}
      >
        {initials(name)}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={`${name} logo`}
      loading="lazy"
      onError={() => setIdx((i) => i + 1)}
      className={cn("shrink-0 rounded-md bg-white/[0.04] object-contain", className)}
    />
  );
}

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
 * Renders a company's local logo, or a colored monogram when it has none.
 * No client-side fallback chain: logos are prefetched into
 * public/company-logos/ and scripts/check-logos.mjs fails the build on
 * broken paths, so this stays a server-renderable component (no hooks) —
 * the ~1,500 tiles on the map hydrate nothing.
 */
export function CompanyLogo({
  name,
  src,
  className,
  eager = false,
}: {
  name: string;
  src?: string;
  className?: string;
  /** Load immediately (above-the-fold placements like the profile hero). */
  eager?: boolean;
}) {
  if (!src) {
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
      src={src}
      alt={`${name} logo`}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn("shrink-0 rounded-md bg-white/[0.04] object-contain", className)}
    />
  );
}

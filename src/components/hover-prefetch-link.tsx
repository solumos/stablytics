"use client";

import Link from "next/link";
import { useState, type ComponentProps } from "react";

/**
 * next/link that defers prefetching until the user signals intent
 * (hover/touch). With ~1,500 tile links on the map and 756 cards in the
 * directory, default viewport prefetching would issue thousands of
 * speculative requests; this keeps prefetch for likely navigations only.
 */
export function HoverPrefetchLink({
  onMouseEnter,
  onTouchStart,
  ...props
}: ComponentProps<typeof Link>) {
  const [active, setActive] = useState(false);
  return (
    <Link
      {...props}
      prefetch={active ? null : false}
      onMouseEnter={(e) => {
        setActive(true);
        onMouseEnter?.(e);
      }}
      onTouchStart={(e) => {
        setActive(true);
        onTouchStart?.(e);
      }}
    />
  );
}

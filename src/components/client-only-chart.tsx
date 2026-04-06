"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";

export function ClientOnlyChart({
  children,
  height = 300,
}: {
  children: ReactNode;
  height?: number;
}) {
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for the container to have actual dimensions before rendering charts
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setReady(true);
          observer.disconnect();
        }
      }
    });

    // Check if already sized
    if (el.offsetWidth > 0) {
      setReady(true);
    } else {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: height }}>
      {ready ? (
        children
      ) : (
        <div
          style={{ height }}
          className="animate-pulse rounded-lg bg-muted/20"
        />
      )}
    </div>
  );
}

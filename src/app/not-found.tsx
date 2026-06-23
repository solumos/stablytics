import { Layers } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-32 text-center">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
        <Layers className="h-6 w-6" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We couldn&apos;t find that page. It may have moved, or the company isn&apos;t
        in the map yet.
      </p>
      <div className="mt-6 flex gap-3">
        <a
          href="/"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Market Map
        </a>
        <a
          href="/companies"
          className="rounded-lg border border-border/60 px-4 py-2 text-sm font-medium transition-colors hover:bg-muted/50"
        >
          Browse Directory
        </a>
      </div>
    </div>
  );
}

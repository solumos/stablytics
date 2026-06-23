export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <span className="text-xs text-muted-foreground">
          Stablytics — The Stablecoin Market Map
        </span>
        <span className="text-xs text-muted-foreground/70">
          A living directory of the stablecoin economy. Data is curated and may
          contain errors — verify before relying on it.
        </span>
      </div>
    </footer>
  );
}

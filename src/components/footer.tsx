export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <span className="text-xs text-muted-foreground">
          Stablytics — Stablecoin Analytics
        </span>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a
            href="/tempo"
            className="transition-colors hover:text-foreground"
          >
            Tempo
          </a>
        </div>
      </div>
    </footer>
  );
}

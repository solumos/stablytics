export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl space-y-2 px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-muted-foreground">
            Stablytics — The Stablecoin Market Map
          </span>
          <span className="text-xs text-muted-foreground/70">
            A living directory of the stablecoin economy. Data is curated and may
            contain errors.
          </span>
        </div>
        <p className="max-w-3xl text-xs text-muted-foreground/70">
          The information provided on this site is for informational purposes only
          and does not constitute financial advice, investment advice, or any other
          type of advice. Gingham Holdings, Inc. is not a registered investment
          advisor, broker-dealer, or financial planner. You should not make any
          financial decisions based solely on the information presented here. Always
          do your own research and consult with a qualified financial professional
          before making any investment decisions.
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Gingham Holdings, Inc. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

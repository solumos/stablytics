export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 space-y-2">
        <p className="text-xs text-muted-foreground/70 max-w-3xl">
          The information provided on this site is for informational purposes
          only and does not constitute financial advice, investment advice, or
          any other type of advice. Gingham Holdings, Inc. is not a registered
          investment advisor, broker-dealer, or financial planner. You should
          not make any financial decisions based solely on the information
          presented here. Always do your own research and consult with a
          qualified financial professional before making any investment
          decisions.
        </p>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Gingham Holdings, Inc. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}

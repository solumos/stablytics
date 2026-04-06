import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/40", className)}
      {...props}
    />
  );
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-lg border border-border/40 bg-card/50 p-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-7 w-28" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-lg border border-border/40 bg-card/50 p-5">
      <Skeleton className="h-4 w-40 mb-4" />
      <div className="flex items-end gap-1 h-[280px] pt-8 pb-6">
        {Array.from({ length: 20 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t"
            style={{
              height: `${30 + Math.sin(i * 0.5) * 25 + Math.random() * 20}%`,
              animationDelay: `${i * 50}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border/20">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: `${60 + Math.random() * 80}px` }}
        />
      ))}
    </div>
  );
}

export function BlockCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2.5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
      <div className="text-right space-y-1.5">
        <Skeleton className="h-4 w-16 ml-auto" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </div>
    </div>
  );
}

export function TxCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2.5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-14" />
        </div>
      </div>
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

export function DetailRowSkeleton() {
  return (
    <div className="flex gap-4 px-6 py-3.5 border-b border-border/20">
      <Skeleton className="h-4 w-32 shrink-0" />
      <Skeleton className="h-4 flex-1 max-w-sm" />
    </div>
  );
}

export function PageHeaderSkeleton() {
  return (
    <div className="mb-6 space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-72 rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border/40 bg-card/50 p-5 space-y-3">
          <Skeleton className="h-4 w-28" />
          {Array.from({ length: 6 }).map((_, i) => (
            <BlockCardSkeleton key={i} />
          ))}
        </div>
        <div className="rounded-lg border border-border/40 bg-card/50 p-5 space-y-3">
          <Skeleton className="h-4 w-36" />
          {Array.from({ length: 6 }).map((_, i) => (
            <TxCardSkeleton key={i} />
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}

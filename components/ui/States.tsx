export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-charcoal-800 text-charcoal-500">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h10M4 17h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
      </div>
      <p className="font-medium text-charcoal-200">{title}</p>
      {description && <p className="max-w-sm text-sm text-charcoal-500">{description}</p>}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="card animate-pulse space-y-3 p-5">
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full bg-charcoal-800" />
        <div className="h-5 w-20 rounded-full bg-charcoal-800" />
      </div>
      <div className="h-4 w-3/4 rounded bg-charcoal-800" />
      <div className="h-3 w-1/2 rounded bg-charcoal-800" />
    </div>
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="card animate-pulse space-y-3 p-5">
      <div className="h-3 w-20 rounded bg-charcoal-800" />
      <div className="h-7 w-14 rounded bg-charcoal-800" />
    </div>
  );
}

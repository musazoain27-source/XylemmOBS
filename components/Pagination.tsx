'use client';

import { cn } from '@/lib/utils';

export default function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const pages: (number | 'ellipsis')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== 'ellipsis') pages.push('ellipsis');
  }

  return (
    <div className="flex items-center justify-center gap-1 py-6">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="btn-secondary h-9 w-9 !p-0 disabled:opacity-30"
        aria-label="Previous page"
      >
        &larr;
      </button>
      {pages.map((p, i) =>
        p === 'ellipsis' ? (
          <span key={`e${i}`} className="px-2 text-charcoal-500">&hellip;</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'h-9 w-9 rounded-lg text-sm font-medium transition-colors',
              p === page ? 'bg-moss-500 text-charcoal-950' : 'text-charcoal-300 hover:bg-charcoal-800'
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="btn-secondary h-9 w-9 !p-0 disabled:opacity-30"
        aria-label="Next page"
      >
        &rarr;
      </button>
    </div>
  );
}

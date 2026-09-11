import { cn } from '@/lib/utils';
import { CATEGORY_LABELS, type CategoryType, type PostType } from '@/types/database';

export function CategoryBadge({ category, className }: { category: CategoryType; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border border-charcoal-700 bg-charcoal-850 px-2.5 py-1 text-[11px] font-medium text-charcoal-300',
        className
      )}
    >
      {CATEGORY_LABELS[category]}
    </span>
  );
}

const TYPE_META: Record<PostType, { label: string; classes: string }> = {
  question: { label: 'Question', classes: 'bg-sky-500/10 text-sky-300 border-sky-500/30' },
  issue: { label: 'Issue', classes: 'bg-ember-500/10 text-ember-400 border-ember-500/30' },
  feature_request: { label: 'Feature Request', classes: 'bg-moss-500/10 text-moss-300 border-moss-500/30' },
};

export function PostTypeBadge({ type, className }: { type: PostType; className?: string }) {
  const meta = TYPE_META[type];
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        meta.classes,
        className
      )}
    >
      {meta.label}
    </span>
  );
}

export function OfficialBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-moss-500/40 bg-moss-500/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-moss-300',
        className
      )}
    >
      <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor"><path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.44.91-5.32L2.27 6.62l5.34-.78L10 1z"/></svg>
      XylemmOBS Team
    </span>
  );
}

export function KnownIssueBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-300',
        className
      )}
    >
      Known Issue
    </span>
  );
}

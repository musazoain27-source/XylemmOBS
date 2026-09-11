import { cn } from '@/lib/utils';
import { ISSUE_PRIORITY_LABELS, type IssuePriority } from '@/types/database';

const STYLES: Record<IssuePriority, string> = {
  low: 'bg-charcoal-800 text-charcoal-300 border-charcoal-700',
  medium: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  high: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  critical: 'bg-ember-500/15 text-ember-400 border-ember-500/40',
};

export default function PriorityBadge({ priority, className }: { priority: IssuePriority; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        STYLES[priority],
        className
      )}
    >
      {priority === 'critical' && <span className="h-1.5 w-1.5 rounded-full bg-ember-400" />}
      {ISSUE_PRIORITY_LABELS[priority]}
    </span>
  );
}

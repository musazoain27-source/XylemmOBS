import { cn } from '@/lib/utils';
import {
  QUESTION_STATUS_LABELS,
  ISSUE_STATUS_LABELS,
  FEATURE_STATUS_LABELS,
  type QuestionStatus,
  type IssueStatus,
  type FeatureStatus,
} from '@/types/database';

type AnyStatus = QuestionStatus | IssueStatus | FeatureStatus;

const STYLES: Record<string, string> = {
  // neutral / waiting
  waiting_for_answer: 'bg-charcoal-700/60 text-charcoal-200 border-charcoal-600',
  submitted: 'bg-charcoal-700/60 text-charcoal-200 border-charcoal-600',
  open: 'bg-charcoal-700/60 text-charcoal-200 border-charcoal-600',
  // in progress
  in_review: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  under_review: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  need_more_info: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
  confirmed: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  working_on_fix: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  planned: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  // resolved / positive
  answered: 'bg-moss-500/15 text-moss-300 border-moss-500/40',
  fixed: 'bg-moss-500/15 text-moss-300 border-moss-500/40',
  added: 'bg-moss-500/15 text-moss-300 border-moss-500/40',
  // negative / closed
  closed: 'bg-charcoal-800 text-charcoal-400 border-charcoal-700',
  cannot_reproduce: 'bg-charcoal-800 text-charcoal-400 border-charcoal-700',
  maybe_later: 'bg-charcoal-800 text-charcoal-400 border-charcoal-700',
  rejected: 'bg-ember-500/10 text-ember-400 border-ember-500/30',
};

const ALL_LABELS: Record<string, string> = {
  ...QUESTION_STATUS_LABELS,
  ...ISSUE_STATUS_LABELS,
  ...FEATURE_STATUS_LABELS,
};

export default function StatusBadge({ status, className }: { status: AnyStatus | string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        STYLES[status] ?? 'bg-charcoal-800 text-charcoal-300 border-charcoal-700',
        className
      )}
    >
      {ALL_LABELS[status] ?? status}
    </span>
  );
}

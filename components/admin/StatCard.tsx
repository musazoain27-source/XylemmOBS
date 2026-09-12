import { cn } from '@/lib/utils';

export default function StatCard({
  label,
  value,
  accent = 'default',
}: {
  label: string;
  value: number | string;
  accent?: 'default' | 'moss' | 'ember' | 'amber';
}) {
  const accentClasses: Record<string, string> = {
    default: 'text-charcoal-50',
    moss: 'text-moss-400',
    ember: 'text-ember-400',
    amber: 'text-amber-400',
  };

  return (
    <div className="card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-charcoal-500">{label}</p>
      <p className={cn('mt-2 text-2xl font-semibold', accentClasses[accent])}>{value}</p>
    </div>
  );
}

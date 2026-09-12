import Link from 'next/link';
import { requireAdmin, createServerSupabaseClient } from '@/lib/supabase/server';
import StatCard from '@/components/admin/StatCard';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import { ISSUE_STATUS_LABELS, type IssueStatus } from '@/types/database';
import { timeAgo } from '@/lib/utils';

export default async function AdminDashboardPage() {
  const profile = await requireAdmin();
  const supabase = createServerSupabaseClient();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalQuestions, totalIssues, totalFeatures, openIssues, questionsWaiting,
    issuesInReview, criticalIssues, fixedIssues, newToday, recentQuestions, recentIssues, allIssueStatuses, recentActivity,
  ] = await Promise.all([
    supabase.from('questions').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('feature_requests').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'open'),
    supabase.from('questions').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'waiting_for_answer'),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'in_review'),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('priority', 'critical'),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'fixed'),
    Promise.all([
      supabase.from('questions').select('id', { count: 'exact', head: true }).eq('is_deleted', false).gte('created_at', startOfToday.toISOString()),
      supabase.from('issues').select('id', { count: 'exact', head: true }).eq('is_deleted', false).gte('created_at', startOfToday.toISOString()),
      supabase.from('feature_requests').select('id', { count: 'exact', head: true }).eq('is_deleted', false).gte('created_at', startOfToday.toISOString()),
    ]).then(([q, i, f]) => (q.count ?? 0) + (i.count ?? 0) + (f.count ?? 0)),
    supabase.from('questions').select('public_id, title, username, created_at').eq('is_deleted', false).order('created_at', { ascending: false }).limit(5),
    supabase.from('issues').select('public_id, title, username, priority, status, created_at').eq('is_deleted', false).order('created_at', { ascending: false }).limit(5),
    supabase.from('issues').select('status').eq('is_deleted', false),
    supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(8),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const row of allIssueStatuses.data ?? []) statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
  const maxCount = Math.max(1, ...Object.values(statusCounts));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-medium text-charcoal-50">Welcome back, {profile?.username}</h1>
        <p className="mt-1 text-sm text-charcoal-500">Here's what's happening across XylemmOBS Support.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Submissions" value={(totalQuestions.count ?? 0) + (totalIssues.count ?? 0) + (totalFeatures.count ?? 0)} />
        <StatCard label="Open Issues" value={openIssues.count ?? 0} accent="ember" />
        <StatCard label="Questions Waiting" value={questionsWaiting.count ?? 0} accent="amber" />
        <StatCard label="Issues In Review" value={issuesInReview.count ?? 0} accent="amber" />
        <StatCard label="Critical Issues" value={criticalIssues.count ?? 0} accent="ember" />
        <StatCard label="Fixed Issues" value={fixedIssues.count ?? 0} accent="moss" />
        <StatCard label="Feature Requests" value={totalFeatures.count ?? 0} />
        <StatCard label="New Today" value={newToday} accent="moss" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-charcoal-400">Issue Status Breakdown</h2>
          <div className="space-y-3">
            {(Object.keys(ISSUE_STATUS_LABELS) as IssueStatus[]).map((status) => {
              const count = statusCounts[status] ?? 0;
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="w-36 shrink-0 text-xs text-charcoal-400">{ISSUE_STATUS_LABELS[status]}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-charcoal-800">
                    <div className="h-full rounded-full bg-moss-500" style={{ width: `${(count / maxCount) * 100}%` }} />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs font-semibold text-charcoal-300">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-charcoal-400">Recent Activity</h2>
          {recentActivity.data && recentActivity.data.length > 0 ? (
            <ul className="space-y-3">
              {recentActivity.data.map((a) => (
                <li key={a.id} className="text-sm">
                  <span className="font-medium text-charcoal-200">{a.admin_username}</span>{' '}
                  <span className="text-charcoal-500">{a.action.replace(/_/g, ' ')}</span>{' '}
                  {a.target_public_id && <span className="font-mono text-xs text-moss-400">{a.target_public_id}</span>}
                  <div className="text-xs text-charcoal-600">{timeAgo(a.created_at)}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-charcoal-500">No activity recorded yet.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal-400">Latest Questions</h2>
            <Link href="/admin/questions" className="text-xs font-medium text-moss-400 hover:text-moss-300">View all</Link>
          </div>
          <ul className="space-y-2">
            {(recentQuestions.data ?? []).map((q) => (
              <li key={q.public_id}>
                <Link href={`/admin/questions/${q.public_id}`} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-charcoal-800">
                  <span className="truncate text-charcoal-200">{q.title}</span>
                  <span className="shrink-0 text-xs text-charcoal-500">{timeAgo(q.created_at)}</span>
                </Link>
              </li>
            ))}
            {(recentQuestions.data ?? []).length === 0 && <p className="text-sm text-charcoal-500">No questions yet.</p>}
          </ul>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal-400">Latest Reports</h2>
            <Link href="/admin/issues" className="text-xs font-medium text-moss-400 hover:text-moss-300">View all</Link>
          </div>
          <ul className="space-y-2">
            {(recentIssues.data ?? []).map((i) => (
              <li key={i.public_id}>
                <Link href={`/admin/issues/${i.public_id}`} className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm hover:bg-charcoal-800">
                  <span className="truncate text-charcoal-200">{i.title}</span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <PriorityBadge priority={i.priority} />
                    <StatusBadge status={i.status} />
                  </div>
                </Link>
              </li>
            ))}
            {(recentIssues.data ?? []).length === 0 && <p className="text-sm text-charcoal-500">No issues yet.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}

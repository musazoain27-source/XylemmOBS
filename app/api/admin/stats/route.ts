import { NextResponse } from 'next/server';
import { requireAdmin, createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = createServerSupabaseClient();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalQuestions,
    totalIssues,
    totalFeatures,
    openIssues,
    questionsWaiting,
    issuesInReview,
    criticalIssues,
    fixedIssues,
    newQuestionsToday,
    newIssuesToday,
    newFeaturesToday,
    recentQuestions,
    recentIssues,
    issuesByStatus,
  ] = await Promise.all([
    supabase.from('questions').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('feature_requests').select('id', { count: 'exact', head: true }).eq('is_deleted', false),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'open'),
    supabase.from('questions').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'waiting_for_answer'),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'in_review'),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('priority', 'critical'),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('is_deleted', false).eq('status', 'fixed'),
    supabase.from('questions').select('id', { count: 'exact', head: true }).eq('is_deleted', false).gte('created_at', startOfToday.toISOString()),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('is_deleted', false).gte('created_at', startOfToday.toISOString()),
    supabase.from('feature_requests').select('id', { count: 'exact', head: true }).eq('is_deleted', false).gte('created_at', startOfToday.toISOString()),
    supabase.from('questions').select('id, public_id, title, username, created_at').eq('is_deleted', false).order('created_at', { ascending: false }).limit(5),
    supabase.from('issues').select('id, public_id, title, username, priority, created_at').eq('is_deleted', false).order('created_at', { ascending: false }).limit(5),
    supabase.from('issues').select('status').eq('is_deleted', false),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const row of issuesByStatus.data ?? []) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
  }

  return NextResponse.json({
    data: {
      totalSubmissions: (totalQuestions.count ?? 0) + (totalIssues.count ?? 0) + (totalFeatures.count ?? 0),
      totalQuestions: totalQuestions.count ?? 0,
      totalIssues: totalIssues.count ?? 0,
      totalFeatures: totalFeatures.count ?? 0,
      openIssues: openIssues.count ?? 0,
      questionsWaiting: questionsWaiting.count ?? 0,
      issuesInReview: issuesInReview.count ?? 0,
      criticalIssues: criticalIssues.count ?? 0,
      fixedIssues: fixedIssues.count ?? 0,
      newSubmissionsToday: (newQuestionsToday.count ?? 0) + (newIssuesToday.count ?? 0) + (newFeaturesToday.count ?? 0),
      recentQuestions: recentQuestions.data ?? [],
      recentIssues: recentIssues.data ?? [],
      issueStatusBreakdown: statusCounts,
    },
  });
}

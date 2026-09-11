import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAdmin } from '@/lib/supabase/server';
import { logActivity, notifyUser } from '@/lib/server-actions';
import type { IssuePriority, IssueStatus } from '@/types/database';

// [id] is the public_id, e.g. XOBS-0001
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: issue, error } = await supabase
    .from('issues')
    .select('*')
    .eq('public_id', params.id)
    .eq('is_deleted', false)
    .single();

  if (error || !issue) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [{ data: replies }, { data: attachments }, duplicateOf] = await Promise.all([
    supabase.from('replies').select('*').eq('issue_id', issue.id).eq('is_deleted', false).order('created_at', { ascending: true }),
    supabase.from('attachments').select('id, file_name, storage_path, mime_type, file_size, kind, created_at').eq('issue_id', issue.id),
    issue.is_duplicate_of
      ? supabase.from('issues').select('public_id, title').eq('id', issue.is_duplicate_of).single().then((r) => r.data)
      : Promise.resolve(null),
  ]);

  // Note: admin_notes is intentionally never queried here. RLS would
  // block a non-admin from reading it anyway, but we don't even ask.
  return NextResponse.json({
    data: { ...issue, replies: replies ?? [], attachments: attachments ?? [], duplicate_of: duplicateOf },
  });
}

const STATUS_VALUES: IssueStatus[] = [
  'open', 'in_review', 'need_more_info', 'confirmed', 'working_on_fix', 'fixed', 'cannot_reproduce', 'closed',
];
const PRIORITY_VALUES: IssuePriority[] = ['low', 'medium', 'high', 'critical'];

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const supabase = createServerSupabaseClient();
  const updates: Record<string, unknown> = {};
  const activityEvents: { action: string; details?: Record<string, unknown> }[] = [];

  if (body.status !== undefined) {
    if (!STATUS_VALUES.includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 422 });
    updates.status = body.status;
    activityEvents.push({ action: 'status_changed', details: { newStatus: body.status } });
  }
  if (body.priority !== undefined) {
    if (!PRIORITY_VALUES.includes(body.priority)) return NextResponse.json({ error: 'Invalid priority' }, { status: 422 });
    updates.priority = body.priority;
    activityEvents.push({ action: 'priority_changed', details: { newPriority: body.priority } });
  }
  if (body.is_known_issue !== undefined) {
    updates.is_known_issue = Boolean(body.is_known_issue);
    activityEvents.push({ action: body.is_known_issue ? 'marked_known_issue' : 'unmarked_known_issue' });
  }
  if (body.is_duplicate_of !== undefined) {
    updates.is_duplicate_of = body.is_duplicate_of || null;
    activityEvents.push({ action: body.is_duplicate_of ? 'marked_duplicate' : 'unmarked_duplicate' });
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 422 });
  }

  const { data: issue, error } = await supabase
    .from('issues')
    .update(updates)
    .eq('public_id', params.id)
    .select('id, public_id, user_id, title, status, priority')
    .single();

  if (error || !issue) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 400 });

  for (const event of activityEvents) {
    await logActivity({
      adminId: profile.user_id,
      adminUsername: profile.username,
      action: event.action,
      targetType: 'issue',
      targetPublicId: issue.public_id,
      targetId: issue.id,
      details: event.details,
    });
  }

  if (issue.user_id && body.status !== undefined) {
    await notifyUser({
      userId: issue.user_id,
      title: 'Your issue status changed',
      body: `"${issue.title}" is now ${String(issue.status).replace(/_/g, ' ')}.`,
      link: `/post/${issue.public_id}`,
    });
  }

  return NextResponse.json({ data: issue });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = createServerSupabaseClient();
  const { data: issue, error } = await supabase
    .from('issues')
    .update({ is_deleted: true })
    .eq('public_id', params.id)
    .select('id, public_id')
    .single();

  if (error || !issue) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 400 });

  await logActivity({
    adminId: profile.user_id,
    adminUsername: profile.username,
    action: 'deleted',
    targetType: 'issue',
    targetPublicId: issue.public_id,
    targetId: issue.id,
  });

  return NextResponse.json({ data: { deleted: true } });
}

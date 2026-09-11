import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAdmin } from '@/lib/supabase/server';
import { logActivity, notifyUser } from '@/lib/server-actions';

// [id] here is the public_id, e.g. XOBS-Q-0001
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: question, error } = await supabase
    .from('questions')
    .select('*')
    .eq('public_id', params.id)
    .eq('is_deleted', false)
    .single();

  if (error || !question) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: replies } = await supabase
    .from('replies')
    .select('*')
    .eq('question_id', question.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  return NextResponse.json({ data: { ...question, replies: replies ?? [] } });
}

const ALLOWED_STATUSES = ['waiting_for_answer', 'answered', 'closed'];

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.status) {
    if (!ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 422 });
    }
    updates.status = body.status;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 422 });
  }

  const supabase = createServerSupabaseClient();
  const { data: question, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('public_id', params.id)
    .select('id, public_id, user_id, title, status')
    .single();

  if (error || !question) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 400 });

  await logActivity({
    adminId: profile.user_id,
    adminUsername: profile.username,
    action: 'status_changed',
    targetType: 'question',
    targetPublicId: question.public_id,
    targetId: question.id,
    details: { newStatus: question.status },
  });

  if (question.user_id) {
    await notifyUser({
      userId: question.user_id,
      title: 'Your question status changed',
      body: `"${question.title}" is now ${question.status.replace(/_/g, ' ')}.`,
      link: `/post/${question.public_id}`,
    });
  }

  return NextResponse.json({ data: question });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = createServerSupabaseClient();
  const { data: question, error } = await supabase
    .from('questions')
    .update({ is_deleted: true })
    .eq('public_id', params.id)
    .select('id, public_id')
    .single();

  if (error || !question) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 400 });

  await logActivity({
    adminId: profile.user_id,
    adminUsername: profile.username,
    action: 'deleted',
    targetType: 'question',
    targetPublicId: question.public_id,
    targetId: question.id,
  });

  return NextResponse.json({ data: { deleted: true } });
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAdmin } from '@/lib/supabase/server';
import { logActivity, notifyUser } from '@/lib/server-actions';
import type { FeatureStatus } from '@/types/database';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();

  const { data: feature, error } = await supabase
    .from('feature_requests')
    .select('*')
    .eq('public_id', params.id)
    .eq('is_deleted', false)
    .single();

  if (error || !feature) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: replies } = await supabase
    .from('replies')
    .select('*')
    .eq('feature_request_id', feature.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: true });

  return NextResponse.json({ data: { ...feature, replies: replies ?? [] } });
}

const STATUS_VALUES: FeatureStatus[] = ['submitted', 'under_review', 'planned', 'maybe_later', 'added', 'rejected'];

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { status } = await request.json();
  if (!STATUS_VALUES.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 422 });

  const supabase = createServerSupabaseClient();
  const { data: feature, error } = await supabase
    .from('feature_requests')
    .update({ status })
    .eq('public_id', params.id)
    .select('id, public_id, user_id, title, status')
    .single();

  if (error || !feature) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 400 });

  await logActivity({
    adminId: profile.user_id,
    adminUsername: profile.username,
    action: 'feature_status_changed',
    targetType: 'feature_request',
    targetPublicId: feature.public_id,
    targetId: feature.id,
    details: { newStatus: status },
  });

  if (feature.user_id) {
    await notifyUser({
      userId: feature.user_id,
      title: 'Your feature request status changed',
      body: `"${feature.title}" is now ${String(feature.status).replace(/_/g, ' ')}.`,
      link: `/post/${feature.public_id}`,
    });
  }

  return NextResponse.json({ data: feature });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = createServerSupabaseClient();
  const { data: feature, error } = await supabase
    .from('feature_requests')
    .update({ is_deleted: true })
    .eq('public_id', params.id)
    .select('id, public_id')
    .single();

  if (error || !feature) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 400 });

  await logActivity({
    adminId: profile.user_id,
    adminUsername: profile.username,
    action: 'deleted',
    targetType: 'feature_request',
    targetPublicId: feature.public_id,
    targetId: feature.id,
  });

  return NextResponse.json({ data: { deleted: true } });
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAdmin } from '@/lib/supabase/server';
import { logActivity } from '@/lib/server-actions';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { admin_id, admin_username } = await request.json();
  if (!admin_id || !admin_username) {
    return NextResponse.json({ error: 'admin_id and admin_username are required' }, { status: 422 });
  }

  const supabase = createServerSupabaseClient();
  const { data: issue, error } = await supabase
    .from('issues')
    .update({ assigned_admin_id: admin_id })
    .eq('public_id', params.id)
    .select('id, public_id')
    .single();

  if (error || !issue) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 400 });

  await supabase.from('issue_assignments').insert({
    issue_id: issue.id,
    admin_id,
    admin_username,
    assigned_by: profile.user_id,
  });

  await logActivity({
    adminId: profile.user_id,
    adminUsername: profile.username,
    action: 'issue_assigned',
    targetType: 'issue',
    targetPublicId: issue.public_id,
    targetId: issue.id,
    details: { assignedTo: admin_username },
  });

  return NextResponse.json({ data: { assigned: true } });
}

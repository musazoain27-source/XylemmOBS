import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, requireAdmin } from '@/lib/supabase/server';
import { logActivity } from '@/lib/server-actions';

// Every handler in this file requires an authenticated admin. RLS on
// admin_notes also blocks non-admins at the database layer, so even a
// bug here would be caught there — this is defense in depth, not the
// only line of defense.

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = createServerSupabaseClient();
  const { data: issue } = await supabase.from('issues').select('id').eq('public_id', params.id).single();
  if (!issue) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: notes, error } = await supabase
    .from('admin_notes')
    .select('*')
    .eq('issue_id', issue.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data: notes });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { note } = await request.json();
  if (!note || typeof note !== 'string' || note.trim().length < 2) {
    return NextResponse.json({ error: 'Note cannot be empty' }, { status: 422 });
  }

  const supabase = createServerSupabaseClient();
  const { data: issue } = await supabase.from('issues').select('id, public_id').eq('public_id', params.id).single();
  if (!issue) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { data: inserted, error } = await supabase
    .from('admin_notes')
    .insert({
      issue_id: issue.id,
      admin_id: profile.user_id,
      admin_username: profile.username,
      note: note.trim(),
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await logActivity({
    adminId: profile.user_id,
    adminUsername: profile.username,
    action: 'internal_note_added',
    targetType: 'issue',
    targetPublicId: issue.public_id,
    targetId: issue.id,
  });

  return NextResponse.json({ data: inserted }, { status: 201 });
}

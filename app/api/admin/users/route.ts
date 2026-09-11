import { NextResponse } from 'next/server';
import { requireAdmin, createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET() {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const supabase = createServerSupabaseClient();
  const { data: admins, error } = await supabase
    .from('profiles')
    .select('user_id, username, email, role, created_at')
    .order('created_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data: admins });
}

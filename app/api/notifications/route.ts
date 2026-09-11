import { NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentProfile } from '@/lib/supabase/server';

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ data: [] });

  const supabase = createServerSupabaseClient();
  const target = profile.role === 'admin' ? 'admin' : 'user';

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('target', target)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data });
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentProfile } from '@/lib/supabase/server';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data: { read: true } });
}

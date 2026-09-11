import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const pageSize = Math.min(100, Number(searchParams.get('pageSize') ?? '30'));

  const supabase = createServerSupabaseClient();
  const from = (page - 1) * pageSize;

  const { data, error, count } = await supabase
    .from('activity_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data, count });
}

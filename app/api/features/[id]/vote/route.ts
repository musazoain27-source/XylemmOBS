import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { fingerprint } = await request.json();
  if (!fingerprint || typeof fingerprint !== 'string') {
    return NextResponse.json({ error: 'Missing fingerprint' }, { status: 422 });
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: feature } = await supabase
    .from('feature_requests')
    .select('id')
    .eq('public_id', params.id)
    .single();

  if (!feature) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { error } = await supabase.from('votes').insert({
    feature_request_id: feature.id,
    voter_fingerprint: fingerprint,
    user_id: user?.id ?? null,
  });

  if (error) {
    // Unique constraint violation = already voted from this browser.
    if (error.code === '23505') {
      return NextResponse.json({ error: 'You have already voted on this feature request.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data: updated } = await supabase
    .from('feature_requests')
    .select('upvote_count')
    .eq('id', feature.id)
    .single();

  return NextResponse.json({ data: { upvote_count: updated?.upvote_count ?? 0 } }, { status: 201 });
}

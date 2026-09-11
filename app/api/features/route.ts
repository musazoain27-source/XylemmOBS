import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { featureRequestSchema } from '@/lib/validation';
import { notifyAdmins } from '@/lib/server-actions';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search')?.trim();
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const sort = searchParams.get('sort') ?? 'newest';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const pageSize = Math.min(50, Number(searchParams.get('pageSize') ?? '20'));

  let query = supabase
    .from('feature_requests')
    .select('id, public_id, username, title, category, status, upvote_count, created_at, updated_at', { count: 'exact' })
    .eq('is_deleted', false);

  if (search) query = query.ilike('title', `%${search}%`);
  if (category) query = query.eq('category', category);
  if (status) query = query.eq('status', status);

  if (sort === 'popular') query = query.order('upvote_count', { ascending: false });
  else if (sort === 'oldest') query = query.order('created_at', { ascending: true });
  else query = query.order('created_at', { ascending: false });

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data, count });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = featureRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: publicId, error: idError } = await supabase.rpc('next_public_id', {
    p_type: 'feature_request',
  });
  if (idError || !publicId) {
    return NextResponse.json({ error: 'Could not generate an ID, please try again.' }, { status: 500 });
  }

  const { data: inserted, error } = await supabase
    .from('feature_requests')
    .insert({
      public_id: publicId,
      user_id: user?.id ?? null,
      username: parsed.data.username,
      title: parsed.data.title,
      description: parsed.data.description,
      usefulness: parsed.data.usefulness,
      category: parsed.data.category,
      xylemmobs_version: parsed.data.xylemmobs_version,
    })
    .select('id, public_id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await notifyAdmins({
    title: 'New feature request submitted',
    body: `${parsed.data.username} suggested: "${parsed.data.title}"`,
    link: `/post/${inserted.public_id}`,
  });

  return NextResponse.json({ data: inserted }, { status: 201 });
}

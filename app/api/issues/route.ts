import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { issueSchema } from '@/lib/validation';
import { notifyAdmins } from '@/lib/server-actions';

export async function GET(request: NextRequest) {
  const supabase = createServerSupabaseClient();
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search')?.trim();
  const category = searchParams.get('category'); // issues don't have category but keep parity for combined browse
  const status = searchParams.get('status');
  const priority = searchParams.get('priority');
  const knownOnly = searchParams.get('known') === 'true';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const pageSize = Math.min(50, Number(searchParams.get('pageSize') ?? '20'));

  let query = supabase
    .from('issues')
    .select(
      'id, public_id, username, title, status, priority, is_known_issue, is_duplicate_of, created_at, updated_at',
      { count: 'exact' }
    )
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (search) query = query.ilike('title', `%${search}%`);
  if (status) query = query.eq('status', status);
  if (priority) query = query.eq('priority', priority);
  if (knownOnly) query = query.eq('is_known_issue', true);
  void category;

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query.range(from, from + pageSize - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data, count });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = issueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: publicId, error: idError } = await supabase.rpc('next_public_id', {
    p_type: 'issue',
  });
  if (idError || !publicId) {
    return NextResponse.json({ error: 'Could not generate an ID, please try again.' }, { status: 500 });
  }

  const { data: inserted, error } = await supabase
    .from('issues')
    .insert({
      public_id: publicId,
      user_id: user?.id ?? null,
      username: parsed.data.username,
      email: parsed.data.email || null,
      title: parsed.data.title,
      description: parsed.data.description,
      minecraft_version: parsed.data.minecraft_version,
      xylemmobs_version: parsed.data.xylemmobs_version,
      operating_system: parsed.data.operating_system,
      gpu: parsed.data.gpu,
      cpu: parsed.data.cpu || null,
      error_message: parsed.data.error_message || null,
      steps_to_reproduce: parsed.data.steps_to_reproduce,
      expected_result: parsed.data.expected_result,
      actual_result: parsed.data.actual_result,
      priority: parsed.data.priority,
    })
    .select('id, public_id, priority')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  await notifyAdmins({
    title: inserted.priority === 'high' ? 'High-priority issue reported' : 'New issue reported',
    body: `${parsed.data.username} reported: "${parsed.data.title}"`,
    link: `/post/${inserted.public_id}`,
  });

  return NextResponse.json({ data: inserted }, { status: 201 });
}

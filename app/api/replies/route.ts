import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, getCurrentProfile } from '@/lib/supabase/server';
import { replySchema } from '@/lib/validation';
import { logActivity, notifyUser } from '@/lib/server-actions';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = replySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const supabase = createServerSupabaseClient();
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === 'admin';

  // The "official XylemmOBS Team" badge is derived from the server
  // session, never from a client-supplied flag — even if a request
  // were crafted with is_official: true, only an authenticated admin
  // session results in true here, and RLS enforces the same rule again
  // at the database layer.
  const isOfficial = isAdmin;
  const username = isAdmin ? profile!.username : parsed.data.username;

  const columnMap = {
    question: 'question_id',
    issue: 'issue_id',
    feature_request: 'feature_request_id',
  } as const;

  const { data: reply, error } = await supabase
    .from('replies')
    .insert({
      post_type: parsed.data.post_type,
      [columnMap[parsed.data.post_type]]: parsed.data.post_id,
      user_id: profile?.user_id ?? null,
      username,
      body: parsed.data.body,
      is_official: isOfficial,
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  if (isAdmin) {
    const tableMap = { question: 'questions', issue: 'issues', feature_request: 'feature_requests' } as const;
    const { data: post } = await supabase
      .from(tableMap[parsed.data.post_type])
      .select('id, public_id, user_id, title')
      .eq('id', parsed.data.post_id)
      .single();

    if (post) {
      await logActivity({
        adminId: profile!.user_id,
        adminUsername: profile!.username,
        action: 'public_response_posted',
        targetType: parsed.data.post_type,
        targetPublicId: post.public_id,
        targetId: post.id,
      });

      if (post.user_id) {
        await notifyUser({
          userId: post.user_id,
          title: 'The XylemmOBS Team replied',
          body: `New reply on "${post.title}"`,
          link: `/post/${post.public_id}`,
        });
      }
    }
  }

  return NextResponse.json({ data: reply }, { status: 201 });
}

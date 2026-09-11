import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { adminLoginSchema } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // Best-effort brute-force speed bump, keyed by IP + attempted email so
  // one bad actor can't lock out a legitimate admin from a shared IP.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  const body = await request.json();
  const rateLimitKey = `${ip}:${String(body?.email ?? '').toLowerCase()}`;

  const { allowed, retryAfterMs } = checkRateLimit(rateLimitKey);
  if (!allowed) {
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${Math.ceil(retryAfterMs / 60000)} minute(s).` },
      { status: 429 }
    );
  }

  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter a valid email and password.' }, { status: 422 });
  }

  const supabase = createServerSupabaseClient();

  // This sets a secure, httpOnly session cookie via @supabase/ssr —
  // the password itself never touches a cookie or the client bundle
  // after this point, and Supabase Auth hashes/stores it server-side.
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error || !data.user) {
    // Deliberately generic message — don't reveal whether the email
    // exists.
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('user_id', data.user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    // Valid Supabase account, but not an admin — sign them back out
    // immediately so no session lingers, and don't hint at the reason.
    await supabase.auth.signOut();
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  return NextResponse.json({ data: { username: profile.username } });
}

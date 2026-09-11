import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Server Component / Route Handler client. This is the ONLY client
// public-facing code should use on the server for reads/writes that
// should respect Row Level Security and the caller's real session
// (e.g. "am I logged in as an admin"). It uses the anon key + the
// request's cookies, so it can never do more than RLS allows.
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Called from a Server Component that can't set cookies —
            // safe to ignore because middleware refreshes the session.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch {
            // Same as above.
          }
        },
      },
    }
  );
}

/**
 * Returns the current session's profile (including role) or null.
 * This is the single source of truth for "is this request an admin"
 * anywhere on the server. It re-derives the role from the database via
 * RLS + the is_admin() function — it never trusts anything the client
 * sent.
 */
export async function getCurrentProfile() {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return profile ?? null;
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== 'admin') {
    return null;
  }
  return profile;
}

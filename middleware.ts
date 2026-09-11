import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// This runs on the server, in front of every matched request, before
// any page or API route code executes. It is the real gatekeeper for
// /admin — the admin layout also checks again (defense in depth), but
// even if that check were ever removed, this middleware alone is
// enough to keep unauthenticated or non-admin users out.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAdminLogin = path === '/admin/login';
  const isAdminArea = path.startsWith('/admin') && !isAdminLogin;
  const isAdminApi = path.startsWith('/api/admin') && path !== '/api/admin/login';

  if ((isAdminArea || isAdminApi) && !user) {
    if (isAdminApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', path);
    return NextResponse.redirect(loginUrl);
  }

  if ((isAdminArea || isAdminApi) && user) {
    // Re-derive role from the database on every request — never trust
    // a cookie or client value for authorization.
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('error', 'not_authorized');
      return NextResponse.redirect(loginUrl);
    }
  }

  // If an already-authenticated admin visits /admin/login, send them
  // straight to the dashboard.
  if (isAdminLogin && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    if (profile?.role === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

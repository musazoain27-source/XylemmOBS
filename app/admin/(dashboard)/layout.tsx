import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/supabase/server';
import Sidebar from '@/components/admin/Sidebar';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth: middleware.ts already blocks unauthenticated/
  // non-admin requests to everything under /admin before this layout
  // ever runs. This check is a second, independent guarantee — even
  // if middleware were ever misconfigured or bypassed, no page body
  // renders without a verified admin session.
  const profile = await requireAdmin();
  if (!profile) redirect('/admin/login');

  return (
    <div className="flex min-h-screen bg-charcoal-950">
      <Sidebar username={profile.username} />
      <div className="min-w-0 flex-1">
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  );
}

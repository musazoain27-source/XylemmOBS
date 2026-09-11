import { requireAdmin } from '@/lib/supabase/server';

export default async function AdminSettingsPage() {
  const profile = await requireAdmin();

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-charcoal-50">Settings</h1>

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-400">Your Account</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between"><dt className="text-charcoal-500">Username</dt><dd className="text-charcoal-200">{profile?.username}</dd></div>
          <div className="flex justify-between"><dt className="text-charcoal-500">Email</dt><dd className="text-charcoal-200">{profile?.email}</dd></div>
          <div className="flex justify-between"><dt className="text-charcoal-500">Role</dt><dd className="text-moss-400">{profile?.role}</dd></div>
        </dl>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-400">Adding another admin</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-charcoal-300">
          <li>Have the person sign up for a normal account (or create one for them) via Supabase Auth.</li>
          <li>In the Supabase dashboard, open Table Editor &rarr; <code className="rounded bg-charcoal-900 px-1.5 py-0.5 text-xs">profiles</code>.</li>
          <li>Find their row and change <code className="rounded bg-charcoal-900 px-1.5 py-0.5 text-xs">role</code> from <code>user</code> to <code>admin</code>.</li>
        </ol>
        <p className="mt-3 text-xs text-charcoal-500">
          Role changes are deliberately kept out of this dashboard's UI — see the security notes in the README for why
          (role must never be settable from anywhere the browser can reach).
        </p>
      </div>

      <div className="card border-amber-500/20 bg-amber-500/[0.03] p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-amber-400">Security Notes</h2>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-charcoal-300">
          <li>Admin status is re-checked from the database on every request — nothing about it is cached in a cookie or token payload.</li>
          <li>Internal notes and log files are only ever readable through admin-authenticated requests.</li>
          <li>The service role key is never sent to the browser; it's used only inside server-side API routes.</li>
        </ul>
      </div>
    </div>
  );
}

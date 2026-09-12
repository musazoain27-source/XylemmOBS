'use client';

import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import { ListSkeleton, EmptyState } from '@/components/ui/States';

interface UserRow { user_id: string; username: string; email: string | null; role: string; created_at: string }

export default function AdminUsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((json) => setRows(json.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-charcoal-50">Users</h1>
        <p className="mt-1 text-sm text-charcoal-500">
          Everyone with a XylemmOBS Support account. Role changes are made from the Supabase dashboard, not here — see Settings for why.
        </p>
      </div>

      {loading ? (
        <ListSkeleton count={4} />
      ) : rows.length === 0 ? (
        <EmptyState title="No registered accounts yet" description="Most visitors submit anonymously — this only lists people who signed up." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal-800 text-left text-xs uppercase tracking-wide text-charcoal-500">
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.user_id} className="border-b border-charcoal-800/60 last:border-0">
                  <td className="px-4 py-3 font-medium text-charcoal-100">{row.username}</td>
                  <td className="px-4 py-3 text-charcoal-400">{row.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase ${row.role === 'admin' ? 'bg-moss-500/15 text-moss-300' : 'bg-charcoal-800 text-charcoal-400'}`}>
                      {row.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-charcoal-400">{formatDate(row.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

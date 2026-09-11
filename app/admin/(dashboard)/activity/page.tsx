'use client';

import { useEffect, useState } from 'react';
import { formatDateTime } from '@/lib/utils';
import { ListSkeleton, EmptyState } from '@/components/ui/States';
import Pagination from '@/components/Pagination';

interface LogRow {
  id: string; admin_username: string; action: string; target_type: string; target_public_id: string | null; created_at: string;
  details: Record<string, unknown> | null;
}

const PAGE_SIZE = 30;

export default function AdminActivityPage() {
  const [rows, setRows] = useState<LogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/activity?page=${page}&pageSize=${PAGE_SIZE}`)
      .then((r) => r.json())
      .then((json) => { setRows(json.data ?? []); setTotal(json.count ?? 0); })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal-50">Activity Log</h1>

      {loading ? (
        <ListSkeleton count={6} />
      ) : rows.length === 0 ? (
        <EmptyState title="No activity recorded yet" />
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-charcoal-800 text-left text-xs uppercase tracking-wide text-charcoal-500">
                  <th className="px-4 py-3">Admin</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-charcoal-800/60 last:border-0">
                    <td className="px-4 py-3 font-medium text-charcoal-100">{row.admin_username}</td>
                    <td className="px-4 py-3 capitalize text-charcoal-300">{row.action.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 font-mono text-xs text-moss-400">{row.target_public_id ?? row.target_type}</td>
                    <td className="px-4 py-3 text-charcoal-500">{formatDateTime(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

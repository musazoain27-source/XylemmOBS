'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import { KnownIssueBadge } from '@/components/Badges';
import { ListSkeleton, EmptyState } from '@/components/ui/States';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { ISSUE_STATUS_LABELS, ISSUE_PRIORITY_LABELS } from '@/types/database';

interface Row {
  id: string; public_id: string; title: string; username: string; status: string; priority: string;
  is_known_issue: boolean; is_duplicate_of: string | null; created_at: string;
}

export default function AdminIssuesPage() {
  const { push } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: '100' });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (priority) params.set('priority', priority);
    const res = await fetch(`/api/issues?${params}`);
    const json = await res.json();
    setRows(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [status, priority]);
  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [search]);

  async function patch(row: Row, body: Record<string, unknown>) {
    const res = await fetch(`/api/issues/${row.public_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) { push('Update failed', 'error'); return; }
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, ...body } : r)));
    push('Updated', 'success');
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const res = await fetch(`/api/issues/${pendingDelete.public_id}`, { method: 'DELETE' });
    if (!res.ok) push('Failed to delete', 'error');
    else { setRows((rs) => rs.filter((r) => r.id !== pendingDelete.id)); push('Issue deleted', 'success'); }
    setPendingDelete(null);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-charcoal-50">Issues</h1>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row">
        <input placeholder="Search by title…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:flex-1" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any Status</option>
          {Object.entries(ISSUE_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">Any Priority</option>
          {Object.entries(ISSUE_PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {loading ? (
        <ListSkeleton count={5} />
      ) : rows.length === 0 ? (
        <EmptyState title="No issues found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal-800 text-left text-xs uppercase tracking-wide text-charcoal-500">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-charcoal-800/60 last:border-0 hover:bg-charcoal-900/60">
                  <td className="px-4 py-3 font-mono text-xs text-charcoal-400">{row.public_id}</td>
                  <td className="max-w-xs truncate px-4 py-3">
                    <Link href={`/admin/issues/${row.public_id}`} className="font-medium text-charcoal-100 hover:text-moss-400">{row.title}</Link>
                    {row.is_known_issue && <KnownIssueBadge className="ml-2" />}
                  </td>
                  <td className="px-4 py-3 text-charcoal-400">{row.username}</td>
                  <td className="px-4 py-3 text-charcoal-400">{formatDate(row.created_at)}</td>
                  <td className="px-4 py-3">
                    <select value={row.priority} onChange={(e) => patch(row, { priority: e.target.value })} className="!py-1 text-xs">
                      {Object.entries(ISSUE_PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select value={row.status} onChange={(e) => patch(row, { status: e.target.value })} className="!py-1 text-xs">
                      {Object.entries(ISSUE_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/issues/${row.public_id}`} className="btn-secondary !px-2.5 !py-1 text-xs">Review</Link>
                      <button onClick={() => setPendingDelete(row)} className="btn-danger !px-2.5 !py-1 text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete this issue?"
        description={`"${pendingDelete?.title}" will be hidden from the public site.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

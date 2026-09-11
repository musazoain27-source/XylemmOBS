'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { CategoryBadge } from '@/components/Badges';
import { ListSkeleton } from '@/components/ui/States';
import { EmptyState } from '@/components/ui/States';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import { QUESTION_STATUS_LABELS, CATEGORY_LABELS } from '@/types/database';

interface Row {
  id: string; public_id: string; title: string; username: string; category: string; status: string; created_at: string;
}

export default function AdminQuestionsPage() {
  const { push } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams({ pageSize: '100' });
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    if (category) params.set('category', category);
    const res = await fetch(`/api/questions?${params}`);
    const json = await res.json();
    setRows(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [status, category]);
  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [search]);

  async function updateStatus(row: Row, newStatus: string) {
    const res = await fetch(`/api/questions/${row.public_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) { push('Failed to update status', 'error'); return; }
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status: newStatus } : r)));
    push('Status updated', 'success');
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const res = await fetch(`/api/questions/${pendingDelete.public_id}`, { method: 'DELETE' });
    if (!res.ok) { push('Failed to delete', 'error'); }
    else { setRows((rs) => rs.filter((r) => r.id !== pendingDelete.id)); push('Question deleted', 'success'); }
    setPendingDelete(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-charcoal-50">Questions</h1>
      </div>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row">
        <input placeholder="Search by title…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:flex-1" />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Any Status</option>
          {Object.entries(QUESTION_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Any Category</option>
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {loading ? (
        <ListSkeleton count={5} />
      ) : rows.length === 0 ? (
        <EmptyState title="No questions found" />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-charcoal-800 text-left text-xs uppercase tracking-wide text-charcoal-500">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-charcoal-800/60 last:border-0 hover:bg-charcoal-900/60">
                  <td className="px-4 py-3 font-mono text-xs text-charcoal-400">{row.public_id}</td>
                  <td className="max-w-xs truncate px-4 py-3">
                    <Link href={`/admin/questions/${row.public_id}`} className="font-medium text-charcoal-100 hover:text-moss-400">{row.title}</Link>
                  </td>
                  <td className="px-4 py-3 text-charcoal-400">{row.username}</td>
                  <td className="px-4 py-3"><CategoryBadge category={row.category as any} /></td>
                  <td className="px-4 py-3 text-charcoal-400">{formatDate(row.created_at)}</td>
                  <td className="px-4 py-3">
                    <select value={row.status} onChange={(e) => updateStatus(row, e.target.value)} className="!py-1 text-xs">
                      {Object.entries(QUESTION_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/questions/${row.public_id}`} className="btn-secondary !px-2.5 !py-1 text-xs">Open</Link>
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
        title="Delete this question?"
        description={`"${pendingDelete?.title}" will be hidden from the public site. This cannot be undone from the UI.`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}

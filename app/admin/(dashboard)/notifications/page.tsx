'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { timeAgo } from '@/lib/utils';
import { ListSkeleton, EmptyState } from '@/components/ui/States';
import { cn } from '@/lib/utils';

interface Notification {
  id: string; title: string; body: string; link: string | null; is_read: boolean; created_at: string;
}

export default function AdminNotificationsPage() {
  const [rows, setRows] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/notifications');
    const json = await res.json();
    setRows(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, is_read: true } : r)));
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium text-charcoal-50">Notifications</h1>

      {loading ? (
        <ListSkeleton count={5} />
      ) : rows.length === 0 ? (
        <EmptyState title="You're all caught up" description="New submissions and replies will show up here." />
      ) : (
        <div className="card divide-y divide-charcoal-800">
          {rows.map((n) => (
            <div key={n.id} className={cn('flex items-start justify-between gap-4 px-4 py-4', !n.is_read && 'bg-moss-500/5')}>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-charcoal-100">{n.title}</p>
                <p className="mt-0.5 truncate text-sm text-charcoal-400">{n.body}</p>
                <p className="mt-1 text-xs text-charcoal-600">{timeAgo(n.created_at)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {n.link && <Link href={n.link} target="_blank" className="btn-secondary !px-2.5 !py-1 text-xs">View</Link>}
                {!n.is_read && <button onClick={() => markRead(n.id)} className="btn-secondary !px-2.5 !py-1 text-xs">Mark Read</button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

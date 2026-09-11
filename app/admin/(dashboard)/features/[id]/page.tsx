'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { CategoryBadge, OfficialBadge } from '@/components/Badges';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, timeAgo } from '@/lib/utils';
import { FEATURE_STATUS_LABELS } from '@/types/database';
import type { FeatureRequest, Reply } from '@/types/database';

interface FeatureDetail extends FeatureRequest {
  replies: Reply[];
}

export default function AdminFeatureReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();

  const [feature, setFeature] = useState<FeatureDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [posting, setPosting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/features/${params.id}`);
    if (res.ok) setFeature((await res.json()).data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [params.id]);

  async function updateStatus(status: string, successMsg = 'Status updated') {
    const res = await fetch(`/api/features/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return push('Update failed', 'error');
    push(successMsg, 'success');
    load();
  }

  async function postResponse(e: React.FormEvent) {
    e.preventDefault();
    if (!feature || !responseText.trim()) return;
    setPosting(true);
    const res = await fetch('/api/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_type: 'feature_request', post_id: feature.id, username: 'XylemmOBS Team', body: responseText }),
    });
    setPosting(false);
    if (!res.ok) return push('Failed to post response', 'error');
    setResponseText('');
    push('Public response posted', 'success');
    load();
  }

  async function deleteFeature() {
    const res = await fetch(`/api/features/${params.id}`, { method: 'DELETE' });
    if (!res.ok) return push('Failed to delete', 'error');
    push('Feature request deleted', 'success');
    router.push('/admin/features');
  }

  if (loading) return <p className="text-sm text-charcoal-500">Loading…</p>;
  if (!feature) return <p className="text-sm text-charcoal-500">Not found.</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/features" className="text-sm text-charcoal-400 hover:text-moss-400">&larr; All Feature Requests</Link>

      <div className="card p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={feature.status} />
          <CategoryBadge category={feature.category} />
          <span className="ml-auto rounded-full border border-moss-500/30 bg-moss-500/10 px-2.5 py-1 text-xs font-semibold text-moss-300">
            ▲ {feature.upvote_count} upvotes
          </span>
        </div>
        <h1 className="text-xl font-bold text-charcoal-50">{feature.title}</h1>
        <p className="mt-1 text-xs text-charcoal-500">
          {feature.public_id} &middot; by {feature.username} &middot; Submitted {formatDateTime(feature.created_at)} &middot; Updated {timeAgo(feature.updated_at)}
        </p>

        <div className="mt-4">
          <p className="label">Description</p>
          <p className="whitespace-pre-wrap text-sm text-charcoal-300">{feature.description}</p>
        </div>
        <div className="mt-4">
          <p className="label">Why would this be useful?</p>
          <p className="whitespace-pre-wrap text-sm text-charcoal-300">{feature.usefulness}</p>
        </div>
        <div className="mt-4">
          <p className="label">XylemmOBS Version</p>
          <p className="text-sm text-charcoal-300">{feature.xylemmobs_version}</p>
        </div>
      </div>

      <div className="card space-y-4 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal-400">Admin Controls</h2>
        <div>
          <label className="label">Status</label>
          <select value={feature.status} onChange={(e) => updateStatus(e.target.value)} className="w-full sm:w-64">
            {Object.entries(FEATURE_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-charcoal-800 pt-4">
          <button onClick={() => updateStatus('under_review', 'Marked under review')} className="btn-secondary text-sm">Mark Under Review</button>
          <button onClick={() => updateStatus('planned', 'Marked planned')} className="btn-secondary text-sm">Mark Planned</button>
          <button onClick={() => updateStatus('maybe_later', 'Marked maybe later')} className="btn-secondary text-sm">Mark Maybe Later</button>
          <button onClick={() => updateStatus('added', 'Approved and marked added')} className="btn-primary text-sm">Approve (Mark Added)</button>
          <button onClick={() => updateStatus('rejected', 'Rejected')} className="btn-danger text-sm">Reject</button>
          <button onClick={() => setConfirmDelete(true)} className="btn-danger ml-auto text-sm">Delete</button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-400">Public Conversation</h2>
        <div className="space-y-3">
          {feature.replies.map((r) => (
            <div key={r.id} className={`rounded-lg border p-3 ${r.is_official ? 'border-moss-500/40 bg-moss-950/10' : 'border-charcoal-800 bg-charcoal-900/40'}`}>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-semibold text-charcoal-100">{r.username}</span>
                {r.is_official && <OfficialBadge />}
                <span className="text-xs text-charcoal-500">{timeAgo(r.created_at)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-charcoal-300">{r.body}</p>
            </div>
          ))}
          {feature.replies.length === 0 && <p className="text-sm text-charcoal-500">No public responses yet.</p>}
        </div>
        <form onSubmit={postResponse} className="mt-4 space-y-2">
          <label className="label">Public Response (posted as XylemmOBS Team)</label>
          <textarea rows={3} value={responseText} onChange={(e) => setResponseText(e.target.value)} className="w-full" required />
          <button type="submit" disabled={posting} className="btn-primary text-sm">Post Public Response</button>
        </form>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this feature request?"
        description="It will be hidden from the public site immediately."
        confirmLabel="Delete"
        onConfirm={deleteFeature}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

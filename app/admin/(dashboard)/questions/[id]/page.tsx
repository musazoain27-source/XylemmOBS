'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { CategoryBadge, OfficialBadge } from '@/components/Badges';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, timeAgo } from '@/lib/utils';
import { QUESTION_STATUS_LABELS } from '@/types/database';
import type { Question, Reply } from '@/types/database';

export default function AdminQuestionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();

  const [question, setQuestion] = useState<(Question & { replies: Reply[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [responseBody, setResponseBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/questions/${params.id}`);
    if (res.ok) setQuestion((await res.json()).data);
    setLoading(false);
  }

  useEffect(() => { load(); }, [params.id]);

  async function updateStatus(newStatus: string) {
    const res = await fetch(`/api/questions/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) return push('Failed to update status', 'error');
    push('Status updated', 'success');
    load();
  }

  async function postResponse(e: React.FormEvent) {
    e.preventDefault();
    if (!question || !responseBody.trim()) return;
    setPosting(true);
    const res = await fetch('/api/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_type: 'question', post_id: question.id, username: 'XylemmOBS Team', body: responseBody }),
    });
    setPosting(false);
    if (!res.ok) return push('Failed to post response', 'error');
    setResponseBody('');
    push('Response posted publicly', 'success');
    if (question.status === 'waiting_for_answer') await updateStatus('answered'); else load();
  }

  async function deleteQuestion() {
    const res = await fetch(`/api/questions/${params.id}`, { method: 'DELETE' });
    if (!res.ok) return push('Failed to delete', 'error');
    push('Question deleted', 'success');
    router.push('/admin/questions');
  }

  if (loading) return <p className="text-sm text-charcoal-500">Loading…</p>;
  if (!question) return <p className="text-sm text-charcoal-500">Not found.</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/admin/questions" className="text-sm text-charcoal-400 hover:text-moss-400">&larr; All Questions</Link>

      <div className="card p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={question.status} />
          <CategoryBadge category={question.category} />
        </div>
        <h1 className="text-xl font-bold text-charcoal-50">{question.title}</h1>
        <p className="mt-1 text-xs text-charcoal-500">
          {question.public_id} &middot; by {question.username} {question.email && `(${question.email})`} &middot; {formatDateTime(question.created_at)}
        </p>
        <p className="mt-4 whitespace-pre-wrap text-sm text-charcoal-300">{question.details}</p>
        <div className="mt-4 flex gap-3 text-xs text-charcoal-500">
          <span>MC {question.minecraft_version}</span>
          <span>&middot;</span>
          <span>XylemmOBS {question.xylemmobs_version}</span>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-400">Admin Controls</h2>
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs text-charcoal-500">Status</label>
          <select value={question.status} onChange={(e) => updateStatus(e.target.value)}>
            {Object.entries(QUESTION_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button onClick={() => setConfirmDelete(true)} className="btn-danger ml-auto text-sm">Delete Question</button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-400">Conversation</h2>
        <div className="space-y-3">
          {question.replies.map((r) => (
            <div key={r.id} className={`rounded-lg border p-3 ${r.is_official ? 'border-moss-500/40 bg-moss-950/10' : 'border-charcoal-800 bg-charcoal-900/40'}`}>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-semibold text-charcoal-100">{r.username}</span>
                {r.is_official && <OfficialBadge />}
                <span className="text-xs text-charcoal-500">{timeAgo(r.created_at)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-charcoal-300">{r.body}</p>
            </div>
          ))}
          {question.replies.length === 0 && <p className="text-sm text-charcoal-500">No replies yet.</p>}
        </div>

        <form onSubmit={postResponse} className="mt-4 space-y-2">
          <label className="label">Public Response (posted as XylemmOBS Team)</label>
          <textarea rows={4} value={responseBody} onChange={(e) => setResponseBody(e.target.value)} className="w-full" required />
          <button type="submit" disabled={posting} className="btn-primary text-sm">{posting ? 'Posting…' : 'Post Public Response'}</button>
        </form>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this question?"
        description="It will be hidden from the public site immediately."
        confirmLabel="Delete"
        onConfirm={deleteQuestion}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

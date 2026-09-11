'use client';

import { useState } from 'react';
import { OfficialBadge } from '@/components/Badges';
import { timeAgo } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import type { PostType, Reply } from '@/types/database';

export default function ReplyThread({
  postType,
  postId,
  initialReplies,
}: {
  postType: PostType;
  postId: string;
  initialReplies: Reply[];
}) {
  const [replies, setReplies] = useState(initialReplies);
  const [username, setUsername] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { push } = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !body.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/replies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_type: postType, post_id: postId, username, body }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Failed to post reply');
      setReplies((r) => [...r, json.data]);
      setBody('');
      push('Reply posted', 'success');
    } catch (err) {
      push(err instanceof Error ? err.message : 'Something went wrong', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal-400">
        Replies {replies.length > 0 && `(${replies.length})`}
      </h2>

      {replies.length === 0 && (
        <p className="text-sm text-charcoal-500">No replies yet. Be the first to respond.</p>
      )}

      <div className="space-y-3">
        {replies.map((reply) => (
          <div
            key={reply.id}
            className={`card p-4 ${reply.is_official ? 'border-moss-500/40 bg-moss-950/10' : ''}`}
          >
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-charcoal-100">{reply.username}</span>
              {reply.is_official && <OfficialBadge />}
              <span className="text-xs text-charcoal-500">{timeAgo(reply.created_at)}</span>
            </div>
            <p className="whitespace-pre-wrap text-sm text-charcoal-300">{reply.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="card space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-[200px_1fr]">
          <input
            placeholder="Your name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            maxLength={40}
          />
          <input
            placeholder="Write a reply..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            maxLength={3000}
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" disabled={submitting} className="btn-primary text-sm">
            {submitting ? 'Posting…' : 'Post Reply'}
          </button>
        </div>
      </form>
    </div>
  );
}

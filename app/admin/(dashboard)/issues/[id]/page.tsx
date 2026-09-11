'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import { OfficialBadge, KnownIssueBadge } from '@/components/Badges';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui/Toast';
import { formatDateTime, timeAgo, formatBytes } from '@/lib/utils';
import { ISSUE_STATUS_LABELS, ISSUE_PRIORITY_LABELS } from '@/types/database';
import type { Issue, Reply, Attachment, AdminNote } from '@/types/database';

interface IssueDetail extends Issue {
  replies: Reply[];
  attachments: Attachment[];
  duplicate_of: { public_id: string; title: string } | null;
}

interface AdminUser { user_id: string; username: string; role: string }

export default function AdminIssueReviewPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { push } = useToast();

  const [issue, setIssue] = useState<IssueDetail | null>(null);
  const [notes, setNotes] = useState<AdminNote[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [duplicateId, setDuplicateId] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [posting, setPosting] = useState(false);

  async function load() {
    setLoading(true);
    const [issueRes, notesRes, adminsRes] = await Promise.all([
      fetch(`/api/issues/${params.id}`),
      fetch(`/api/issues/${params.id}/notes`),
      fetch('/api/admin/users'),
    ]);
    if (issueRes.ok) setIssue((await issueRes.json()).data);
    if (notesRes.ok) setNotes((await notesRes.json()).data ?? []);
    if (adminsRes.ok) setAdmins(((await adminsRes.json()).data ?? []).filter((a: AdminUser) => a.role === 'admin'));
    setLoading(false);
  }

  useEffect(() => { load(); }, [params.id]);

  async function patch(body: Record<string, unknown>, successMsg = 'Updated') {
    const res = await fetch(`/api/issues/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) { push('Update failed', 'error'); return false; }
    push(successMsg, 'success');
    load();
    return true;
  }

  async function addNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    setPosting(true);
    const res = await fetch(`/api/issues/${params.id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: noteText }),
    });
    setPosting(false);
    if (!res.ok) return push('Failed to add note', 'error');
    setNoteText('');
    push('Internal note added', 'success');
    load();
  }

  async function postResponse(e: React.FormEvent) {
    e.preventDefault();
    if (!issue || !responseText.trim()) return;
    setPosting(true);
    const res = await fetch('/api/replies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_type: 'issue', post_id: issue.id, username: 'XylemmOBS Team', body: responseText }),
    });
    setPosting(false);
    if (!res.ok) return push('Failed to post response', 'error');
    setResponseText('');
    push('Public response posted', 'success');
    load();
  }

  async function assign(adminId: string) {
    const admin = admins.find((a) => a.user_id === adminId);
    if (!admin) return;
    const res = await fetch(`/api/issues/${params.id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_id: admin.user_id, admin_username: admin.username }),
    });
    if (!res.ok) return push('Failed to assign', 'error');
    push(`Assigned to ${admin.username}`, 'success');
    load();
  }

  async function deleteIssue() {
    const res = await fetch(`/api/issues/${params.id}`, { method: 'DELETE' });
    if (!res.ok) return push('Failed to delete', 'error');
    push('Issue deleted', 'success');
    router.push('/admin/issues');
  }

  if (loading) return <p className="text-sm text-charcoal-500">Loading…</p>;
  if (!issue) return <p className="text-sm text-charcoal-500">Not found.</p>;

  const screenshots = issue.attachments.filter((a) => a.kind === 'screenshot');
  const logs = issue.attachments.filter((a) => a.kind === 'log');
  const assignedAdmin = admins.find((a) => a.user_id === issue.assigned_admin_id);

  return (
    <div className="max-w-4xl space-y-6">
      <Link href="/admin/issues" className="text-sm text-charcoal-400 hover:text-moss-400">&larr; All Issues</Link>

      {/* Header */}
      <div className="card p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <StatusBadge status={issue.status} />
          <PriorityBadge priority={issue.priority} />
          {issue.is_known_issue && <KnownIssueBadge />}
          {issue.duplicate_of && (
            <span className="text-xs text-charcoal-500">
              Duplicate of <Link href={`/post/${issue.duplicate_of.public_id}`} className="text-moss-400 underline">{issue.duplicate_of.public_id}</Link>
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold text-charcoal-50">{issue.title}</h1>
        <p className="mt-1 text-xs text-charcoal-500">
          {issue.public_id} &middot; by {issue.username} {issue.email && `(${issue.email})`} &middot; Submitted {formatDateTime(issue.created_at)} &middot; Updated {timeAgo(issue.updated_at)}
        </p>
        {assignedAdmin && <p className="mt-2 text-xs text-moss-400">Assigned to {assignedAdmin.username}</p>}

        <p className="mt-4 whitespace-pre-wrap text-sm text-charcoal-300">{issue.description}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MiniField label="Minecraft" value={issue.minecraft_version} />
          <MiniField label="XylemmOBS" value={issue.xylemmobs_version} />
          <MiniField label="OS" value={issue.operating_system} />
          <MiniField label="GPU" value={issue.gpu} />
          {issue.cpu && <MiniField label="CPU" value={issue.cpu} />}
        </div>

        {issue.error_message && (
          <div className="mt-4">
            <p className="label">Error Message</p>
            <pre className="whitespace-pre-wrap break-words rounded-lg bg-black p-3 font-mono text-xs text-ember-300">{issue.error_message}</pre>
          </div>
        )}

        <div className="mt-4">
          <p className="label">Steps to Reproduce</p>
          <p className="whitespace-pre-wrap text-sm text-charcoal-300">{issue.steps_to_reproduce}</p>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div><p className="label">Expected Result</p><p className="text-sm text-charcoal-300">{issue.expected_result}</p></div>
          <div><p className="label">Actual Result</p><p className="text-sm text-charcoal-300">{issue.actual_result}</p></div>
        </div>

        {screenshots.length > 0 && (
          <div className="mt-4">
            <p className="label">Screenshots</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {screenshots.map((s) => (
                <AttachmentThumb key={s.id} attachment={s} />
              ))}
            </div>
          </div>
        )}

        {logs.length > 0 && (
          <div className="mt-4">
            <p className="label">Uploaded Logs</p>
            <ul className="space-y-1.5">
              {logs.map((l) => (
                <li key={l.id} className="flex items-center justify-between rounded-md bg-charcoal-900 px-3 py-2 text-sm">
                  <AttachmentLink attachment={l} />
                  <span className="text-xs text-charcoal-500">{formatBytes(l.file_size)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Admin controls */}
      <div className="card space-y-4 p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-charcoal-400">Admin Controls</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Status</label>
            <select value={issue.status} onChange={(e) => patch({ status: e.target.value }, 'Status updated')} className="w-full">
              {Object.entries(ISSUE_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Priority</label>
            <select value={issue.priority} onChange={(e) => patch({ priority: e.target.value }, 'Priority updated')} className="w-full">
              {Object.entries(ISSUE_PRIORITY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Assign To</label>
            <select value={issue.assigned_admin_id ?? ''} onChange={(e) => assign(e.target.value)} className="w-full">
              <option value="">Unassigned</option>
              {admins.map((a) => <option key={a.user_id} value={a.user_id}>{a.username}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Link Duplicate Of</label>
            <div className="flex gap-2">
              <input placeholder="XOBS-0027" value={duplicateId} onChange={(e) => setDuplicateId(e.target.value)} className="flex-1" />
              <button
                onClick={async () => {
                  const res = await fetch(`/api/issues/${duplicateId}`);
                  if (!res.ok) return push('Original issue not found', 'error');
                  const { data } = await res.json();
                  await patch({ is_duplicate_of: data.id }, `Linked as duplicate of ${duplicateId}`);
                  setDuplicateId('');
                }}
                className="btn-secondary text-sm"
              >
                Link
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 border-t border-charcoal-800 pt-4">
          <button onClick={() => patch({ is_known_issue: !issue.is_known_issue }, issue.is_known_issue ? 'Unmarked known issue' : 'Marked as known issue')} className="btn-secondary text-sm">
            {issue.is_known_issue ? 'Unmark Known Issue' : 'Mark as Known Issue'}
          </button>
          <button onClick={() => patch({ status: 'need_more_info' }, 'Requested more information')} className="btn-secondary text-sm">Request More Info</button>
          <button onClick={() => patch({ status: 'fixed' }, 'Marked as fixed')} className="btn-secondary text-sm">Mark Fixed</button>
          <button onClick={() => patch({ status: 'open' }, 'Reopened')} className="btn-secondary text-sm">Reopen</button>
          <button onClick={() => patch({ status: 'closed' }, 'Closed')} className="btn-secondary text-sm">Close</button>
          {issue.is_duplicate_of && (
            <button onClick={() => patch({ is_duplicate_of: null }, 'Duplicate link removed')} className="btn-secondary text-sm">Unlink Duplicate</button>
          )}
          <button onClick={() => setConfirmDelete(true)} className="btn-danger ml-auto text-sm">Delete Issue</button>
        </div>
      </div>

      {/* Public response */}
      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-charcoal-400">Public Conversation</h2>
        <div className="space-y-3">
          {issue.replies.map((r) => (
            <div key={r.id} className={`rounded-lg border p-3 ${r.is_official ? 'border-moss-500/40 bg-moss-950/10' : 'border-charcoal-800 bg-charcoal-900/40'}`}>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-semibold text-charcoal-100">{r.username}</span>
                {r.is_official && <OfficialBadge />}
                <span className="text-xs text-charcoal-500">{timeAgo(r.created_at)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-charcoal-300">{r.body}</p>
            </div>
          ))}
          {issue.replies.length === 0 && <p className="text-sm text-charcoal-500">No public responses yet.</p>}
        </div>
        <form onSubmit={postResponse} className="mt-4 space-y-2">
          <label className="label">Public Response (visible to everyone, posted as XylemmOBS Team)</label>
          <textarea rows={3} value={responseText} onChange={(e) => setResponseText(e.target.value)} className="w-full" required />
          <button type="submit" disabled={posting} className="btn-primary text-sm">Post Public Response</button>
        </form>
      </div>

      {/* Internal notes */}
      <div className="card border-amber-500/20 bg-amber-500/[0.03] p-5">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-amber-400">Internal Admin Notes</h2>
        <p className="mb-3 text-xs text-charcoal-500">Never shown publicly. Only visible to admins.</p>
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="rounded-lg border border-charcoal-800 bg-charcoal-900/60 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-charcoal-500">
                <span className="font-semibold text-charcoal-300">{n.admin_username}</span>
                <span>{timeAgo(n.created_at)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-charcoal-300">{n.note}</p>
            </div>
          ))}
          {notes.length === 0 && <p className="text-sm text-charcoal-500">No internal notes yet.</p>}
        </div>
        <form onSubmit={addNote} className="mt-4 space-y-2">
          <textarea rows={3} placeholder="e.g. Likely related to NVIDIA encoder initialization." value={noteText} onChange={(e) => setNoteText(e.target.value)} className="w-full" />
          <button type="submit" disabled={posting} className="btn-secondary text-sm">Add Internal Note</button>
        </form>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this issue?"
        description="It will be hidden from the public site immediately."
        confirmLabel="Delete"
        onConfirm={deleteIssue}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-charcoal-800 bg-charcoal-900/50 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-charcoal-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-charcoal-200">{value}</p>
    </div>
  );
}

/** Fetches a short-lived signed URL on demand rather than assuming a public path. */
function AttachmentThumb({ attachment }: { attachment: Attachment }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/attachments/${attachment.id}/url`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => setUrl(json?.data?.url ?? null));
  }, [attachment.id]);

  if (!url) return <div className="h-28 animate-pulse rounded-lg border border-charcoal-700 bg-charcoal-800" />;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-charcoal-700">
      <Image src={url} alt={attachment.file_name} width={200} height={140} className="h-28 w-full object-cover" unoptimized />
    </a>
  );
}

function AttachmentLink({ attachment }: { attachment: Attachment }) {
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  async function open() {
    setLoading(true);
    const res = await fetch(`/api/admin/attachments/${attachment.id}/url`);
    setLoading(false);
    if (!res.ok) return push('Could not open file', 'error');
    const { data } = await res.json();
    window.open(data.url, '_blank', 'noopener');
  }

  return (
    <button onClick={open} disabled={loading} className="text-moss-400 hover:underline disabled:opacity-50">
      {attachment.file_name}
    </button>
  );
}

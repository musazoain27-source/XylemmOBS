'use client';

import { useEffect, useState } from 'react';
import Logo from '@/components/Logo';
import FormField from '@/components/ui/FormField';
import StatusBadge from '@/components/StatusBadge';
import { CategoryBadge } from '@/components/Badges';
import { CATEGORY_LABELS } from '@/types/database';
import type { FeatureRequest } from '@/types/database';
import { featureRequestSchema } from '@/lib/validation';
import { getVoterFingerprint, timeAgo } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';

const initialForm = { username: '', title: '', description: '', usefulness: '', category: 'other' as const, xylemmobs_version: '' };

export default function FeatureRequestPage() {
  const { push } = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());

  async function loadFeatures() {
    setLoading(true);
    const res = await fetch('/api/features?sort=popular&pageSize=30');
    const json = await res.json();
    setFeatures(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadFeatures(); }, []);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const parsed = featureRequestSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await fetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(typeof json.error === 'string' ? json.error : 'Please check the form and try again.');
      push(`Submitted as ${json.data.public_id}`, 'success');
      setForm(initialForm);
      setShowForm(false);
      loadFeatures();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  async function vote(publicId: string) {
    if (votedIds.has(publicId)) return;
    const fingerprint = getVoterFingerprint();
    const res = await fetch(`/api/features/${publicId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fingerprint }),
    });
    const json = await res.json();
    if (!res.ok) {
      push(json.error ?? 'Could not vote', 'error');
      if (res.status === 409) setVotedIds((s) => new Set(s).add(publicId));
      return;
    }
    setVotedIds((s) => new Set(s).add(publicId));
    setFeatures((fs) => fs.map((f) => (f.public_id === publicId ? { ...f, upvote_count: json.data.upvote_count } : f)));
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size={48} withText={false} href={null} glow className="mb-4" />
        <h1 className="text-xl font-medium text-charcoal-50">Feature Requests</h1>
        <p className="mt-2 text-sm text-charcoal-400">Suggest an idea, or upvote one you'd like to see built.</p>
        <button onClick={() => setShowForm((v) => !v)} className="btn-primary mt-5 text-sm">
          {showForm ? 'Cancel' : '+ Suggest a Feature'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="card mb-8 space-y-5 p-6 animate-fadeIn">
          <FormField label="Username" htmlFor="username" error={errors.username} required>
            <input id="username" value={form.username} onChange={(e) => update('username', e.target.value)} maxLength={40} className="w-full" />
          </FormField>
          <FormField label="Feature Title" htmlFor="title" error={errors.title} required>
            <input id="title" value={form.title} onChange={(e) => update('title', e.target.value)} maxLength={150} className="w-full" />
          </FormField>
          <FormField label="Full Description" htmlFor="description" error={errors.description} required>
            <textarea id="description" rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} className="w-full" />
          </FormField>
          <FormField label="Why would this feature be useful?" htmlFor="usefulness" error={errors.usefulness} required>
            <textarea id="usefulness" rows={3} value={form.usefulness} onChange={(e) => update('usefulness', e.target.value)} className="w-full" />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Category" htmlFor="category" required>
              <select id="category" value={form.category} onChange={(e) => update('category', e.target.value as typeof form.category)} className="w-full">
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </FormField>
            <FormField label="XylemmOBS Version" htmlFor="xov" error={errors.xylemmobs_version} required>
              <input id="xov" placeholder="2.4.0" value={form.xylemmobs_version} onChange={(e) => update('xylemmobs_version', e.target.value)} className="w-full" />
            </FormField>
          </div>
          {formError && <p className="rounded-lg border border-ember-500/30 bg-ember-500/10 px-3 py-2 text-sm text-ember-400">{formError}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Submitting…' : 'Submit Feature Request'}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {loading && <p className="text-center text-sm text-charcoal-500">Loading…</p>}
        {!loading && features.length === 0 && (
          <p className="text-center text-sm text-charcoal-500">No feature requests yet.</p>
        )}
        {features.map((f) => (
          <div key={f.id} className="card flex items-center gap-4 p-4">
            <button
              onClick={() => vote(f.public_id)}
              disabled={votedIds.has(f.public_id)}
              className="flex w-14 flex-col items-center justify-center rounded-lg border border-charcoal-700 bg-charcoal-900 py-2 text-moss-400 transition-colors hover:border-moss-500 hover:bg-moss-500/10 disabled:cursor-default disabled:opacity-60"
              aria-label="Upvote"
            >
              <span className="text-lg leading-none">▲</span>
              <span className="text-xs font-semibold text-charcoal-200">{f.upvote_count}</span>
            </button>
            <Link href={`/post/${f.public_id}`} className="min-w-0 flex-1">
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <StatusBadge status={f.status} />
                <CategoryBadge category={f.category} />
              </div>
              <p className="truncate font-medium text-charcoal-100">{f.title}</p>
              <p className="mt-1 text-xs text-charcoal-500">
                {f.public_id} &middot; by {f.username} &middot; {timeAgo(f.created_at)}
              </p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

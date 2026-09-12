'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import FormField from '@/components/ui/FormField';
import { CATEGORY_LABELS } from '@/types/database';
import { questionSchema } from '@/lib/validation';

const initialForm = {
  username: '', email: '', title: '', details: '', minecraft_version: '', xylemmobs_version: '', category: 'other' as const,
};

export default function AskQuestionPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = questionSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(typeof json.error === 'string' ? json.error : 'Please check the form and try again.');
      router.push(`/ask/success?id=${json.data.public_id}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size={48} withText={false} href={null} className="mb-4" />
        <h1 className="text-xl font-medium text-charcoal-50">Ask a Question</h1>
        <p className="mt-2 text-sm text-charcoal-400">The more detail you give, the faster we can help.</p>
      </div>

      <form onSubmit={submit} className="card space-y-5 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Username" htmlFor="username" error={errors.username} required>
            <input id="username" value={form.username} onChange={(e) => update('username', e.target.value)} maxLength={40} className="w-full" />
          </FormField>
          <FormField label="Email" htmlFor="email" error={errors.email} hint="Optional — for follow-up only">
            <input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full" />
          </FormField>
        </div>

        <FormField label="Question Title" htmlFor="title" error={errors.title} required>
          <input id="title" value={form.title} onChange={(e) => update('title', e.target.value)} maxLength={150} className="w-full" />
        </FormField>

        <FormField label="Full Question / Details" htmlFor="details" error={errors.details} required>
          <textarea id="details" rows={6} value={form.details} onChange={(e) => update('details', e.target.value)} className="w-full" />
        </FormField>

        <div className="grid gap-5 sm:grid-cols-3">
          <FormField label="Minecraft Version" htmlFor="mcv" error={errors.minecraft_version} required>
            <input id="mcv" placeholder="1.21.1" value={form.minecraft_version} onChange={(e) => update('minecraft_version', e.target.value)} className="w-full" />
          </FormField>
          <FormField label="XylemmOBS Version" htmlFor="xov" error={errors.xylemmobs_version} required>
            <input id="xov" placeholder="2.4.0" value={form.xylemmobs_version} onChange={(e) => update('xylemmobs_version', e.target.value)} className="w-full" />
          </FormField>
          <FormField label="Category" htmlFor="category" required>
            <select id="category" value={form.category} onChange={(e) => update('category', e.target.value as typeof form.category)} className="w-full">
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </FormField>
        </div>

        {formError && <p className="rounded-lg border border-ember-500/30 bg-ember-500/10 px-3 py-2 text-sm text-ember-400">{formError}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Submitting…' : 'Submit Question'}
        </button>
      </form>
    </div>
  );
}

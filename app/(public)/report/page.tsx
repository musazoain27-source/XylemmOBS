'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import FormField from '@/components/ui/FormField';
import FileUpload from '@/components/FileUpload';
import { issueSchema } from '@/lib/validation';
import { useToast } from '@/components/ui/Toast';

const initialForm = {
  username: '', email: '', title: '', description: '',
  minecraft_version: '', xylemmobs_version: '', operating_system: '', gpu: '', cpu: '',
  error_message: '', steps_to_reproduce: '', expected_result: '', actual_result: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
};

export default function ReportIssuePage() {
  const router = useRouter();
  const { push } = useToast();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [logs, setLogs] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsed = issueSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as string] = issue.message;
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(typeof json.error === 'string' ? json.error : 'Please check the form and try again.');

      const issueId: string = json.data.id;
      const uploads = [
        ...screenshots.map((file) => ({ file, kind: 'screenshot' as const })),
        ...logs.map((file) => ({ file, kind: 'log' as const })),
      ];

      let uploadFailures = 0;
      for (const { file, kind } of uploads) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('issueId', issueId);
        fd.append('kind', kind);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!uploadRes.ok) uploadFailures += 1;
      }
      if (uploadFailures > 0) {
        push(`${uploadFailures} attachment(s) failed to upload, but your issue was submitted.`, 'error');
      }

      router.push(`/report/success?id=${json.data.public_id}`);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size={48} withText={false} href={null} className="mb-4" />
        <h1 className="text-2xl font-bold text-charcoal-50">Report an Issue</h1>
        <p className="mt-2 text-sm text-charcoal-400">Detailed reports get fixed faster. Include steps, logs, and screenshots if you can.</p>
      </div>

      <form onSubmit={submit} className="card space-y-6 p-6">
        <fieldset className="space-y-5">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss-400">Reporter</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Username" htmlFor="username" error={errors.username} required>
              <input id="username" value={form.username} onChange={(e) => update('username', e.target.value)} maxLength={40} className="w-full" />
            </FormField>
            <FormField label="Email" htmlFor="email" error={errors.email} hint="Optional — for follow-up only">
              <input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full" />
            </FormField>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss-400">Issue</legend>
          <FormField label="Issue Title" htmlFor="title" error={errors.title} required>
            <input id="title" value={form.title} onChange={(e) => update('title', e.target.value)} maxLength={150} className="w-full" />
          </FormField>
          <FormField label="Detailed Description" htmlFor="description" error={errors.description} required>
            <textarea id="description" rows={5} value={form.description} onChange={(e) => update('description', e.target.value)} className="w-full" />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-3">
            <FormField label="Priority" htmlFor="priority" required>
              <select id="priority" value={form.priority} onChange={(e) => update('priority', e.target.value as typeof form.priority)} className="w-full">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </FormField>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss-400">Technical Information</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Minecraft Version" htmlFor="mcv" error={errors.minecraft_version} required>
              <input id="mcv" placeholder="1.21.1" value={form.minecraft_version} onChange={(e) => update('minecraft_version', e.target.value)} className="w-full" />
            </FormField>
            <FormField label="XylemmOBS Version" htmlFor="xov" error={errors.xylemmobs_version} required>
              <input id="xov" placeholder="2.4.0" value={form.xylemmobs_version} onChange={(e) => update('xylemmobs_version', e.target.value)} className="w-full" />
            </FormField>
            <FormField label="Operating System" htmlFor="os" error={errors.operating_system} required>
              <input id="os" placeholder="Windows 11" value={form.operating_system} onChange={(e) => update('operating_system', e.target.value)} className="w-full" />
            </FormField>
            <FormField label="GPU" htmlFor="gpu" error={errors.gpu} required>
              <input id="gpu" placeholder="NVIDIA RTX 4070" value={form.gpu} onChange={(e) => update('gpu', e.target.value)} className="w-full" />
            </FormField>
            <FormField label="CPU" htmlFor="cpu" hint="Optional">
              <input id="cpu" placeholder="Ryzen 7 7800X3D" value={form.cpu} onChange={(e) => update('cpu', e.target.value)} className="w-full" />
            </FormField>
          </div>
          <FormField label="Error Message" htmlFor="error" hint="Optional — paste the exact error text if shown">
            <textarea id="error" rows={3} value={form.error_message} onChange={(e) => update('error_message', e.target.value)} className="w-full font-mono text-xs" />
          </FormField>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss-400">Reproduction</legend>
          <FormField label="Steps to Reproduce" htmlFor="steps" error={errors.steps_to_reproduce} required>
            <textarea id="steps" rows={4} placeholder={'1. Open XylemmOBS\n2. Start recording\n3. ...'} value={form.steps_to_reproduce} onChange={(e) => update('steps_to_reproduce', e.target.value)} className="w-full" />
          </FormField>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Expected Result" htmlFor="expected" error={errors.expected_result} required>
              <textarea id="expected" rows={3} value={form.expected_result} onChange={(e) => update('expected_result', e.target.value)} className="w-full" />
            </FormField>
            <FormField label="Actual Result" htmlFor="actual" error={errors.actual_result} required>
              <textarea id="actual" rows={3} value={form.actual_result} onChange={(e) => update('actual_result', e.target.value)} className="w-full" />
            </FormField>
          </div>
        </fieldset>

        <fieldset className="space-y-5">
          <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-moss-400">Attachments</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <FileUpload kind="screenshot" label="Screenshots" hint="PNG, JPEG, WEBP, GIF — up to 8MB each" accept="image/png,image/jpeg,image/webp,image/gif" files={screenshots} onChange={setScreenshots} />
            <FileUpload kind="log" label="Log Files" hint=".log or .txt — up to 15MB each" accept=".log,.txt,text/plain" files={logs} onChange={setLogs} />
          </div>
        </fieldset>

        {formError && <p className="rounded-lg border border-ember-500/30 bg-ember-500/10 px-3 py-2 text-sm text-ember-400">{formError}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Submitting…' : 'Submit Issue Report'}
        </button>
      </form>
    </div>
  );
}

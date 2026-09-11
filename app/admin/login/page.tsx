'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Logo from '@/components/Logo';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const notAuthorized = searchParams.get('error') === 'not_authorized';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Login failed');
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo size={56} withText={false} href="/" className="mb-4" />
          <h1 className="text-xl font-bold text-charcoal-50">XylemmOBS Admin</h1>
          <p className="mt-1 text-sm text-charcoal-500">Sign in to manage the support platform.</p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          {notAuthorized && (
            <p className="rounded-lg border border-ember-500/30 bg-ember-500/10 px-3 py-2 text-sm text-ember-400">
              That account doesn't have admin access.
            </p>
          )}
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" autoComplete="username" />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" autoComplete="current-password" />
          </div>
          {error && <p className="rounded-lg border border-ember-500/30 bg-ember-500/10 px-3 py-2 text-sm text-ember-400">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}

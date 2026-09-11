'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function SubmissionSuccess({
  id,
  title,
  browseHref,
}: {
  id: string;
  title: string;
  browseHref: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:px-6">
      <Logo size={56} withText={false} href={null} className="mb-6" />
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-moss-500/15 text-moss-400">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </span>
      <h1 className="text-xl font-bold text-charcoal-50">{title}</h1>
      <p className="mt-2 text-sm text-charcoal-400">
        Thanks — the XylemmOBS team has been notified. Keep your ID to track progress and reply.
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-lg border border-charcoal-700 bg-charcoal-900 px-4 py-3">
        <span className="font-mono text-lg font-semibold text-moss-300">{id}</span>
        <button onClick={copy} className="btn-secondary !px-3 !py-1.5 text-xs">
          {copied ? 'Copied!' : 'Copy ID'}
        </button>
      </div>

      <div className="mt-8 flex gap-3">
        <Link href={`/post/${id}`} className="btn-primary text-sm">View Submission</Link>
        <Link href={browseHref} className="btn-secondary text-sm">Browse All</Link>
      </div>
    </div>
  );
}

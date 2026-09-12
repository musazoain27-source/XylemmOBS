'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';
import { MOD_RELEASE } from '@/lib/modRelease';

const LINKS = [
  { href: '/ask', label: 'Ask a Question' },
  { href: '/report', label: 'Report an Issue' },
  { href: '/feature-request', label: 'Request a Feature' },
  { href: '/browse', label: 'Browse' },
  { href: '/faq', label: 'FAQ' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal-800/80 bg-black/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-3 py-2 text-sm font-medium text-charcoal-300 transition-colors hover:bg-charcoal-800/70 hover:text-white',
                pathname === link.href && 'bg-charcoal-800/70 text-moss-300'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <a href={MOD_RELEASE.filePath} download className="btn-primary text-xs">
            Download
          </a>
          <Link href="/admin/login" className="btn-secondary text-xs">
            Admin Login
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-charcoal-700 text-charcoal-200 lg:hidden"
          aria-label="Toggle menu"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            {open ? (
              <path d="M2 2L16 16M16 2L2 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            ) : (
              <path d="M2 4H16M2 9H16M2 14H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-charcoal-800 bg-black px-4 py-3 lg:hidden animate-fadeIn">
          <div className="flex flex-col gap-1">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-charcoal-200 hover:bg-charcoal-800"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={MOD_RELEASE.filePath}
              download
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 justify-center text-sm"
            >
              Download XylemmOBS
            </a>
            <Link
              href="/admin/login"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-md border border-charcoal-700 px-3 py-2.5 text-sm font-medium text-charcoal-200"
            >
              Admin Login
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

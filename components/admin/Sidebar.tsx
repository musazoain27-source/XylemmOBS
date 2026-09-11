'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/admin', label: 'Dashboard', exact: true, icon: 'M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6V11h-6v9zm0-16v5h6V4h-6z' },
  { href: '/admin/questions', label: 'Questions', icon: 'M8 10h.01M12 10h.01M16 10h.01M21 12a9 9 0 11-9-9 9 9 0 019 9z' },
  { href: '/admin/issues', label: 'Issues', icon: 'M12 9v4m0 4h.01M10.3 3.9L2.6 17a1.5 1.5 0 001.3 2.3h16.2a1.5 1.5 0 001.3-2.3L13.7 3.9a1.5 1.5 0 00-2.6 0z' },
  { href: '/admin/features', label: 'Feature Requests', icon: 'M12 2l2.5 6.5L21 10l-5 4.4L17.5 21 12 17.5 6.5 21 8 14.4 3 10l6.5-1.5L12 2z' },
  { href: '/admin/users', label: 'Users', icon: 'M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m5-4a4 4 0 100-8 4 4 0 000 8zm6 4a4 4 0 00-4-4M9 12a4 4 0 01-4-4' },
  { href: '/admin/notifications', label: 'Notifications', icon: 'M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2a2 2 0 01-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { href: '/admin/activity', label: 'Activity', icon: 'M3 12h4l3 8 4-16 3 8h4' },
  { href: '/admin/settings', label: 'Settings', icon: 'M10.3 2.3a2 2 0 013.4 0l.4.7a2 2 0 001.7 1l.8-.1a2 2 0 012.3 2.3l-.1.8a2 2 0 001 1.7l.7.4a2 2 0 010 3.4l-.7.4a2 2 0 00-1 1.7l.1.8a2 2 0 01-2.3 2.3l-.8-.1a2 2 0 00-1.7 1l-.4.7a2 2 0 01-3.4 0l-.4-.7a2 2 0 00-1.7-1l-.8.1a2 2 0 01-2.3-2.3l.1-.8a2 2 0 00-1-1.7l-.7-.4a2 2 0 010-3.4l.7-.4a2 2 0 001-1.7l-.1-.8a2 2 0 012.3-2.3l.8.1a2 2 0 001.7-1l.4-.7z' },
];

export default function Sidebar({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-charcoal-800 bg-charcoal-925 sticky top-0">
      <div className="border-b border-charcoal-800 px-5 py-4">
        <Logo size={30} />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active ? 'bg-moss-500/15 text-moss-300' : 'text-charcoal-400 hover:bg-charcoal-800 hover:text-charcoal-100'
              )}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d={item.icon} />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-charcoal-800 p-3">
        <div className="mb-2 truncate px-2 text-xs text-charcoal-500">Signed in as <span className="text-charcoal-300">{username}</span></div>
        <button onClick={logout} className="btn-secondary w-full text-sm">
          Log Out
        </button>
      </div>
    </aside>
  );
}

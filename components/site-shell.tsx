import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ShieldCheck, Video } from 'lucide-react';
export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <Link prefetch={false} href="/" className="brand">
          <Image
            unoptimized
            src="/logo.png"
            width="52"
            height="52"
            alt="XylemmOBS logo"
          />
          <span>
            Xylemm<span className="brand-obs">OBS</span>
            <small>SUPPORT CENTER</small>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <Link prefetch={false} href="/">
            Help center
          </Link>
          <Link prefetch={false} href="/track">
            Check a report
          </Link>
          <Link prefetch={false} className="inbox-link" href="/inbox">
            <ShieldCheck size={16} /> Owner inbox <ArrowUpRight size={14} />
          </Link>
        </nav>
      </header>
      <main id="main" className="site-main">
        {children}
      </main>
      <footer className="site-footer">
        <span>
          <Video size={15} /> XylemmOBS <span className="muted">/</span> Made
          for the moments you capture.
        </span>
        <div>
          <Link prefetch={false} href="/privacy">
            Privacy
          </Link>
          <Link prefetch={false} href="/inbox">
            Owner sign in
          </Link>
        </div>
      </footer>
    </>
  );
}

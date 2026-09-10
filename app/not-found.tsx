import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
export default function NotFound() {
  return (
    <SiteShell>
      <section className="form-card sign-in-card">
        <span className="section-kicker">404</span>
        <h1>That page isn’t here.</h1>
        <p className="lead">Let’s get you back to the help center.</p>
        <Link prefetch={false} className="primary-link" href="/">
          Open help center
        </Link>
      </section>
    </SiteShell>
  );
}

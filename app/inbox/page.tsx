import Link from 'next/link';
import { env } from 'cloudflare:workers';
import {
  getChatGPTUser,
  chatGPTSignInPath,
  chatGPTSignOutPath,
} from '@/app/chatgpt-auth';
import { isAdminEmail } from '@/lib/validation';
import { Inbox } from '@/components/inbox';
import { SiteShell } from '@/components/site-shell';
import { ShieldCheck } from 'lucide-react';
export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Owner inbox — XylemmOBS',
  robots: { index: false, follow: false },
};
export default async function Page() {
  const user = await getChatGPTUser();
  if (user && isAdminEmail(user.email, env.ADMIN_EMAIL)) return <Inbox />;
  return (
    <SiteShell>
      <section className="form-card sign-in-card">
        <ShieldCheck size={36} />
        <span className="section-kicker">OWNER ACCESS</span>
        <h1>Private support inbox.</h1>
        <p className="lead">
          {user
            ? 'This account does not have access. Sign in with the owner’s account to continue.'
            : 'Sign in with your ChatGPT account to read questions, reply to reports, and manage their status.'}
        </p>
        <a
          className="primary-link"
          href={
            user ? chatGPTSignOutPath('/inbox') : chatGPTSignInPath('/inbox')
          }
          target="_top"
        >
          {user ? 'Sign out and switch account' : 'Sign in with ChatGPT'}
        </a>
        <Link prefetch={false} className="text-link" href="/">
          Return to help center
        </Link>
      </section>
    </SiteShell>
  );
}

import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
export const metadata = { title: 'Privacy — XylemmOBS' };
export default function Page() {
  return (
    <SiteShell>
      <Link prefetch={false} className="back-link" href="/">
        ← Back to help center
      </Link>
      <article className="form-card prose-card">
        <span className="section-kicker">SUPPORT & PRIVACY</span>
        <h1>Your report stays private.</h1>
        <h2>What is stored</h2>
        <p>
          When you send a question or issue, the site stores your subject,
          message, technical details, submission time, status and developer
          reply. An access key lets you retrieve your report. The database
          stores a hash of this key, rather than the key itself.
        </p>
        <h2>Who can read it</h2>
        <p>
          The site owner can read reports in an account-protected inbox. Anyone
          with your private tracking link can also read that report. Keep your
          link safe. Reports are not published in the help center.
        </p>
        <h2>No email required</h2>
        <p>
          The support form does not ask for an email address. It does not send
          email notifications. Save your tracking link and check it for replies.
          Without that link, you cannot unlock a report using its reference
          number alone.
        </p>
        <h2>Basic abuse protection</h2>
        <p>
          The server uses a hashed network address and a temporary request count
          to limit spam. Those counters expire after a short period and are
          cleaned up during later requests. This site uses no advertising
          trackers.
        </p>
        <h2>Keep sensitive information out</h2>
        <p>
          Do not include passwords, tokens, or unnecessary personal information.
          Messages remain in the support database until removed by the owner. To
          request removal, send a question with the report reference and explain
          your request; never post your private tracking key in a public place.
        </p>
        <h2>Owner sign-in</h2>
        <p>
          The inbox uses ChatGPT sign-in and only accepts the owner’s configured
          account. The hosting provider also processes requests and
          authentication according to its own policies.
        </p>
      </article>
    </SiteShell>
  );
}

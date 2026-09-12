import Link from 'next/link';
import Logo from '@/components/Logo';
import PostCard from '@/components/PostCard';
import ModGallery from '@/components/ModGallery';
import { EmptyState } from '@/components/ui/States';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const ACTIONS = [
  {
    href: '/ask',
    title: 'Ask a Question',
    description: 'Get help from the community and the XylemmOBS team.',
    icon: (
      <path d="M9.5 15.5a2.5 2.5 0 105 0M12 3a6 6 0 00-6 6c0 2.2 1.2 3.4 2 4.3.5.6.8 1 .9 1.7h6.2c.1-.7.4-1.1.9-1.7.8-.9 2-2.1 2-4.3a6 6 0 00-6-6z" />
    ),
  },
  {
    href: '/report',
    title: 'Report an Issue',
    description: 'Found a bug or crash? Give us the details so we can fix it.',
    icon: <path d="M12 9v4m0 4h.01M10.3 3.9L2.6 17a1.5 1.5 0 001.3 2.3h16.2a1.5 1.5 0 001.3-2.3L13.7 3.9a1.5 1.5 0 00-2.6 0z" />,
  },
  {
    href: '/feature-request',
    title: 'Request a Feature',
    description: 'Suggest something new and vote on ideas from others.',
    icon: <path d="M12 2l2.5 6.5L21 10l-5 4.4L17.5 21 12 17.5 6.5 21 8 14.4 3 10l6.5-1.5L12 2z" />,
  },
  {
    href: '/browse',
    title: 'Browse Questions & Issues',
    description: 'Search everything the community has already reported.',
    icon: <path d="M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM21 21l-4.3-4.3" />,
  },
];

export default async function HomePage() {
  const supabase = createServerSupabaseClient();

  const [{ data: recentQuestions }, { data: recentIssues }, { data: knownIssues }, { data: fixedIssues }, { data: popularFeatures }] =
    await Promise.all([
      supabase.from('questions').select('public_id, title, username, created_at, status, category').eq('is_deleted', false).order('created_at', { ascending: false }).limit(4),
      supabase.from('issues').select('public_id, title, username, created_at, status, priority, is_known_issue').eq('is_deleted', false).order('created_at', { ascending: false }).limit(4),
      supabase.from('issues').select('public_id, title, username, created_at, status, priority, is_known_issue').eq('is_deleted', false).eq('is_known_issue', true).order('created_at', { ascending: false }).limit(4),
      supabase.from('issues').select('public_id, title, username, created_at, status, priority').eq('is_deleted', false).eq('status', 'fixed').order('updated_at', { ascending: false }).limit(4),
      supabase.from('feature_requests').select('public_id, title, username, created_at, status, category, upvote_count').eq('is_deleted', false).order('upvote_count', { ascending: false }).limit(4),
    ]);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-charcoal-800/80 px-4 py-16 sm:py-20 lg:py-28">
        <div className="glow-orb -top-32 left-1/4 h-96 w-96" />
        <div className="glow-orb -right-32 top-10 h-80 w-80 opacity-60" style={{ animationDelay: '1.5s' }} />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <Logo size={64} withText={false} href={null} className="mb-6 animate-fadeInUp" />
            <h1 className="animate-fadeInUp font-pixel text-2xl leading-tight text-charcoal-50 sm:text-3xl md:text-4xl" style={{ animationDelay: '0.1s' }}>
              XylemmOBS <span className="text-gradient">Support</span>
            </h1>
            <p className="mt-4 max-w-lg animate-fadeInUp text-balance text-base text-charcoal-400 sm:text-lg" style={{ animationDelay: '0.2s' }}>
              Ask questions, report issues, request features, and help improve XylemmOBS.
            </p>

            <div className="mt-9 grid w-full animate-fadeInUp grid-cols-1 gap-3 sm:grid-cols-2" style={{ animationDelay: '0.3s' }}>
              {ACTIONS.map((action, i) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="card-interactive group flex flex-col items-center gap-2.5 p-5 text-center lg:items-start lg:text-left"
                  style={{ animationDelay: `${0.35 + i * 0.08}s` }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-moss-500/10 text-moss-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-moss-500/25 group-hover:text-moss-300">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      {action.icon}
                    </svg>
                  </span>
                  <span className="text-sm font-semibold text-charcoal-100">{action.title}</span>
                  <span className="text-xs text-charcoal-500">{action.description}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="w-full animate-fadeInUp" style={{ animationDelay: '0.45s' }}>
            <ModGallery />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 py-14 sm:px-6">
        <Section title="Recent Questions" viewAllHref="/browse?type=question">
          {recentQuestions?.length ? (
            <Grid>
              {recentQuestions.map((q) => (
                <PostCard key={q.public_id} post={{ ...q, type: 'question' }} />
              ))}
            </Grid>
          ) : (
            <EmptyState title="No questions yet" description="Be the first to ask something." />
          )}
        </Section>

        <Section title="Recent Issues" viewAllHref="/browse?type=issue">
          {recentIssues?.length ? (
            <Grid>
              {recentIssues.map((i) => (
                <PostCard key={i.public_id} post={{ ...i, type: 'issue' }} />
              ))}
            </Grid>
          ) : (
            <EmptyState title="No issues reported" description="Everything running smoothly so far." />
          )}
        </Section>

        <Section title="Known Issues" viewAllHref="/known-issues">
          {knownIssues?.length ? (
            <Grid>
              {knownIssues.map((i) => (
                <PostCard key={i.public_id} post={{ ...i, type: 'issue' }} />
              ))}
            </Grid>
          ) : (
            <EmptyState title="No known issues" description="Check back later, or report one if you've found a bug." />
          )}
        </Section>

        <Section title="Recently Fixed" viewAllHref="/browse?status=fixed">
          {fixedIssues?.length ? (
            <Grid>
              {fixedIssues.map((i) => (
                <PostCard key={i.public_id} post={{ ...i, type: 'issue' }} />
              ))}
            </Grid>
          ) : (
            <EmptyState title="Nothing marked fixed yet" />
          )}
        </Section>

        <Section title="Popular Feature Requests" viewAllHref="/feature-request">
          {popularFeatures?.length ? (
            <Grid>
              {popularFeatures.map((f) => (
                <PostCard key={f.public_id} post={{ ...f, type: 'feature_request' }} />
              ))}
            </Grid>
          ) : (
            <EmptyState title="No feature requests yet" description="Suggest the first one." />
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({ title, viewAllHref, children }: { title: string; viewAllHref: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal-50">{title}</h2>
        <Link href={viewAllHref} className="text-sm font-medium text-moss-400 hover:text-moss-300">
          View all &rarr;
        </Link>
      </div>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>;
}

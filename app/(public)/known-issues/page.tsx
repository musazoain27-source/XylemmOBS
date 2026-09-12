import Logo from '@/components/Logo';
import PostCard from '@/components/PostCard';
import { EmptyState } from '@/components/ui/States';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function KnownIssuesPage() {
  const supabase = createServerSupabaseClient();
  const { data: issues } = await supabase
    .from('issues')
    .select('public_id, title, username, created_at, status, priority, is_known_issue')
    .eq('is_deleted', false)
    .eq('is_known_issue', true)
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size={44} withText={false} href={null} className="mb-4" />
        <h1 className="text-xl font-medium text-charcoal-50">Known Issues</h1>
        <p className="mt-2 max-w-lg text-sm text-charcoal-400">
          Confirmed problems the team is already aware of. Check here before submitting a new report to avoid duplicates.
        </p>
      </div>

      {issues && issues.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {issues.map((i) => (
            <PostCard key={i.public_id} post={{ ...i, type: 'issue' }} />
          ))}
        </div>
      ) : (
        <EmptyState title="No known issues right now" description="If you've found a bug, please report it." />
      )}
    </div>
  );
}

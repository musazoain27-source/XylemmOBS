import Logo from '@/components/Logo';
import FaqAccordion, { type FaqEntry } from '@/components/FaqAccordion';
import { EmptyState } from '@/components/ui/States';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { CATEGORY_LABELS } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function FaqPage() {
  const supabase = createServerSupabaseClient();

  const { data: questions } = await supabase
    .from('questions')
    .select('id, title, category, created_at')
    .eq('is_deleted', false)
    .eq('status', 'answered')
    .order('created_at', { ascending: true });

  let entries: FaqEntry[] = [];

  if (questions && questions.length > 0) {
    const { data: replies } = await supabase
      .from('replies')
      .select('question_id, body, is_official, created_at')
      .in('question_id', questions.map((q) => q.id))
      .eq('is_official', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    entries = questions.reduce<FaqEntry[]>((acc, q) => {
      const officialReply = replies?.find((r) => r.question_id === q.id);
      if (officialReply) {
        acc.push({ id: q.id, question: q.title, answer: officialReply.body, category: q.category });
      }
      return acc;
    }, []);
  }

  const grouped = entries.reduce<Record<string, FaqEntry[]>>((acc, entry) => {
    const key = entry.category ?? 'other';
    acc[key] = acc[key] ?? [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="mb-10 flex flex-col items-center text-center">
        <Logo size={44} withText={false} href={null} glow className="mb-4" />
        <h1 className="text-2xl font-medium text-charcoal-50">Frequently Asked Questions</h1>
        <p className="mt-2 max-w-lg text-sm text-charcoal-400">
          Answers the XylemmOBS team has already given. Check here before asking a new question.
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyState title="No FAQs yet" description="Answered questions will show up here automatically." />
      ) : (
        <div className="space-y-10">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-charcoal-500">
                {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ?? category}
              </h2>
              <FaqAccordion items={items} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

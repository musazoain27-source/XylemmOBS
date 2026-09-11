import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import StatusBadge from '@/components/StatusBadge';
import PriorityBadge from '@/components/PriorityBadge';
import { CategoryBadge, PostTypeBadge, KnownIssueBadge } from '@/components/Badges';
import ReplyThread from '@/components/ReplyThread';
import { formatDateTime, timeAgo, formatBytes } from '@/lib/utils';
import { getCurrentProfile } from '@/lib/supabase/server';
import type { PostType } from '@/types/database';

export const dynamic = 'force-dynamic';

function detectType(publicId: string): PostType | null {
  if (/^XOBS-Q-\d+$/i.test(publicId)) return 'question';
  if (/^XOBS-F-\d+$/i.test(publicId)) return 'feature_request';
  if (/^XOBS-\d+$/i.test(publicId)) return 'issue';
  return null;
}

export default async function PostPage({ params }: { params: { publicId: string } }) {
  const type = detectType(params.publicId);
  if (!type) notFound();

  const supabase = createServerSupabaseClient();
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === 'admin';

  if (type === 'question') {
    const { data: question } = await supabase.from('questions').select('*').eq('public_id', params.publicId).eq('is_deleted', false).single();
    if (!question) notFound();
    const { data: replies } = await supabase.from('replies').select('*').eq('question_id', question.id).eq('is_deleted', false).order('created_at', { ascending: true });

    return (
      <PostShell type="question" publicId={question.public_id} title={question.title} status={question.status} category={question.category}
        username={question.username} createdAt={question.created_at} updatedAt={question.updated_at}>
        <Field label="Full Question">{question.details}</Field>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MiniField label="Minecraft Version" value={question.minecraft_version} />
          <MiniField label="XylemmOBS Version" value={question.xylemmobs_version} />
        </div>
        <ReplyThread postType="question" postId={question.id} initialReplies={replies ?? []} />
      </PostShell>
    );
  }

  if (type === 'feature_request') {
    const { data: feature } = await supabase.from('feature_requests').select('*').eq('public_id', params.publicId).eq('is_deleted', false).single();
    if (!feature) notFound();
    const { data: replies } = await supabase.from('replies').select('*').eq('feature_request_id', feature.id).eq('is_deleted', false).order('created_at', { ascending: true });

    return (
      <PostShell type="feature_request" publicId={feature.public_id} title={feature.title} status={feature.status} category={feature.category}
        username={feature.username} createdAt={feature.created_at} updatedAt={feature.updated_at} upvotes={feature.upvote_count}>
        <Field label="Description">{feature.description}</Field>
        <Field label="Why would this be useful?">{feature.usefulness}</Field>
        <MiniField label="XylemmOBS Version" value={feature.xylemmobs_version} />
        <ReplyThread postType="feature_request" postId={feature.id} initialReplies={replies ?? []} />
      </PostShell>
    );
  }

  // issue
  const { data: issue } = await supabase.from('issues').select('*').eq('public_id', params.publicId).eq('is_deleted', false).single();
  if (!issue) notFound();

  const [{ data: replies }, { data: attachments }, duplicateOf] = await Promise.all([
    supabase.from('replies').select('*').eq('issue_id', issue.id).eq('is_deleted', false).order('created_at', { ascending: true }),
    supabase.from('attachments').select('*').eq('issue_id', issue.id),
    issue.is_duplicate_of
      ? supabase.from('issues').select('public_id, title').eq('id', issue.is_duplicate_of).single().then((r) => r.data)
      : Promise.resolve(null),
  ]);

  const screenshots = (attachments ?? []).filter((a) => a.kind === 'screenshot');
  const logs = (attachments ?? []).filter((a) => a.kind === 'log');

  const screenshotUrls = screenshots.map((s) => {
    const { data } = supabase.storage.from('screenshots').getPublicUrl(s.storage_path);
    return { ...s, url: data.publicUrl };
  });

  return (
    <PostShell type="issue" publicId={issue.public_id} title={issue.title} status={issue.status} priority={issue.priority}
      username={issue.username} createdAt={issue.created_at} updatedAt={issue.updated_at} isKnownIssue={issue.is_known_issue}>
      {duplicateOf && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          Duplicate of{' '}
          <Link href={`/post/${duplicateOf.public_id}`} className="font-semibold underline">
            {duplicateOf.public_id} — {duplicateOf.title}
          </Link>
        </p>
      )}

      <Field label="Description">{issue.description}</Field>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <MiniField label="Minecraft Version" value={issue.minecraft_version} />
        <MiniField label="XylemmOBS Version" value={issue.xylemmobs_version} />
        <MiniField label="Operating System" value={issue.operating_system} />
        <MiniField label="GPU" value={issue.gpu} />
        {issue.cpu && <MiniField label="CPU" value={issue.cpu} />}
      </div>

      {issue.error_message && (
        <Field label="Error Message">
          <pre className="whitespace-pre-wrap break-words rounded-lg bg-black p-3 font-mono text-xs text-ember-300">{issue.error_message}</pre>
        </Field>
      )}

      <Field label="Steps to Reproduce"><span className="whitespace-pre-wrap">{issue.steps_to_reproduce}</span></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Expected Result">{issue.expected_result}</Field>
        <Field label="Actual Result">{issue.actual_result}</Field>
      </div>

      {screenshotUrls.length > 0 && (
        <Field label="Screenshots">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {screenshotUrls.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-charcoal-700">
                <Image src={s.url} alt={s.file_name} width={300} height={200} className="h-32 w-full object-cover" unoptimized />
              </a>
            ))}
          </div>
        </Field>
      )}

      {logs.length > 0 && (
        <Field label="Log Files">
          {isAdmin ? (
            <ul className="space-y-1.5">
              {logs.map((l) => (
                <li key={l.id} className="flex items-center justify-between rounded-md bg-charcoal-900 px-3 py-2 text-sm">
                  <span className="text-charcoal-300">{l.file_name}</span>
                  <span className="text-xs text-charcoal-500">{formatBytes(l.file_size)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-charcoal-500">
              {logs.length} log file{logs.length === 1 ? '' : 's'} attached — visible to the XylemmOBS team only.
            </p>
          )}
        </Field>
      )}

      <ReplyThread postType="issue" postId={issue.id} initialReplies={replies ?? []} />
    </PostShell>
  );
}

function PostShell({
  type, publicId, title, status, priority, category, username, createdAt, updatedAt, isKnownIssue, upvotes, children,
}: {
  type: PostType; publicId: string; title: string; status: string; priority?: string; category?: string;
  username: string; createdAt: string; updatedAt: string; isKnownIssue?: boolean; upvotes?: number; children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link href="/browse" className="mb-6 inline-flex items-center gap-1 text-sm text-charcoal-400 hover:text-moss-400">
        &larr; Back to Browse
      </Link>

      <div className="card p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <PostTypeBadge type={type} />
          <StatusBadge status={status} />
          {priority && <PriorityBadge priority={priority as any} />}
          {isKnownIssue && <KnownIssueBadge />}
          {category && <CategoryBadge category={category as any} />}
        </div>

        <h1 className="text-xl font-bold text-charcoal-50 sm:text-2xl">{title}</h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-charcoal-500">
          <span className="font-mono text-charcoal-400">{publicId}</span>
          <span>&middot;</span>
          <span>by {username}</span>
          <span>&middot;</span>
          <span title={formatDateTime(createdAt)}>Submitted {timeAgo(createdAt)}</span>
          {updatedAt !== createdAt && (
            <>
              <span>&middot;</span>
              <span title={formatDateTime(updatedAt)}>Updated {timeAgo(updatedAt)}</span>
            </>
          )}
          {typeof upvotes === 'number' && (
            <>
              <span>&middot;</span>
              <span>▲ {upvotes} upvotes</span>
            </>
          )}
        </div>

        <div className="mt-6 space-y-6">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="label">{label}</p>
      <div className="text-sm leading-relaxed text-charcoal-300">{children}</div>
    </div>
  );
}

function MiniField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-charcoal-800 bg-charcoal-900/50 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wide text-charcoal-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-charcoal-200">{value}</p>
    </div>
  );
}

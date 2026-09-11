import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import { CategoryBadge, PostTypeBadge, KnownIssueBadge } from '@/components/Badges';
import PriorityBadge from '@/components/PriorityBadge';
import { timeAgo } from '@/lib/utils';
import type { CategoryType, IssuePriority, PostType } from '@/types/database';

export interface PostCardData {
  public_id: string;
  title: string;
  username: string;
  created_at: string;
  status: string;
  category?: CategoryType;
  priority?: IssuePriority;
  is_known_issue?: boolean;
  reply_count?: number;
  upvote_count?: number;
  type: PostType;
}

export default function PostCard({ post }: { post: PostCardData }) {
  return (
    <Link
      href={`/post/${post.public_id}`}
      className="card group flex flex-col gap-3 p-4 transition-all hover:border-moss-600/60 hover:bg-charcoal-900 sm:p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <PostTypeBadge type={post.type} />
        <StatusBadge status={post.status} />
        {post.priority && <PriorityBadge priority={post.priority} />}
        {post.is_known_issue && <KnownIssueBadge />}
        {post.category && <CategoryBadge category={post.category} />}
      </div>

      <h3 className="font-semibold leading-snug text-charcoal-50 transition-colors group-hover:text-moss-300">
        {post.title}
      </h3>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-charcoal-500">
        <span className="font-mono text-charcoal-400">{post.public_id}</span>
        <div className="flex items-center gap-3">
          <span>by {post.username}</span>
          <span>&middot;</span>
          <span>{timeAgo(post.created_at)}</span>
          {typeof post.reply_count === 'number' && (
            <>
              <span>&middot;</span>
              <span>{post.reply_count} {post.reply_count === 1 ? 'reply' : 'replies'}</span>
            </>
          )}
          {typeof post.upvote_count === 'number' && (
            <>
              <span>&middot;</span>
              <span>▲ {post.upvote_count}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}

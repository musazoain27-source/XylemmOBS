'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Logo from '@/components/Logo';
import SearchFilters, { type BrowseFilters } from '@/components/SearchFilters';
import PostCard, { type PostCardData } from '@/components/PostCard';
import Pagination from '@/components/Pagination';
import { ListSkeleton } from '@/components/ui/States';
import { EmptyState } from '@/components/ui/States';
import type { PostType } from '@/types/database';

const PAGE_SIZE = 12;

const STATUS_MAP: Record<string, { question?: string; issue?: string; feature_request?: string }> = {
  open: { issue: 'open' },
  answered: { question: 'answered' },
  in_review: { issue: 'in_review' },
  fixed: { issue: 'fixed' },
  closed: { question: 'closed', issue: 'closed' },
};

export default function BrowsePage() {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<BrowseFilters>({
    search: '',
    type: (searchParams.get('type') as PostType | 'all') ?? 'all',
    status: (searchParams.get('status') as BrowseFilters['status']) ?? 'all',
    category: 'all',
  });
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const statusFor = STATUS_MAP[filters.status] ?? {};

      const requests: Promise<PostCardData[]>[] = [];

      if (filters.type === 'all' || filters.type === 'question') {
        requests.push(
          fetchList('questions', filters, statusFor.question).then((rows) =>
            rows.map((r: any) => ({ ...r, type: 'question' as PostType }))
          )
        );
      }
      if (filters.type === 'all' || filters.type === 'issue') {
        requests.push(
          fetchList('issues', filters, statusFor.issue).then((rows) =>
            rows.map((r: any) => ({ ...r, type: 'issue' as PostType }))
          )
        );
      }
      if (filters.type === 'all' || filters.type === 'feature_request') {
        requests.push(
          fetchList('features', filters, statusFor.feature_request).then((rows) =>
            rows.map((r: any) => ({ ...r, type: 'feature_request' as PostType }))
          )
        );
      }

      const results = (await Promise.all(requests)).flat();
      results.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setPosts(results);
      setLoading(false);
      setPage(1);
    }
    load();
  }, [filters]);

  const paged = useMemo(() => posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [posts, page]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo size={44} withText={false} href={null} className="mb-4" />
        <h1 className="text-xl font-medium text-charcoal-50">Browse Questions & Issues</h1>
        <p className="mt-2 text-sm text-charcoal-400">Search everything the community has submitted.</p>
      </div>

      <div className="mb-6">
        <SearchFilters filters={filters} onChange={setFilters} />
      </div>

      {loading ? (
        <ListSkeleton count={6} />
      ) : posts.length === 0 ? (
        <EmptyState title="Nothing matches those filters" description="Try clearing a filter or searching a different term." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paged.map((post) => (
              <PostCard key={`${post.type}-${post.public_id}`} post={post} />
            ))}
          </div>
          <Pagination page={page} pageSize={PAGE_SIZE} total={posts.length} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}

async function fetchList(endpoint: 'questions' | 'issues' | 'features', filters: BrowseFilters, statusOverride?: string) {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category !== 'all' && endpoint !== 'issues') params.set('category', filters.category);
  if (statusOverride) params.set('status', statusOverride);
  params.set('pageSize', '50');

  const res = await fetch(`/api/${endpoint}?${params.toString()}`);
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

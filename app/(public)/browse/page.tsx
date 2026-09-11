import { Suspense } from 'react';
import BrowseClient from './BrowseClient';
import { ListSkeleton } from '@/components/ui/States';

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-12 sm:px-6"><ListSkeleton count={6} /></div>}>
      <BrowseClient />
    </Suspense>
  );
}

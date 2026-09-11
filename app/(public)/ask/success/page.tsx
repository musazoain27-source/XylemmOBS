import { redirect } from 'next/navigation';
import SubmissionSuccess from '@/components/SubmissionSuccess';

export default function AskSuccessPage({ searchParams }: { searchParams: { id?: string } }) {
  if (!searchParams.id) redirect('/ask');
  return <SubmissionSuccess id={searchParams.id} title="Question Submitted" browseHref="/browse?type=question" />;
}

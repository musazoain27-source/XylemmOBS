import { redirect } from 'next/navigation';
import SubmissionSuccess from '@/components/SubmissionSuccess';

export default function ReportSuccessPage({ searchParams }: { searchParams: { id?: string } }) {
  if (!searchParams.id) redirect('/report');
  return <SubmissionSuccess id={searchParams.id} title="Issue Reported" browseHref="/browse?type=issue" />;
}

import { SubmissionForm } from '@/components/submission-form';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  return (
    <SubmissionForm
      initialKind={params.type === 'question' ? 'question' : 'issue'}
    />
  );
}

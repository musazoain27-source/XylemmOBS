import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// Log files live in a private ("logs") bucket — there is no public URL
// for them. This route is the only way to read one back out, and it
// requires an authenticated admin session. The signed URL it returns
// is short-lived (5 minutes) rather than a permanent public link.
export async function GET(_req: NextRequest, { params }: { params: { attachmentId: string } }) {
  const profile = await requireAdmin();
  if (!profile) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const admin = createAdminClient();
  const { data: attachment } = await admin
    .from('attachments')
    .select('*')
    .eq('id', params.attachmentId)
    .single();

  if (!attachment) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const bucket = attachment.kind === 'log' ? 'logs' : 'screenshots';
  const { data, error } = await admin.storage.from(bucket).createSignedUrl(attachment.storage_path, 300);

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Could not sign URL' }, { status: 400 });

  return NextResponse.json({ data: { url: data.signedUrl } });
}

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_LOG_TYPES,
  MAX_ATTACHMENTS_PER_ISSUE,
  MAX_IMAGE_BYTES,
  MAX_LOG_BYTES,
} from '@/lib/validation';

function safeFileName(originalName: string): string {
  const parts = originalName.split('.');
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8) : '';
  const base = crypto.randomUUID();
  return ext ? `${base}.${ext}` : base;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file');
  const issueId = formData.get('issueId');
  const kind = formData.get('kind'); // 'screenshot' | 'log'

  if (!(file instanceof File) || typeof issueId !== 'string' || (kind !== 'screenshot' && kind !== 'log')) {
    return NextResponse.json({ error: 'Invalid upload payload' }, { status: 422 });
  }

  // Confirm the issue actually exists using the request-scoped client
  // (respects RLS — this alone proves nothing about admin status, we
  // just need to know the row is real before attaching a file to it).
  const supabase = createServerSupabaseClient();
  const { data: issue } = await supabase.from('issues').select('id').eq('id', issueId).single();
  if (!issue) return NextResponse.json({ error: 'Issue not found' }, { status: 404 });

  const admin = createAdminClient();
  const { count } = await admin
    .from('attachments')
    .select('id', { count: 'exact', head: true })
    .eq('issue_id', issueId);
  if ((count ?? 0) >= MAX_ATTACHMENTS_PER_ISSUE) {
    return NextResponse.json({ error: `Maximum ${MAX_ATTACHMENTS_PER_ISSUE} attachments per issue` }, { status: 422 });
  }

  const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
  const isLog = ALLOWED_LOG_TYPES.includes(file.type) || file.name.toLowerCase().endsWith('.log') || file.name.toLowerCase().endsWith('.txt');

  if (kind === 'screenshot' && !isImage) {
    return NextResponse.json({ error: 'Screenshots must be PNG, JPEG, WEBP, or GIF' }, { status: 422 });
  }
  if (kind === 'log' && !isLog) {
    return NextResponse.json({ error: 'Log files must be a .log or .txt plain-text file' }, { status: 422 });
  }

  const maxBytes = kind === 'screenshot' ? MAX_IMAGE_BYTES : MAX_LOG_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: `File exceeds the ${Math.round(maxBytes / (1024 * 1024))}MB limit` }, { status: 422 });
  }

  const bucket = kind === 'screenshot' ? 'screenshots' : 'logs';
  const generatedName = safeFileName(file.name);
  const storagePath = `${issueId}/${generatedName}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await admin.storage
    .from(bucket)
    .upload(storagePath, Buffer.from(arrayBuffer), {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 400 });

  const { data: attachment, error: insertError } = await admin
    .from('attachments')
    .insert({
      issue_id: issueId,
      file_name: file.name.slice(0, 200),
      storage_path: storagePath,
      mime_type: file.type || 'application/octet-stream',
      file_size: file.size,
      kind,
    })
    .select('*')
    .single();

  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  return NextResponse.json({ data: attachment }, { status: 201 });
}

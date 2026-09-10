import { env } from 'cloudflare:workers';
import { getDb } from '@/db';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { isAdminEmail, RequestError } from './validation';
export const noStore = {
  'Cache-Control': 'no-store',
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
};
export function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: noStore });
}
export function failure(error: unknown) {
  if (error instanceof RequestError)
    return json({ error: error.message }, error.status);
  console.error('Support request failed');
  return json(
    {
      error:
        'Support is temporarily unavailable. Your draft is still here; please try again.',
    },
    503,
  );
}
export async function adminUser() {
  const user = await getChatGPTUser();
  return user && isAdminEmail(user.email, env.ADMIN_EMAIL) ? user : null;
}
export async function requireAdmin() {
  if (!(await adminUser()))
    throw new RequestError('Only the site owner can access this inbox.', 403);
}
export async function hash(value: string) {
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(bytes)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
export async function rateLimit(
  request: Request,
  action: string,
  limit: number,
) {
  const db = getDb();
  const now = Date.now();
  const bucket = Math.floor(now / 3600000);
  const ip = request.headers.get('cf-connecting-ip') ?? 'local';
  const key = await hash(
    `${env.RATE_LIMIT_SALT ?? 'local-only'}:${action}:${bucket}:${ip}`,
  );
  const row = await db
    .prepare(
      'INSERT INTO rate_limits (key, count, expires_at) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = count + 1 RETURNING count',
    )
    .bind(key, (bucket + 2) * 3600000)
    .first<{ count: number }>();
  if (!row || row.count > limit)
    throw new RequestError(
      'Too many requests. Please try again in an hour.',
      429,
    );
  await db
    .prepare('DELETE FROM rate_limits WHERE expires_at < ?')
    .bind(now)
    .run();
}
export const ticketColumns =
  'id, kind, title, body, mod_version AS modVersion, minecraft, gpu, settings, status, reply, created_at AS createdAt, updated_at AS updatedAt';

import { getDb } from '@/db';
import { failure, json, requireAdmin } from '@/lib/support-server';
import { statuses, RequestError } from '@/lib/validation';
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const url = new URL(request.url);
    const status = url.searchParams.get('status') ?? 'all';
    const offset = Number(url.searchParams.get('offset') ?? 0);
    if (
      status !== 'all' &&
      !statuses.includes(status as (typeof statuses)[number])
    )
      throw new RequestError('Invalid status.');
    if (!Number.isSafeInteger(offset) || offset < 0 || offset > 1000000)
      throw new RequestError('Invalid page.');
    const where = status === 'all' ? '' : ' WHERE status = ?';
    const binds = status === 'all' ? [] : [status];
    const db = getDb();
    const rows = await db
      .prepare(
        'SELECT id,kind,title,status,created_at AS createdAt,updated_at AS updatedAt FROM tickets' +
          where +
          ' ORDER BY created_at DESC LIMIT 31 OFFSET ?',
      )
      .bind(...binds, offset)
      .all();
    const counts = await db
      .prepare('SELECT status, COUNT(*) AS count FROM tickets GROUP BY status')
      .all();
    return json({
      tickets: rows.results.slice(0, 30),
      hasMore: rows.results.length > 30,
      counts: counts.results,
    });
  } catch (error) {
    return failure(error);
  }
}

import { getDb } from '@/db';
import {
  failure,
  json,
  requireAdmin,
  ticketColumns,
} from '@/lib/support-server';
import { readBody, validateReply, RequestError } from '@/lib/validation';
async function identifier(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[a-f0-9-]{36}$/.test(id))
    throw new RequestError('Invalid report.', 404);
  return id;
}
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const id = await identifier(context);
    const ticket = await getDb()
      .prepare('SELECT ' + ticketColumns + ' FROM tickets WHERE id = ?')
      .bind(id)
      .first();
    if (!ticket) throw new RequestError('Report not found.', 404);
    return json({ ticket });
  } catch (error) {
    return failure(error);
  }
}
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const id = await identifier(context);
    const data = validateReply(await readBody(request));
    const db = getDb();
    const updatedAt = Math.max(Date.now(), data.updatedAt + 1);
    const result = await db
      .prepare(
        'UPDATE tickets SET status = ?, reply = ?, updated_at = ? WHERE id = ? AND updated_at = ?',
      )
      .bind(data.status, data.reply, updatedAt, id, data.updatedAt)
      .run();
    if (result.meta.changes !== 1)
      throw new RequestError(
        'This report changed in another tab. Reload it before saving.',
        409,
      );
    return json({
      ticket: await db
        .prepare('SELECT ' + ticketColumns + ' FROM tickets WHERE id = ?')
        .bind(id)
        .first(),
    });
  } catch (error) {
    return failure(error);
  }
}

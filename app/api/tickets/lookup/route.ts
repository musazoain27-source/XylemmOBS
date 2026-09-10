import { getDb } from '@/db';
import { object, readBody, validToken, RequestError } from '@/lib/validation';
import {
  failure,
  hash,
  json,
  rateLimit,
  ticketColumns,
} from '@/lib/support-server';
export async function POST(request: Request) {
  try {
    const data = object(await readBody(request));
    const token = validToken(data.token);
    await rateLimit(request, 'lookup', 120);
    const ticket = await getDb()
      .prepare('SELECT ' + ticketColumns + ' FROM tickets WHERE token_hash = ?')
      .bind(await hash(token))
      .first();
    if (!ticket)
      throw new RequestError(
        'No report matches that access key. Check the full private link.',
        404,
      );
    return json({ ticket });
  } catch (error) {
    return failure(error);
  }
}

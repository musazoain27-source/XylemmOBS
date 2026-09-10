import { getDb } from '@/db';
import { readBody, validateSubmission } from '@/lib/validation';
import { failure, hash, json, rateLimit } from '@/lib/support-server';
export async function POST(request: Request) {
  try {
    const data = validateSubmission(await readBody(request));
    const tokenHash = await hash(data.token);
    const db = getDb();
    const existing = await db
      .prepare('SELECT id FROM tickets WHERE token_hash = ?')
      .bind(tokenHash)
      .first<{ id: string }>();
    if (existing) return json({ id: existing.id });
    await rateLimit(request, 'submit', 8);
    const id = crypto.randomUUID();
    const now = Date.now();
    await db
      .prepare(
        'INSERT INTO tickets (id,token_hash,kind,title,body,mod_version,minecraft,gpu,settings,status,reply,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(token_hash) DO NOTHING',
      )
      .bind(
        id,
        tokenHash,
        data.kind,
        data.title,
        data.body,
        data.modVersion,
        data.minecraft,
        data.gpu,
        data.settings,
        'open',
        '',
        now,
        now,
      )
      .run();
    const saved = await db
      .prepare('SELECT id FROM tickets WHERE token_hash = ?')
      .bind(tokenHash)
      .first<{ id: string }>();
    return json({ id: saved!.id }, 201);
  } catch (error) {
    return failure(error);
  }
}

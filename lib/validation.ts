export class RequestError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export const statuses = [
  'open',
  'investigating',
  'answered',
  'resolved',
] as const;
export function isAdminEmail(
  viewer: string | null | undefined,
  allowed: string | null | undefined,
) {
  return (
    !!allowed?.trim() &&
    !!viewer &&
    viewer.trim().toLowerCase() === allowed.trim().toLowerCase()
  );
}
export function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new RequestError('Invalid form data.');
  return value as Record<string, unknown>;
}
function field(value: unknown, label: string, max: number, min = 0) {
  if (typeof value !== 'string')
    throw new RequestError(`Check the ${label} field.`);
  const clean = value.trim();
  if (clean.length < min || clean.length > max)
    throw new RequestError(`${label} must contain ${min}–${max} characters.`);
  return clean;
}
export function validToken(value: unknown): string {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/.test(value))
    throw new RequestError('Enter a valid private report link or access key.');
  return value;
}
export function validateSubmission(input: unknown) {
  const data = object(input);
  if (data.website) throw new RequestError('Unable to submit this form.');
  if (data.kind !== 'question' && data.kind !== 'issue')
    throw new RequestError('Choose a question or issue.');
  return {
    token: validToken(data.token),
    kind: data.kind,
    title: field(data.title, 'Subject', 160, 5),
    body: field(data.body, 'Details', 6000, 20),
    modVersion: field(
      data.modVersion ?? '',
      'Recorder version',
      40,
      data.kind === 'issue' ? 1 : 0,
    ),
    minecraft: field(
      data.minecraft ?? '',
      'Minecraft version',
      40,
      data.kind === 'issue' ? 1 : 0,
    ),
    gpu: field(data.gpu ?? '', 'GPU', 140),
    settings: field(data.settings ?? '', 'Recording settings', 200),
  };
}
export function validateReply(input: unknown) {
  const data = object(input);
  if (!statuses.includes(data.status as (typeof statuses)[number]))
    throw new RequestError('Choose a valid status.');
  const reply = field(data.reply, 'Reply', 6000);
  if (data.status === 'answered' && !reply)
    throw new RequestError('Write a reply before marking this answered.');
  if (
    typeof data.updatedAt !== 'number' ||
    !Number.isSafeInteger(data.updatedAt)
  )
    throw new RequestError('Reload this report before saving.');
  return { status: data.status as string, reply, updatedAt: data.updatedAt };
}
export function validateWriteOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin)
    throw new RequestError('Please submit from this website.', 403);
  if (
    !request.headers
      .get('content-type')
      ?.toLowerCase()
      .startsWith('application/json')
  )
    throw new RequestError('Send JSON form data.', 415);
}
export async function readBody(request: Request) {
  validateWriteOrigin(request);
  const reader = request.body?.getReader();
  if (!reader) throw new RequestError('Empty form.');
  const chunks: Uint8Array[] = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 32768) {
      await reader.cancel();
      throw new RequestError('The report is too long.', 413);
    }
    chunks.push(value);
  }
  const all = new Uint8Array(length);
  let position = 0;
  for (const chunk of chunks) {
    all.set(chunk, position);
    position += chunk.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(all));
  } catch {
    throw new RequestError('Invalid form data.');
  }
}

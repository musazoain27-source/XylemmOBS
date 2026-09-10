export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const requestHeaders = new Headers(options.headers);
  if (!requestHeaders.has('Content-Type'))
    requestHeaders.set('Content-Type', 'application/json');
  let response: Response;
  try {
    response = await fetch(path, {
      ...options,
      headers: requestHeaders,
      cache: 'no-store',
    });
  } catch {
    throw new Error('Could not connect. Check your connection and try again.');
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Support is temporarily unavailable. Please try again.');
  }
  if (!response.ok)
    throw new Error(
      data &&
        typeof data === 'object' &&
        'error' in data &&
        typeof data.error === 'string'
        ? data.error
        : 'Something went wrong. Please try again.',
    );
  return data as T;
}
export function createToken() {
  return [...crypto.getRandomValues(new Uint8Array(32))]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
export function errorText(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Something went wrong. Please try again.';
}
export function dateLabel(value: number) {
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

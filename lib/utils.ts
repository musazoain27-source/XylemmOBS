import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

export function timeAgo(iso: string) {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [60, 'second'], [60, 'minute'], [24, 'hour'], [7, 'day'], [4.345, 'week'], [12, 'month'], [Number.POSITIVE_INFINITY, 'year'],
  ];
  let value = seconds;
  let unitName = 'second';
  for (const [amount, name] of units) {
    if (value < amount) { unitName = name; break; }
    value = Math.floor(value / amount);
    unitName = name;
  }
  if (unitName === 'second' && value < 5) return 'just now';
  return `${value} ${unitName}${value === 1 ? '' : 's'} ago`;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Produces a semi-stable per-browser fingerprint used only to make
 * obvious duplicate votes harder (not a security boundary — a
 * determined user can always clear storage). Combined with the
 * unique(feature_request_id, voter_fingerprint) DB constraint.
 */
export function getVoterFingerprint(): string {
  const key = 'xobs_voter_id';
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export function safeFileName(originalName: string): string {
  const ext = originalName.includes('.') ? originalName.split('.').pop() : '';
  const base = crypto.randomUUID();
  return ext ? `${base}.${ext.toLowerCase().replace(/[^a-z0-9]/g, '')}` : base;
}

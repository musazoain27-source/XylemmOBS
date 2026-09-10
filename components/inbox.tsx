'use client';

import { useEffect, useState, useCallback } from 'react';
import { Inbox as InboxIcon, RefreshCw, Save, ShieldCheck } from 'lucide-react';
import { SiteShell } from './site-shell';
import { TicketView } from './ticket-view';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { Badge } from '@/components/ui/badge';
import { api, dateLabel, errorText } from '@/lib/client-api';
import { statuses } from '@/lib/validation';
import { reference, type Ticket } from '@/lib/types';
type Summary = Pick<
  Ticket,
  'id' | 'kind' | 'title' | 'status' | 'createdAt' | 'updatedAt'
>;
export function Inbox() {
  const [filter, setFilter] = useState('all');
  const [offset, setOffset] = useState(0);
  const [tickets, setTickets] = useState<Summary[]>([]);
  const [counts, setCounts] = useState<{ status: string; count: number }[]>([]);
  const [more, setMore] = useState(false);
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('open');
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const refresh = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError('');
      try {
        const data = await api<{
          tickets: Summary[];
          counts: { status: string; count: number }[];
          hasMore: boolean;
        }>('/api/inbox?status=' + filter + '&offset=' + offset, { signal });
        if (signal?.aborted) return;
        setTickets(data.tickets);
        setCounts(data.counts);
        setMore(data.hasMore);
      } catch (err) {
        if (!signal?.aborted) setError(errorText(err));
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [filter, offset],
  );
  useEffect(() => {
    const controller = new AbortController();
    // oxlint-disable-next-line react/react-compiler -- Fetch lifecycle also updates the visible loading indicator.
    void refresh(controller.signal);
    return () => controller.abort();
  }, [refresh]);
  async function open(id: string) {
    setDetailLoading(true);
    setError('');
    setNotice('');
    setSelected(null);
    try {
      const data = await api<{ ticket: Ticket }>('/api/inbox/' + id);
      setSelected(data.ticket);
      setReply(data.ticket.reply);
      setStatus(data.ticket.status);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setDetailLoading(false);
    }
  }
  async function save(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || saving) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const data = await api<{ ticket: Ticket }>('/api/inbox/' + selected.id, {
        method: 'PATCH',
        body: JSON.stringify({ reply, status, updatedAt: selected.updatedAt }),
      });
      setSelected(data.ticket);
      setReply(data.ticket.reply);
      setStatus(data.ticket.status);
      setNotice(
        'Saved. The visitor can see this update through their private link.',
      );
      await refresh();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSaving(false);
    }
  }
  return (
    <SiteShell>
      <div className="inbox-heading">
        <div>
          <div className="eyebrow">
            <ShieldCheck size={14} /> OWNER ACCESS
          </div>
          <h1>Your support inbox.</h1>
          <p className="lead">
            Private questions. Clear answers. Better recordings.
          </p>
        </div>
        {/* oxlint-disable-next-line nextjs/no-html-link-for-pages -- Sites sign-out requires top-level navigation. */}
        <a
          href="/signout-with-chatgpt?return_to=%2F"
          target="_top"
          className="text-link"
        >
          Sign out
        </a>
      </div>
      <div className="inbox-stats">
        {statuses.map((s) => (
          <div key={s}>
            <span>{s}</span>
            <strong>{counts.find((c) => c.status === s)?.count ?? 0}</strong>
          </div>
        ))}
      </div>
      {error && (
        <p className="error-box" role="alert">
          {error}
        </p>
      )}
      {notice && <output className="success-box">{notice}</output>}
      <div className="inbox-grid">
        <section className="inbox-list">
          <div className="inbox-toolbar">
            <NativeSelect
              aria-label="Filter inbox by status"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setOffset(0);
              }}
            >
              <NativeSelectOption value="all">All messages</NativeSelectOption>
              {statuses.map((s) => (
                <NativeSelectOption key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            <Button
              aria-label="Refresh inbox"
              variant="ghost"
              disabled={loading}
              onClick={() => refresh()}
            >
              <RefreshCw size={17} />
            </Button>
          </div>
          {loading ? (
            <output className="list-message">Loading messages…</output>
          ) : tickets.length ? (
            tickets.map((t) => (
              <Button
                variant="ghost"
                className={
                  'inbox-item ' + (selected?.id === t.id ? 'selected' : '')
                }
                key={t.id}
                disabled={saving || detailLoading}
                onClick={() => open(t.id)}
              >
                <div>
                  <span>
                    {reference(t.id)} · {t.kind}
                  </span>
                  <Badge className={'status-badge status-' + t.status}>
                    {t.status}
                  </Badge>
                </div>
                <strong>{t.title}</strong>
                <small>{dateLabel(t.createdAt)}</small>
              </Button>
            ))
          ) : (
            <div className="empty-state">
              <InboxIcon size={30} />
              <h3>
                {filter === 'all'
                  ? 'Your inbox is clear'
                  : 'No ' + filter + ' messages'}
              </h3>
              <p>Questions and reports will appear here.</p>
            </div>
          )}
          <div className="pagination-row">
            <Button
              variant="outline"
              disabled={offset === 0 || loading}
              onClick={() => setOffset(Math.max(0, offset - 30))}
            >
              Previous
            </Button>
            <span>Page {Math.floor(offset / 30) + 1}</span>
            <Button
              variant="outline"
              disabled={!more || loading}
              onClick={() => setOffset(offset + 30)}
            >
              Next
            </Button>
          </div>
        </section>
        <section className="inbox-detail">
          {detailLoading ? (
            <output className="list-message">Opening report…</output>
          ) : selected ? (
            <>
              <TicketView ticket={selected} />
              <form onSubmit={save} className="reply-form">
                <div className="field">
                  <label htmlFor="reply">Reply to the visitor</label>
                  <Textarea
                    id="reply"
                    value={reply}
                    maxLength={6000}
                    rows={8}
                    onChange={(e) => setReply(e.target.value)}
                    disabled={saving}
                    placeholder="Write a helpful answer. It will appear on their private report page."
                  />
                </div>
                <div className="field">
                  <label htmlFor="status">Status</label>
                  <NativeSelect
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={saving}
                  >
                    {statuses.map((s) => (
                      <NativeSelectOption key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <Button
                  type="submit"
                  disabled={saving}
                  className="action-button"
                >
                  <Save size={16} />
                  {saving ? 'Saving…' : 'Save reply & status'}
                </Button>
                <p className="field-hint">
                  This updates the visitor’s tracking page. It does not send an
                  email.
                </p>
              </form>
            </>
          ) : (
            <div className="empty-state">
              <ShieldCheck size={32} />
              <h3>Select a conversation</h3>
              <p>Read the details, send a reply, or update its status.</p>
            </div>
          )}
        </section>
      </div>
    </SiteShell>
  );
}

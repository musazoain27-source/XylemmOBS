'use client';
import Link from 'next/link';

import { useEffect, useState } from 'react';
import { ArrowLeft, MessageSquare, RefreshCw, ShieldCheck } from 'lucide-react';
import { SiteShell } from './site-shell';
import { TicketView } from './ticket-view';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api, dateLabel, errorText } from '@/lib/client-api';
import { validToken } from '@/lib/validation';
import type { Ticket } from '@/lib/types';
export function Tracker() {
  const [key, setKey] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function lookup(value: string) {
    setBusy(true);
    setError('');
    setTicket(null);
    try {
      const trimmed = value.trim();
      let candidate = trimmed;
      if (trimmed.includes('#'))
        candidate = trimmed.slice(trimmed.lastIndexOf('#') + 1);
      const token = validToken(candidate);
      const result = await api<{ ticket: Ticket }>('/api/tickets/lookup', {
        method: 'POST',
        body: JSON.stringify({ token }),
      });
      setTicket(result.ticket);
      setKey(token);
      window.history.replaceState(null, '', '/track#' + token);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const token = window.location.hash.slice(1);
    if (token) {
      // oxlint-disable-next-line react/react-compiler -- The private fragment is only available after hydration.
      setKey(token);
      void lookup(token);
    }
  }, []);
  return (
    <SiteShell>
      <Link prefetch={false} className="back-link" href="/">
        <ArrowLeft size={16} /> Back to help center
      </Link>
      <section className="form-card tracker-card">
        <span className="section-kicker">YOUR PRIVATE CONVERSATION</span>
        <h1>Check your report.</h1>
        <p className="lead">
          Use the private link or access key from your receipt.
        </p>
        <form
          className="track-form"
          onSubmit={(e) => {
            e.preventDefault();
            void lookup(key);
          }}
        >
          <label className="field-label" htmlFor="tracking-key">
            Private link or access key
          </label>
          <div className="search-wrap">
            <Input
              id="tracking-key"
              required
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste your private report link"
              autoComplete="off"
            />
            <Button type="submit" disabled={busy}>
              {busy ? 'Loading…' : 'Check'}
            </Button>
          </div>
        </form>
        {error && (
          <p className="error-box" role="alert">
            {error}
          </p>
        )}
        {ticket && (
          <div className="tracking-result" aria-live="polite">
            <TicketView ticket={ticket} />
            <div className="reply-block">
              <div className="small-card-title">
                <MessageSquare size={20} />
                <h3>Developer reply</h3>
              </div>
              {ticket.reply ? (
                <>
                  <p className="reply-text">{ticket.reply}</p>
                  <p className="time-label">
                    Updated {dateLabel(ticket.updatedAt)}
                  </p>
                </>
              ) : (
                <p className="waiting-text">
                  No reply yet. Save your link and check back here for an
                  update.
                </p>
              )}
            </div>
            <Button
              variant="outline"
              disabled={busy}
              className="action-button"
              onClick={() => lookup(key)}
            >
              <RefreshCw size={16} />
              Refresh report
            </Button>
          </div>
        )}
        <p className="private-footnote">
          <ShieldCheck size={14} /> Keep your access key private. Your reference
          number alone won’t unlock a report.
        </p>
      </section>
    </SiteShell>
  );
}

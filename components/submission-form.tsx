'use client';
import Link from 'next/link';
import Image from 'next/image';

import { useState, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Download,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import { SiteShell } from './site-shell';
import { api, createToken, errorText } from '@/lib/client-api';
import { reference } from '@/lib/types';
export function SubmissionForm({
  initialKind,
}: {
  initialKind: 'issue' | 'question';
}) {
  const [kind, setKind] = useState(initialKind);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<{ id: string; url: string } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const token = useRef('');
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const values = Object.fromEntries(new FormData(event.currentTarget));
    setError('');
    setBusy(true);
    try {
      token.current ||= createToken();
      const result = await api<{ id: string }>('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({ ...values, kind, token: token.current }),
      });
      setReceipt({
        id: result.id,
        url: window.location.origin + '/track#' + token.current,
      });
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  }
  async function copy() {
    if (!receipt) return;
    try {
      await navigator.clipboard.writeText(receipt.url);
      setCopied(true);
    } catch {
      setError(
        'Copy was unavailable. Select the link below and copy it manually.',
      );
    }
  }
  function download() {
    if (!receipt) return;
    const blob = new Blob(
      [
        'XylemmOBS support\n' +
          reference(receipt.id) +
          '\nPrivate report link: ' +
          receipt.url +
          '\nKeep this link private. Use it to check replies.',
      ],
      { type: 'text/plain' },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = reference(receipt.id) + '.txt';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <SiteShell>
      <Link prefetch={false} className="back-link" href="/">
        <ArrowLeft size={16} /> Back to help center
      </Link>
      {receipt ? (
        <section className="form-card receipt-card" aria-live="polite">
          <div className="success-icon">
            <Check size={28} />
          </div>
          <span className="section-kicker">SAVED TO THE PRIVATE INBOX</span>
          <h1>
            {kind === 'issue' ? 'Report received.' : 'Question received.'}
          </h1>
          <p className="lead">
            Your reference is <strong>{reference(receipt.id)}</strong>. Keep the
            link below to check for a reply.
          </p>
          <div className="callout">
            This link is your access key. Anyone with it can read this
            conversation. It isn’t sent by email.
          </div>
          <label className="field-label" htmlFor="receipt-link">
            Your private tracking link
          </label>
          <Input
            id="receipt-link"
            readOnly
            value={receipt.url}
            onFocus={(e) => e.currentTarget.select()}
          />
          <div className="button-row">
            <Button onClick={copy} className="action-button">
              {copied ? <Check /> : <Copy />}
              {copied ? 'Copied' : 'Copy link'}
            </Button>
            <Button
              variant="outline"
              className="action-button"
              onClick={download}
            >
              <Download />
              Save receipt
            </Button>
            <Link prefetch={false} href={receipt.url} className="text-link">
              View report <ArrowRight size={15} />
            </Link>
          </div>
          {error && (
            <p role="alert" className="error-box">
              {error}
            </p>
          )}
        </section>
      ) : (
        <div className="form-layout">
          <section className="form-card">
            <span className="section-kicker">
              A DIRECT LINE TO THE DEVELOPER
            </span>
            <h1>{kind === 'issue' ? 'Report an issue.' : 'Ask a question.'}</h1>
            <p className="lead">
              {kind === 'issue'
                ? 'Help us understand what went wrong.'
                : 'Let’s help you get the most out of your recorder.'}
            </p>
            <form onSubmit={submit}>
              <fieldset disabled={busy} className="form-fields">
                <div className="field">
                  <label htmlFor="kind">I’d like to</label>
                  <NativeSelect
                    id="kind"
                    value={kind}
                    onChange={(e) => {
                      setKind(e.target.value as 'issue' | 'question');
                      setError('');
                    }}
                  >
                    <NativeSelectOption value="issue">
                      Report an issue
                    </NativeSelectOption>
                    <NativeSelectOption value="question">
                      Ask a question
                    </NativeSelectOption>
                  </NativeSelect>
                </div>
                <div className="field">
                  <label htmlFor="title">
                    Subject <span>required</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    required
                    minLength={5}
                    maxLength={160}
                    placeholder={
                      kind === 'issue'
                        ? 'e.g. Recording stutters while moving'
                        : 'e.g. How do I record my microphone separately?'
                    }
                  />
                </div>
                <div className="field">
                  <label htmlFor="body">
                    {kind === 'issue' ? 'What happened?' : 'Your question'}{' '}
                    <span>required</span>
                  </label>
                  <Textarea
                    id="body"
                    name="body"
                    required
                    minLength={20}
                    maxLength={6000}
                    rows={7}
                    aria-describedby="details-help"
                    placeholder={
                      kind === 'issue'
                        ? 'What did you expect? What happened instead? Include the steps to reproduce it and any error message.'
                        : 'Tell us what you are trying to do and what you have already tried.'
                    }
                  />
                  <p id="details-help" className="field-hint">
                    Please leave out passwords, access tokens and personal
                    information.
                  </p>
                </div>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="modVersion">
                      Recorder version{' '}
                      <span>{kind === 'issue' ? 'required' : 'optional'}</span>
                    </label>
                    <Input
                      id="modVersion"
                      name="modVersion"
                      maxLength={40}
                      required={kind === 'issue'}
                      placeholder="e.g. 0.1.5"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="minecraft">
                      Minecraft version{' '}
                      <span>{kind === 'issue' ? 'required' : 'optional'}</span>
                    </label>
                    <Input
                      id="minecraft"
                      name="minecraft"
                      maxLength={40}
                      required={kind === 'issue'}
                      placeholder="e.g. 1.21.11"
                    />
                  </div>
                </div>
                {kind === 'issue' && (
                  <div className="field-grid">
                    <div className="field">
                      <label htmlFor="gpu">
                        Graphics card <span>optional</span>
                      </label>
                      <Input
                        id="gpu"
                        name="gpu"
                        maxLength={140}
                        placeholder="e.g. Intel UHD Graphics"
                      />
                    </div>
                    <div className="field">
                      <label htmlFor="settings">
                        Recording settings <span>optional</span>
                      </label>
                      <Input
                        id="settings"
                        name="settings"
                        maxLength={200}
                        placeholder="e.g. 1080p, 60 FPS, CFR"
                      />
                    </div>
                  </div>
                )}
                <div className="honeypot" aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input
                    id="website"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                {error && (
                  <p role="alert" className="error-box">
                    {error}
                  </p>
                )}
                <div className="submit-row">
                  <Button
                    type="submit"
                    disabled={busy}
                    className="action-button"
                  >
                    {busy
                      ? 'Sending…'
                      : kind === 'issue'
                        ? 'Send issue report'
                        : 'Send question'}
                    <ArrowRight size={16} />
                  </Button>
                  <span>
                    <ShieldCheck size={14} /> Only you and the developer
                  </span>
                </div>
              </fieldset>
            </form>
            <p className="form-policy">
              Submitting stores your message for support.{' '}
              <Link prefetch={false} href="/privacy">
                How privacy works
              </Link>
            </p>
          </section>
          <aside className="form-help">
            <Image
              unoptimized
              src="/logo.png"
              alt="XylemmOBS"
              width="180"
              height="180"
            />
            <h2>We’re here to help.</h2>
            <p>A little detail goes a long way toward a useful answer.</p>
            <ol>
              <li>
                <strong>Tell us the whole story.</strong>
                <span>Include what you tried and what happened.</span>
              </li>
              <li>
                <strong>Save your private link.</strong>
                <span>You’ll get one as soon as your message is saved.</span>
              </li>
              <li>
                <strong>Come back for a reply.</strong>
                <span>Use that link to see updates from the developer.</span>
              </li>
            </ol>
          </aside>
        </div>
      )}
    </SiteShell>
  );
}

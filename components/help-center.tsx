'use client';
import Link from 'next/link';

import { useState, useCallback } from 'react';
import { SupportTools } from './support-tools';
import {
  ArrowRight,
  Bug,
  ChevronRight,
  CircleHelp,
  Command,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  Video,
  X,
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categories, faqs } from '@/lib/faq';
import { SiteShell } from './site-shell';
export default function HelpCenter() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('All topics');
  const search = useCallback((q: string, c: string) => {
    setQuery(q);
    setCategory(c);
  }, []);
  const filtered = faqs.filter(
    (f) =>
      (category === 'All topics' || f.category === category) &&
      `${f.question} ${f.answer}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <SiteShell>
      <SupportTools search={search} />
      <div className="breadcrumb">
        <span>Support</span>
        <ChevronRight size={14} /> Help center
      </div>
      <section className="intro">
        <div>
          <div className="eyebrow">
            <span className="purple-dot" /> LESS TROUBLESHOOTING. MORE
            RECORDING.
          </div>
          <h1>
            Get back to <span>capturing.</span>
          </h1>
          <p>Answers, fixes, and a direct line to the developer.</p>
        </div>
        <div className="intro-tag">
          <Video size={17} />
          <span>
            Minecraft Java<small>Fabric recorder support</small>
          </span>
        </div>
      </section>
      <div className="support-grid">
        <section className="answers-panel">
          <div className="panel-top">
            <div>
              <span className="section-kicker">THE KNOWLEDGE BASE</span>
              <h2>What can we help with?</h2>
            </div>
            <CircleHelp size={24} className="muted" />
          </div>
          <div className="search-wrap">
            <Search size={20} />
            <Input
              aria-label="Search answers"
              placeholder="Search recording, audio, FPS…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Clear search"
                onClick={() => setQuery('')}
              >
                <X />
              </Button>
            )}
          </div>
          <div className="category-list" aria-label="Filter answers by topic">
            {categories.map((c) => (
              <Button
                key={c}
                variant="ghost"
                className={c === category ? 'category active' : 'category'}
                aria-pressed={c === category}
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>
          <output className="result-label">
            {filtered.length} {filtered.length === 1 ? 'answer' : 'answers'}
            <span>Written for real recording questions</span>
          </output>
          <Accordion defaultValue={['start']} className="faq-list">
            {filtered.map((f, i) => (
              <AccordionItem value={f.id} key={f.id}>
                <AccordionTrigger>
                  <span className="faq-number">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="faq-question">
                    {f.question}
                    <small>{f.category}</small>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p>{f.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {!filtered.length && (
            <div className="empty-state">
              <Search size={30} />
              <h3>No matching answers</h3>
              <p>Try “audio”, “overlay”, or “recording”.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setQuery('');
                  setCategory('All topics');
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
          <div className="answers-bottom">
            <MessageSquare size={17} />
            <span>Still have a question?</span>
            <Link prefetch={false} href="/submit?type=question">
              Ask the developer <ArrowRight size={15} />
            </Link>
          </div>
        </section>
        <aside className="support-aside">
          <section className="report-card">
            <div className="card-icon">
              <Bug size={24} />
            </div>
            <span className="section-kicker">LET’S FIX IT</span>
            <h2>
              Something
              <br />
              not quite right?
            </h2>
            <p>
              Tell us what happened. Your report goes straight to a private
              inbox.
            </p>
            <Link
              prefetch={false}
              className="primary-link"
              href="/submit?type=issue"
            >
              Report an issue <ArrowRight size={18} />
            </Link>
            <div className="private-note">
              <ShieldCheck size={14} /> Your report stays private
            </div>
          </section>
          <section className="question-card">
            <div className="small-card-title">
              <MessageSquare size={20} />
              <h3>A question, not a bug?</h3>
            </div>
            <p>Settings, setup, or something else. We’re listening.</p>
            <Link prefetch={false} href="/submit?type=question">
              Ask a question <ArrowRight size={16} />
            </Link>
          </section>
          <section className="quick-card">
            <div className="small-card-title">
              <Command size={18} />
              <h3>Quick controls</h3>
            </div>
            <dl>
              <div>
                <dt>Recorder settings</dt>
                <dd>
                  <kbd>F6</kbd>
                </dd>
              </div>
              <div>
                <dt>Start / stop recording</dt>
                <dd>
                  <kbd>F8</kbd>
                </dd>
              </div>
              <div>
                <dt>Pause / resume</dt>
                <dd>
                  <kbd>F9</kbd>
                </dd>
              </div>
            </dl>
            <p>
              <Sparkles size={14} /> Your next great clip starts here.
            </p>
          </section>
        </aside>
      </div>
    </SiteShell>
  );
}

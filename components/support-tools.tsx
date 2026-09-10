'use client';

import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { categories, faqs } from '@/lib/faq';
type Context = {
  registerTool: (
    tool: {
      name: string;
      title: string;
      description: string;
      inputSchema: object;
      annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
      execute: (input: unknown) => unknown;
    },
    options: { signal: AbortSignal },
  ) => void | Promise<void>;
};
export function SupportTools({
  search,
}: {
  search: (query: string, category: string) => void;
}) {
  useEffect(() => {
    const context = (document as Document & { modelContext?: Context })
      .modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(
        context.registerTool(
          {
            name: 'search_support_answers',
            title: 'Search XylemmOBS answers',
            description:
              'Search the recorder knowledge base and show the matching answers in the help center. Does not submit a report.',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', maxLength: 200 },
                category: { type: 'string', enum: [...categories] },
              },
              required: ['query'],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: true, untrustedContentHint: false },
            execute(input) {
              if (!input || typeof input !== 'object' || Array.isArray(input))
                throw new Error('Provide a search query.');
              const data = input as Record<string, unknown>;
              if (
                Object.keys(data).some(
                  (k) => !['query', 'category'].includes(k),
                ) ||
                typeof data.query !== 'string' ||
                data.query.length > 200
              )
                throw new Error(
                  'Query must be a string of at most 200 characters.',
                );
              const category = data.category ?? 'All topics';
              if (!categories.includes(category as (typeof categories)[number]))
                throw new Error('Choose a valid category.');
              const query = data.query;
              const matches = faqs.filter(
                (f) =>
                  (category === 'All topics' || f.category === category) &&
                  (f.question + ' ' + f.answer)
                    .toLowerCase()
                    .includes(query.toLowerCase()),
              );
              flushSync(() => search(query, category as string));
              return { count: matches.length, answers: matches };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch(() => {});
    } catch {
      /* The normal search works when browser tools are unavailable. */
    }
    return () => lifecycle.abort();
  }, [search]);
  return null;
}

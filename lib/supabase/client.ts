'use client';

import { createBrowserClient } from '@supabase/ssr';

// Safe for the browser: the anon key only ever grants what Row Level
// Security in supabase/schema.sql allows. It can never read admin
// notes, change status/priority, or write official responses.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

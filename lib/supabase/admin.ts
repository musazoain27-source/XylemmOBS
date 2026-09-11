import 'server-only';
import { createClient } from '@supabase/supabase-js';

// DANGER: this client uses the service_role key and bypasses Row
// Level Security completely. It must:
//   1. Never be imported from any file that also renders client
//      components or otherwise ships to the browser ('server-only'
//      above makes any accidental client import fail the build).
//   2. Never be used to answer a question like "is this user an
//      admin" based on client-supplied input — that check must always
//      go through requireAdmin() in lib/supabase/server.ts, which
//      derives the role from the authenticated session.
//   3. Only be used for the small set of operations that genuinely
//      need to bypass RLS: generating sequential public IDs via the
//      next_public_id() RPC (which is itself SECURITY DEFINER and
//      safe for anon), writing activity logs, reading/writing
//      admin-only tables from within routes that have ALREADY called
//      requireAdmin(), and writing attachment rows/storage objects
//      from app/api/upload — which is safe ONLY because that route
//      independently re-validates file type, size, and the target
//      issue's existence server-side before ever touching this client.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}

# XylemmOBS Support

A full-stack Q&A, bug-report, and feature-request platform for the XylemmOBS Minecraft recording mod. Built with Next.js, TypeScript, Tailwind CSS, and Supabase (Postgres + Auth + Storage).

Real users can:
- Ask questions, report issues (with screenshots/logs), and request features
- Browse, search, and filter everything that's been submitted
- Reply to threads and upvote feature requests

Admins can securely log in and:
- Answer questions and respond publicly to issues
- Change status/priority, assign issues, mark known issues, link duplicates
- Write private internal notes (never shown publicly)
- Manage feature requests, view attachments/logs, and review an activity log

The `/admin` area is protected end-to-end: middleware re-checks the caller's role against the database on every request, the dashboard layout checks again, and Row Level Security enforces the same rule at the database level. No admin password or secret key ever ships to the browser.

---

## 1. Requirements

- Node.js 18.18 or later (20 LTS recommended)
- A free [Supabase](https://supabase.com) account
- A [Vercel](https://vercel.com) account (for deployment — optional for local dev)

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Create your Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**.
2. Pick a name, a strong database password (save it somewhere safe), and a region.
3. Wait for the project to finish provisioning (~2 minutes).

---

## 4. Set up the database schema

1. In your Supabase project, open **SQL Editor** (left sidebar).
2. Open `supabase/schema.sql` from this repo, copy its entire contents, paste into a new query, and click **Run**.
   This creates every table, enum, index, the `next_public_id()` function (used to generate IDs like `XOBS-0001` safely under concurrent submissions), and all Row Level Security policies.
3. **Optional but recommended:** run `supabase/seed.sql` next (same way) to pre-populate the site with 10 realistic, pre-answered FAQ questions so it isn't empty on first launch.

---

## 5. Set up Storage buckets

1. In Supabase, open **Storage** → **Create a new bucket**.
2. Create a bucket named exactly `screenshots`. Toggle **Public bucket: ON**.
3. Create a second bucket named exactly `logs`. Leave **Public bucket: OFF** (log files can contain local file paths/usernames and are admin-only).
4. Open **SQL Editor** again, paste the contents of `supabase/storage_policies.sql`, and run it. This grants the correct upload/read/delete permissions to each bucket.

---

## 6. Configure authentication

1. In Supabase, open **Authentication → Providers** and make sure **Email** is enabled (it is by default).
2. Open **Authentication → Settings** and, for local development, you can leave "Confirm email" off to simplify testing — turn it back on before going to production if you want extra protection on admin sign-ups.

---

## 7. Environment variables

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```
2. In Supabase, open **Project Settings → API** and fill in `.env.local`:

   | Variable | Where to find it |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → `anon` `public` key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` key — **keep this secret, never commit it or prefix it with `NEXT_PUBLIC_`** |
   | `ADMIN_RATE_LIMIT_SECRET` | Any random string, e.g. run `openssl rand -base64 32` |

---

## 8. Creating your first admin (securely)

There is deliberately no "make me an admin" button anywhere in the app — that would be a security hole. Instead:

1. Run the app locally (`npm run dev`) and go to `http://localhost:3000/admin/login`.
2. Supabase Auth doesn't have a public sign-up form wired into this app on purpose (only login), so create the account directly in Supabase instead:
   - In Supabase, go to **Authentication → Users → Add user → Create new user**.
   - Enter your email and a password. Confirm the user (or disable "Confirm email" first, per step 6).
3. Go to **Table Editor → profiles** in Supabase. A row should already exist for your new user (created automatically — see note below) with `role = user`. If no row exists yet, insert one manually with your `user_id` (copy it from the Authentication → Users list), a `username`, and `role = user`.
4. Open **SQL Editor**, paste the contents of `supabase/promote_admin.sql`, replace `YOUR_ADMIN_EMAIL_HERE` with the email you used, and run it. This flips your `role` to `admin`.
5. Go back to `/admin/login` and sign in. You're now in the dashboard.

To add more admins later, repeat steps 2–4 for each person, or use the same SQL pattern from **Settings** page instructions inside the app.

> **Note on the `profiles` table:** a database trigger (`on_auth_user_created` in `supabase/schema.sql`) automatically creates a matching `profiles` row with `role = 'user'` whenever a new Supabase Auth user is created — you don't need to insert one by hand. If for some reason it's missing (e.g. you ran the schema after already creating users), insert it manually in Table Editor with matching `user_id`, any `username`, and `role = 'user'`.

---

## 9. Run locally

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin/login` for the admin dashboard.

---

## 10. Build for production

```bash
npm run build
npm start
```

---

## 11. Deploying to Vercel

1. Push this project to a GitHub repository.
2. In Vercel, click **Add New → Project** and import the repo.
3. Under **Environment Variables**, add the same four variables from your `.env.local` (Vercel's UI will ask public vs. server automatically based on the `NEXT_PUBLIC_` prefix — just paste all four in).
4. Deploy. Vercel auto-detects Next.js — no extra config needed.
5. Once deployed, repeat the "first admin" steps above using your live Supabase project (they're the same project either way, so if you already created an admin locally, it works in production too).

---

## 12. Project structure

```
app/
  (public)/          # Public-facing pages (home, ask, report, browse, post, etc.)
  admin/
    login/            # Public login page (outside the protected group)
    (dashboard)/       # Everything under here requires a verified admin session
  api/                 # All server-side API routes (questions, issues, features, admin, etc.)
components/            # Shared UI components (badges, cards, forms, admin sidebar, etc.)
lib/
  supabase/            # Browser client, server (session-aware) client, admin (service-role) client
  validation.ts        # Zod schemas for every form/API payload
  rateLimit.ts          # Admin login rate limiting
  server-actions.ts     # Activity log + notification helpers (server-only)
supabase/
  schema.sql           # Full database schema + RLS policies
  storage_policies.sql # Storage bucket policies
  seed.sql              # Optional realistic FAQ seed data
  promote_admin.sql     # One-time script to make a user an admin
types/database.ts       # Hand-written TypeScript types matching the schema
```

---

## 13. Security notes

- **Admin protection is server-side, not client-side.** `middleware.ts` re-derives the caller's role from the database (via the `is_admin()` Postgres function) on every request to `/admin/*` and `/api/admin/*`, before any page or API code runs. The dashboard layout checks again independently. Nothing about "is this an admin" is ever trusted from a cookie value, a client-supplied field, or cached state.
- **Row Level Security is the real boundary.** Even if a bug ever bypassed the middleware or an API route's checks, Postgres RLS policies (see `supabase/schema.sql`) independently block non-admins from reading `admin_notes`, changing `status`/`priority`, writing official replies, or reading other users' data.
- **The service-role key never reaches the browser.** It's used only inside a small number of server-side API routes for specific, validated operations (generating sequential IDs, writing activity logs, handling file uploads after validation) — see the comments in `lib/supabase/admin.ts` for the exact list.
- **Internal admin notes are never queried on any public code path** — not filtered out after fetching, but never requested at all.
- **Log file attachments are private.** They live in a non-public Storage bucket and are only ever readable through an authenticated admin request that issues a short-lived signed URL (`/api/admin/attachments/[id]/url`).
- **Passwords are never handled by this app's own code.** Admin login uses Supabase Auth's `signInWithPassword`, which hashes and stores credentials server-side; this app only ever sees a secure session cookie afterward.
- **Rate limiting** on `/api/admin/login` is a best-effort in-memory speed bump layered on top of Supabase Auth's own built-in brute-force protection. For high-traffic production use, consider swapping in a distributed limiter (e.g. Upstash Redis) — the interface in `lib/rateLimit.ts` is a drop-in replacement point.

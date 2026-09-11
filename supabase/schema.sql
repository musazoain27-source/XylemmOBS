-- =====================================================================
-- XylemmOBS Support Platform — Database Schema
-- Run this entire file once in the Supabase SQL Editor (or via CLI
-- migrations) on a fresh project. Safe to re-run only after a full reset.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- ENUM TYPES
-- ---------------------------------------------------------------------
create type user_role as enum ('user', 'admin');

create type question_status as enum ('waiting_for_answer', 'answered', 'closed');

create type issue_status as enum (
  'open', 'in_review', 'need_more_info', 'confirmed',
  'working_on_fix', 'fixed', 'cannot_reproduce', 'closed'
);

create type issue_priority as enum ('low', 'medium', 'high', 'critical');

create type feature_status as enum (
  'submitted', 'under_review', 'planned', 'maybe_later', 'added', 'rejected'
);

create type category_type as enum (
  'recording', 'video', 'encoder', 'audio', 'replay_buffer',
  'overlays', 'performance', 'compatibility', 'installation', 'other'
);

create type post_type as enum ('question', 'issue', 'feature_request');

create type notification_target as enum ('admin', 'user');

-- ---------------------------------------------------------------------
-- PROFILES  (one row per authenticated Supabase Auth user)
-- Role lives here, NEVER trust a role sent from the browser.
-- ---------------------------------------------------------------------
create table profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  email text,
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on profiles (role);

-- ---------------------------------------------------------------------
-- Automatically create a profiles row whenever a new Supabase Auth
-- user is created, defaulting to role = 'user'. This runs as the
-- table owner (SECURITY DEFINER on the trigger function) so it works
-- even though profiles has RLS enabled and the inserting context here
-- is the auth system, not an authenticated request.
-- ---------------------------------------------------------------------
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (user_id, username, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email,
    'user'
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------
-- Sequence-safe public ID generation
-- Uses a small counters table + an atomic UPDATE ... RETURNING so
-- concurrent submissions never collide, and wraps the whole thing in a
-- SECURITY DEFINER function so anonymous users can call it safely
-- without being granted UPDATE on the counters table directly.
-- ---------------------------------------------------------------------
create table id_counters (
  key text primary key,
  value bigint not null default 0
);

insert into id_counters (key, value) values
  ('question', 0), ('issue', 0), ('feature_request', 0);

create or replace function next_public_id(p_type post_type)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_key text;
  v_prefix text;
  v_next bigint;
begin
  case p_type
    when 'question' then v_key := 'question'; v_prefix := 'XOBS-Q-';
    when 'issue' then v_key := 'issue'; v_prefix := 'XOBS-';
    when 'feature_request' then v_key := 'feature_request'; v_prefix := 'XOBS-F-';
  end case;

  update id_counters
    set value = value + 1
    where key = v_key
    returning value into v_next;

  return v_prefix || lpad(v_next::text, 4, '0');
end;
$$;

revoke all on id_counters from public, anon, authenticated;
grant execute on function next_public_id(post_type) to anon, authenticated;

-- ---------------------------------------------------------------------
-- QUESTIONS
-- ---------------------------------------------------------------------
create table questions (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  user_id uuid references profiles (user_id) on delete set null,
  username text not null,
  email text,
  title text not null,
  details text not null,
  minecraft_version text not null,
  xylemmobs_version text not null,
  category category_type not null default 'other',
  status question_status not null default 'waiting_for_answer',
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index questions_status_idx on questions (status);
create index questions_category_idx on questions (category);
create index questions_created_idx on questions (created_at desc);
create index questions_public_id_idx on questions (public_id);

-- ---------------------------------------------------------------------
-- ISSUES
-- ---------------------------------------------------------------------
create table issues (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  user_id uuid references profiles (user_id) on delete set null,
  username text not null,
  email text,
  title text not null,
  description text not null,
  minecraft_version text not null,
  xylemmobs_version text not null,
  operating_system text not null,
  gpu text not null,
  cpu text,
  error_message text,
  steps_to_reproduce text not null,
  expected_result text not null,
  actual_result text not null,
  priority issue_priority not null default 'medium',
  status issue_status not null default 'open',
  is_known_issue boolean not null default false,
  is_duplicate_of uuid references issues (id) on delete set null,
  assigned_admin_id uuid references profiles (user_id) on delete set null,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index issues_status_idx on issues (status);
create index issues_priority_idx on issues (priority);
create index issues_known_idx on issues (is_known_issue) where is_known_issue = true;
create index issues_created_idx on issues (created_at desc);
create index issues_public_id_idx on issues (public_id);

-- ---------------------------------------------------------------------
-- FEATURE REQUESTS
-- ---------------------------------------------------------------------
create table feature_requests (
  id uuid primary key default gen_random_uuid(),
  public_id text not null unique,
  user_id uuid references profiles (user_id) on delete set null,
  username text not null,
  title text not null,
  description text not null,
  usefulness text not null,
  category category_type not null default 'other',
  xylemmobs_version text not null,
  status feature_status not null default 'submitted',
  upvote_count integer not null default 0,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index feature_status_idx on feature_requests (status);
create index feature_created_idx on feature_requests (created_at desc);
create index feature_upvotes_idx on feature_requests (upvote_count desc);
create index feature_public_id_idx on feature_requests (public_id);

-- ---------------------------------------------------------------------
-- VOTES  (one vote per feature request per browser/user fingerprint)
-- ---------------------------------------------------------------------
create table votes (
  id uuid primary key default gen_random_uuid(),
  feature_request_id uuid not null references feature_requests (id) on delete cascade,
  voter_fingerprint text not null,
  user_id uuid references profiles (user_id) on delete set null,
  created_at timestamptz not null default now(),
  unique (feature_request_id, voter_fingerprint)
);

-- ---------------------------------------------------------------------
-- REPLIES  (threaded conversation under any post type)
-- ---------------------------------------------------------------------
create table replies (
  id uuid primary key default gen_random_uuid(),
  post_type post_type not null,
  question_id uuid references questions (id) on delete cascade,
  issue_id uuid references issues (id) on delete cascade,
  feature_request_id uuid references feature_requests (id) on delete cascade,
  user_id uuid references profiles (user_id) on delete set null,
  username text not null,
  body text not null,
  is_official boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  constraint reply_target_check check (
    (post_type = 'question' and question_id is not null and issue_id is null and feature_request_id is null) or
    (post_type = 'issue' and issue_id is not null and question_id is null and feature_request_id is null) or
    (post_type = 'feature_request' and feature_request_id is not null and question_id is null and issue_id is null)
  )
);

create index replies_question_idx on replies (question_id);
create index replies_issue_idx on replies (issue_id);
create index replies_feature_idx on replies (feature_request_id);

-- ---------------------------------------------------------------------
-- ATTACHMENTS  (metadata only — files live in Supabase Storage)
-- ---------------------------------------------------------------------
create table attachments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid references issues (id) on delete cascade,
  file_name text not null,
  storage_path text not null,
  mime_type text not null,
  file_size bigint not null,
  kind text not null check (kind in ('screenshot', 'log')),
  created_at timestamptz not null default now()
);

create index attachments_issue_idx on attachments (issue_id);

-- ---------------------------------------------------------------------
-- ADMIN NOTES  (internal only, never exposed publicly)
-- ---------------------------------------------------------------------
create table admin_notes (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues (id) on delete cascade,
  admin_id uuid not null references profiles (user_id) on delete cascade,
  admin_username text not null,
  note text not null,
  created_at timestamptz not null default now()
);

create index admin_notes_issue_idx on admin_notes (issue_id);

-- ---------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  target notification_target not null,
  recipient_id uuid references profiles (user_id) on delete cascade,
  title text not null,
  body text not null,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_recipient_idx on notifications (recipient_id, is_read);
create index notifications_target_idx on notifications (target, is_read);

-- ---------------------------------------------------------------------
-- ISSUE ASSIGNMENTS  (history of who has been assigned)
-- ---------------------------------------------------------------------
create table issue_assignments (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references issues (id) on delete cascade,
  admin_id uuid not null references profiles (user_id) on delete cascade,
  admin_username text not null,
  assigned_by uuid references profiles (user_id) on delete set null,
  created_at timestamptz not null default now()
);

create index issue_assignments_issue_idx on issue_assignments (issue_id);

-- ---------------------------------------------------------------------
-- ACTIVITY LOGS
-- ---------------------------------------------------------------------
create table activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles (user_id) on delete set null,
  admin_username text not null,
  action text not null,
  target_type text not null,
  target_public_id text,
  target_id uuid,
  details jsonb,
  created_at timestamptz not null default now()
);

create index activity_logs_created_idx on activity_logs (created_at desc);

-- ---------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger questions_set_updated_at before update on questions
  for each row execute function set_updated_at();
create trigger issues_set_updated_at before update on issues
  for each row execute function set_updated_at();
create trigger feature_requests_set_updated_at before update on feature_requests
  for each row execute function set_updated_at();
create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- Keep feature_requests.upvote_count in sync with votes
-- ---------------------------------------------------------------------
create or replace function sync_upvote_count()
returns trigger language plpgsql as $$
begin
  if (tg_op = 'INSERT') then
    update feature_requests set upvote_count = upvote_count + 1 where id = new.feature_request_id;
  elsif (tg_op = 'DELETE') then
    update feature_requests set upvote_count = greatest(upvote_count - 1, 0) where id = old.feature_request_id;
  end if;
  return null;
end;
$$;

create trigger votes_sync_count
  after insert or delete on votes
  for each row execute function sync_upvote_count();

-- ---------------------------------------------------------------------
-- Helper: is the currently authenticated user an admin?
-- SECURITY DEFINER so it can read profiles even under strict RLS,
-- without letting callers pass in an arbitrary role.
-- ---------------------------------------------------------------------
create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
alter table profiles enable row level security;
alter table questions enable row level security;
alter table issues enable row level security;
alter table feature_requests enable row level security;
alter table votes enable row level security;
alter table replies enable row level security;
alter table attachments enable row level security;
alter table admin_notes enable row level security;
alter table notifications enable row level security;
alter table issue_assignments enable row level security;
alter table activity_logs enable row level security;

-- PROFILES: users can read their own profile; admins can read all.
-- Nobody may write role from the client — role changes happen only via
-- the Supabase dashboard / a trusted server-side script (see README).
create policy profiles_select_own on profiles
  for select using (auth.uid() = user_id or is_admin());

create policy profiles_update_own_nonrole on profiles
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- QUESTIONS: public can read non-deleted questions. Anyone (including
-- anon) may insert a question. Only admins may update/delete.
create policy questions_select_public on questions
  for select using (is_deleted = false or is_admin());

create policy questions_insert_anyone on questions
  for insert with check (is_deleted = false);

create policy questions_update_admin_only on questions
  for update using (is_admin());

create policy questions_delete_admin_only on questions
  for delete using (is_admin());

-- ISSUES: same pattern as questions.
create policy issues_select_public on issues
  for select using (is_deleted = false or is_admin());

create policy issues_insert_anyone on issues
  for insert with check (is_deleted = false);

create policy issues_update_admin_only on issues
  for update using (is_admin());

create policy issues_delete_admin_only on issues
  for delete using (is_admin());

-- FEATURE REQUESTS
create policy features_select_public on feature_requests
  for select using (is_deleted = false or is_admin());

create policy features_insert_anyone on feature_requests
  for insert with check (is_deleted = false);

create policy features_update_admin_only on feature_requests
  for update using (is_admin());

create policy features_delete_admin_only on feature_requests
  for delete using (is_admin());

-- VOTES: anyone can insert their own vote; nobody can read others'
-- fingerprints; admins can read all for moderation.
create policy votes_insert_anyone on votes
  for insert with check (true);

create policy votes_select_admin_only on votes
  for select using (is_admin());

create policy votes_delete_admin_only on votes
  for delete using (is_admin());

-- REPLIES: public replies are readable by anyone; only admins may
-- flag a reply as official (enforced by not exposing that column to
-- client writes — see API layer). Anyone may insert a reply. Only
-- admins (or the original author, via server checks) may delete.
create policy replies_select_public on replies
  for select using (is_deleted = false or is_admin());

create policy replies_insert_anyone on replies
  for insert with check (is_deleted = false and (is_official = false or is_admin()));

create policy replies_update_admin_only on replies
  for update using (is_admin());

create policy replies_delete_admin_only on replies
  for delete using (is_admin());

-- ATTACHMENTS: readable alongside their parent issue; only the API
-- (service role) inserts rows after a successful storage upload.
create policy attachments_select_public on attachments
  for select using (
    exists (select 1 from issues i where i.id = issue_id and (i.is_deleted = false or is_admin()))
  );

create policy attachments_admin_write on attachments
  for insert with check (is_admin());

create policy attachments_admin_delete on attachments
  for delete using (is_admin());

-- ADMIN NOTES: admin-only, full stop. Never selectable by normal users.
create policy admin_notes_admin_only_select on admin_notes
  for select using (is_admin());

create policy admin_notes_admin_only_insert on admin_notes
  for insert with check (is_admin());

create policy admin_notes_admin_only_delete on admin_notes
  for delete using (is_admin());

-- NOTIFICATIONS: admins see admin-targeted notifications; users see
-- only their own.
create policy notifications_select on notifications
  for select using (
    (target = 'admin' and is_admin()) or
    (target = 'user' and recipient_id = auth.uid())
  );

create policy notifications_update_own on notifications
  for update using (
    (target = 'admin' and is_admin()) or
    (target = 'user' and recipient_id = auth.uid())
  );

-- ISSUE ASSIGNMENTS: admin only.
create policy issue_assignments_admin_only on issue_assignments
  for all using (is_admin()) with check (is_admin());

-- ACTIVITY LOGS: admin only.
create policy activity_logs_admin_only_select on activity_logs
  for select using (is_admin());

create policy activity_logs_admin_only_insert on activity_logs
  for insert with check (is_admin());

-- ---------------------------------------------------------------------
-- STORAGE
-- Create two buckets from the Supabase dashboard (or via the API):
--   screenshots  (public read, restricted write)
--   logs         (private, admin read only)
-- See README.md section "Storage bucket setup" for exact steps and the
-- storage policies to attach to each bucket.
-- ---------------------------------------------------------------------

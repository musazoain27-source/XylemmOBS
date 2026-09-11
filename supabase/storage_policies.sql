-- =====================================================================
-- Storage policies
-- Run AFTER you have created the two buckets in the Supabase dashboard:
--   - "screenshots"  (Public bucket: ON)
--   - "logs"          (Public bucket: OFF)
-- Storage > Policies > New Policy > "For full customization" for each.
-- =====================================================================

-- SCREENSHOTS bucket: anyone can upload (issue reporters are often
-- anonymous), anyone can view (they're meant to be shown publicly on
-- the issue page), only admins can delete.
create policy "screenshots_insert_anyone"
  on storage.objects for insert
  with check (bucket_id = 'screenshots');

create policy "screenshots_select_anyone"
  on storage.objects for select
  using (bucket_id = 'screenshots');

create policy "screenshots_delete_admin_only"
  on storage.objects for delete
  using (bucket_id = 'screenshots' and is_admin());

-- LOGS bucket: anyone can upload (as part of submitting a report), but
-- ONLY admins can read or delete them back out — log files can contain
-- sensitive local file paths / usernames, so they are not public.
create policy "logs_insert_anyone"
  on storage.objects for insert
  with check (bucket_id = 'logs');

create policy "logs_select_admin_only"
  on storage.objects for select
  using (bucket_id = 'logs' and is_admin());

create policy "logs_delete_admin_only"
  on storage.objects for delete
  using (bucket_id = 'logs' and is_admin());

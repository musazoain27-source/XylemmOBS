-- =====================================================================
-- Run this ONCE, manually, in the Supabase SQL Editor, to promote the
-- account you just signed up with into an admin. Replace the email
-- below with the exact email you used to sign up on /admin/login
-- (see README "Creating the first admin securely").
-- =====================================================================
update profiles
set role = 'admin'
where user_id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL_HERE');

-- Verify it worked:
select user_id, username, email, role from profiles where role = 'admin';

-- Migration 055: Fix users INSERT policy
-- The handle_new_user trigger runs as SECURITY DEFINER but RLS still applies.
-- SECURITY DEFINER functions bypass RLS only if the function owner has BYPASSRLS.
-- In Supabase, the postgres user has BYPASSRLS, so we need to ensure the function
-- is owned by postgres and that RLS doesn't block the insert.

-- The real fix: SECURITY DEFINER functions owned by postgres SHOULD bypass RLS.
-- But there's a catch - the auth.uid() returns NULL during the trigger execution
-- because there's no authenticated session yet (user is being created).

-- Solution 1: Ensure the insert policy allows inserts where id matches
-- a valid auth.users record (which will exist because the trigger fires AFTER INSERT)

-- Drop existing policies
DROP POLICY IF EXISTS users_insert_own ON users;
DROP POLICY IF EXISTS users_trigger_insert ON users;

-- 1. Allow authenticated users to insert their own record (fallback for profile setup)
CREATE POLICY users_insert_own ON users
FOR INSERT 
TO authenticated
WITH CHECK (id = (SELECT auth.uid()));

-- 2. Allow inserts from triggers/functions where the user id exists in auth.users
-- This handles the case where handle_new_user trigger fires
CREATE POLICY users_trigger_insert ON users
FOR INSERT
WITH CHECK (
  -- Allow if the id being inserted exists in auth.users
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = users.id)
);

-- Ensure the trigger function owner is postgres (which has BYPASSRLS)
ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

-- Also fix notification_preferences which has the same issue
DROP POLICY IF EXISTS notification_preferences_trigger_insert ON notification_preferences;
CREATE POLICY notification_preferences_trigger_insert ON notification_preferences
FOR INSERT
WITH CHECK (
  EXISTS (SELECT 1 FROM auth.users WHERE auth.users.id = notification_preferences.user_id)
);

ALTER FUNCTION public.create_notification_preferences_for_new_user() OWNER TO postgres;

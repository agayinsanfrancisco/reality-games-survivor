-- ============================================
-- FIX USERS SELECT POLICY
-- ============================================
-- The 406 error indicates users cannot read their own profile.
-- This migration ensures authenticated users can always read their own row.

-- Drop existing select policies for users
DROP POLICY IF EXISTS users_select_own ON users;
DROP POLICY IF EXISTS users_select_admin ON users;
DROP POLICY IF EXISTS users_select_league_mates ON users;

-- 1. Allow users to select their own row (most important)
CREATE POLICY users_select_own ON users
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

-- 2. Allow admins to select all users
CREATE POLICY users_select_admin ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = (SELECT auth.uid()) 
      AND u.role = 'admin'
    )
  );

-- 3. Allow users to select league mates (for leaderboards, etc.)
CREATE POLICY users_select_league_mates ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM league_members lm1
      JOIN league_members lm2 ON lm1.league_id = lm2.league_id
      WHERE lm1.user_id = (SELECT auth.uid()) 
      AND lm2.user_id = users.id
    )
  );

-- Also fix episodes, draft_rankings which are also showing 406 errors
-- These should be readable by all authenticated users

-- Drop and recreate episodes SELECT policy
DROP POLICY IF EXISTS episodes_select_all ON episodes;
DROP POLICY IF EXISTS episodes_select ON episodes;

CREATE POLICY episodes_select_all ON episodes
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Drop and recreate draft_rankings SELECT policy
DROP POLICY IF EXISTS draft_rankings_select_own ON draft_rankings;

CREATE POLICY draft_rankings_select_own ON draft_rankings
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Ensure service role can bypass all policies
DROP POLICY IF EXISTS service_bypass_episodes ON episodes;
CREATE POLICY service_bypass_episodes ON episodes
  FOR ALL
  USING ((SELECT auth.role()) = 'service_role');

DROP POLICY IF EXISTS service_bypass_draft_rankings ON draft_rankings;
CREATE POLICY service_bypass_draft_rankings ON draft_rankings
  FOR ALL
  USING ((SELECT auth.role()) = 'service_role');

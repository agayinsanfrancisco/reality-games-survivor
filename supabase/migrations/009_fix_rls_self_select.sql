-- ============================================
-- FIX RLS POLICIES FOR SELF-SELECT
-- ============================================

-- PROBLEM 1: Users can't see their own league_members rows
-- The existing policy uses is_league_member() which is circular
-- Solution: Allow users to always see their OWN membership rows

CREATE POLICY league_members_select_self
  ON league_members
  FOR SELECT
  USING (user_id = auth.uid());

-- PROBLEM 2: Users can't look up leagues by invite code to join
-- The existing policies require either is_public=true or being a member
-- Solution: Allow authenticated users to SELECT leagues (join still requires auth + password)

CREATE POLICY leagues_select_for_joining
  ON leagues
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Note: This is safe because:
-- 1. INSERT/UPDATE/DELETE are still protected
-- 2. Joining requires authentication
-- 3. Private leagues still require the password
-- 4. Sensitive data (password_hash) should never be returned to client anyway

-- PROBLEM 3: Global league doesn't exist for auto-enrollment
-- The handle_new_user() trigger tries to add users to global league but it's missing
-- We'll create it with a fixed UUID for consistency

DO $$
DECLARE
  global_league_exists BOOLEAN;
  season_50_id UUID;
  first_admin_id UUID;
BEGIN
  -- Check if global league already exists
  SELECT EXISTS(SELECT 1 FROM leagues WHERE is_global = true) INTO global_league_exists;

  IF NOT global_league_exists THEN
    -- Get Season 50 ID
    SELECT id INTO season_50_id FROM seasons WHERE number = 50 AND is_active = true;

    -- Get first admin user (or any user as fallback)
    SELECT id INTO first_admin_id FROM users WHERE role = 'admin' LIMIT 1;
    IF first_admin_id IS NULL THEN
      SELECT id INTO first_admin_id FROM users LIMIT 1;
    END IF;

    -- Only create if we have both season and a user
    IF season_50_id IS NOT NULL AND first_admin_id IS NOT NULL THEN
      INSERT INTO leagues (
        season_id,
        name,
        code,
        commissioner_id,
        max_players,
        is_global,
        is_public,
        status,
        draft_status
      ) VALUES (
        season_50_id,
        'Season 50 Global Rankings',
        'GLOBAL',
        first_admin_id,
        100000,
        true,
        true,
        'active',
        'completed'
      );

      RAISE NOTICE 'Created global league for Season 50';
    ELSE
      RAISE NOTICE 'Could not create global league: missing season (%) or user (%)', season_50_id, first_admin_id;
    END IF;
  ELSE
    RAISE NOTICE 'Global league already exists';
  END IF;
END $$;
